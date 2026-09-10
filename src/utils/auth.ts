/**
 * Gestione Token di Autenticazione e wrapper fetch autorizzato
 */

const STORAGE_KEY = 'cia_smtp_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string, remember = true): void {
  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, token);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, token);
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Impossibile salvare il token:', err);
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Impossibile rimuovere il token:', err);
  }
}

/**
 * Verifica con il backend se il token memorizzato è ancora valido
 */
export async function checkAuthStatus(): Promise<{ authenticated: boolean; role?: string }> {
  const token = getStoredToken();
  if (!token) {
    return { authenticated: false };
  }

  try {
    const res = await fetch('/api/auth/status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { authenticated: false };
    }

    const data = await res.json();
    return {
      authenticated: Boolean(data.authenticated),
      role: data.role,
    };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Esegue il logout chiamando il server e pulendo lo storage
 */
export async function performLogout(): Promise<void> {
  const token = getStoredToken();
  try {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // ignore
  } finally {
    clearStoredToken();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
}

/**
 * Installa un intercettore su window.fetch per iniettare l'header
 * Authorization automaticamente in tutte le chiamate ad /api/*
 */
let interceptorInstalled = false;

export function initAuthInterceptor(): void {
  if (interceptorInstalled || typeof window === 'undefined') return;
  interceptorInstalled = true;

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.pathname;
    } else if (input instanceof Request) {
      url = input.url;
    }

    const isApiRequest = url.startsWith('/api') || url.includes('/api/');
    const isLoginEndpoint = url.includes('/api/auth/login');

    if (isApiRequest && !isLoginEndpoint) {
      const token = getStoredToken();
      if (token) {
        init = init || {};
        const headers = new Headers(init.headers || (input instanceof Request ? input.headers : {}));
        if (!headers.has('Authorization') && !headers.has('x-api-key')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init.headers = headers;
      }
    }

    const response = await originalFetch(input, init);

    // Se l'API restituisce 401 e non è il tentativo di login stesso, segnala sessione non valida
    if (response.status === 401 && isApiRequest && !isLoginEndpoint) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return response;
  };
}

/**
 * Wrapper alternativo esplicito
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return window.fetch(input, init);
}
