import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface Session {
  token: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory session store (valida per sessioni browser)
const activeSessions = new Map<string, Session>();

// Durata sessione browser: 7 giorni
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function getAdminApiKey(): string {
  return process.env.ADMIN_API_KEY || 'cia-arbitri-2026';
}

/**
 * Valida un token di sessione o una API Key
 */
export function validateTokenOrKey(tokenOrKey: string | undefined): { valid: boolean; role?: string } {
  if (!tokenOrKey) {
    return { valid: false };
  }

  const clean = tokenOrKey.trim();
  const adminKey = getAdminApiKey().trim();

  // 1. Verifica corrispondenza diretta con la chiave amministratore
  if (clean === adminKey) {
    return { valid: true, role: 'admin' };
  }

  // 2. Verifica token di sessione attivo
  const session = activeSessions.get(clean);
  if (session) {
    if (Date.now() < session.expiresAt) {
      return { valid: true, role: session.role };
    }
    // Sessione scaduta
    activeSessions.delete(clean);
  }

  return { valid: false };
}

/**
 * Estrae il token / API key dalla richiesta HTTP
 * Supporta:
 * - Header "Authorization: Bearer <token>"
 * - Header "x-api-key: <key>"
 * - Header "X-API-KEY: <key>"
 * - Query param "api_key" o "token"
 */
export function extractAuthToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }
    // Se inviato come header Authorization diretto
    return authHeader;
  }

  const xApiKey = req.headers['x-api-key'] || req.headers['x-auth-token'];
  if (typeof xApiKey === 'string') {
    return xApiKey;
  }

  if (typeof req.query.api_key === 'string') {
    return req.query.api_key;
  }

  if (typeof req.query.token === 'string') {
    return req.query.token;
  }

  return undefined;
}

/**
 * Middleware di autorizzazione Express
 * Blocca qualsiasi richiesta sprovvista di autorizzazione valida con HTTP 401
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractAuthToken(req);
  const result = validateTokenOrKey(token);

  if (!result.valid) {
    return res.status(401).json({
      success: false,
      error: 'Non autorizzato: autenticazione richiesta. Fornisci un Bearer Token o header x-api-key valido per operare.',
      requiresAuth: true,
    });
  }

  (req as any).user = { role: result.role || 'admin' };
  next();
}

/**
 * Controller di login per il browser (o per ottenere un session token)
 */
export function handleLogin(req: Request, res: Response) {
  try {
    const { password, apiKey, credential } = req.body || {};
    const inputKey = (password || apiKey || credential || '').toString().trim();

    const adminKey = getAdminApiKey().trim();

    if (!inputKey) {
      return res.status(400).json({
        success: false,
        error: 'Inserisci la password amministratore o la chiave API.',
      });
    }

    if (inputKey !== adminKey) {
      return res.status(401).json({
        success: false,
        error: 'Chiave di autorizzazione o password non valida.',
      });
    }

    // Genera token di sessione univoco
    const sessionToken = `cia_sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + SESSION_DURATION_MS;

    activeSessions.set(sessionToken, {
      token: sessionToken,
      role: 'admin',
      createdAt: Date.now(),
      expiresAt,
    });

    res.json({
      success: true,
      message: 'Autenticazione avvenuta con successo',
      token: sessionToken,
      apiKey: adminKey,
      role: 'admin',
      expiresAt,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Errore durante l\'autenticazione',
    });
  }
}

/**
 * Verifica lo stato di autenticazione corrente
 */
export function handleAuthStatus(req: Request, res: Response) {
  const token = extractAuthToken(req);
  const result = validateTokenOrKey(token);

  res.json({
    authenticated: result.valid,
    role: result.role || null,
  });
}

/**
 * Logout / invalidazione sessione
 */
export function handleLogout(req: Request, res: Response) {
  const token = extractAuthToken(req);
  if (token && activeSessions.has(token)) {
    activeSessions.delete(token);
  }

  res.json({
    success: true,
    message: 'Disconnessione completata con successo.',
  });
}
