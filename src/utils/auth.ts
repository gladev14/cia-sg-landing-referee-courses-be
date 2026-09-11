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
 * Wrapper autorizzato per chiamate fetch verso il backend
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.pathname;
  } else if (typeof Request !== 'undefined' && input instanceof Request) {
    url = input.url;
  }

  const isApiRequest = url.startsWith('/api') || url.includes('/api/');
  const isLoginEndpoint = url.includes('/api/auth/login');

  let finalInit: RequestInit = init ? { ...init } : {};

  if (isApiRequest && !isLoginEndpoint) {
    const token = getStoredToken();
    if (token) {
      const headers = new Headers(
        finalInit.headers || (typeof Request !== 'undefined' && input instanceof Request ? input.headers : {})
      );
      if (!headers.has('Authorization') && !headers.has('x-api-key')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      finalInit.headers = headers;
    }
  }

  const response = await window.fetch(input, finalInit);

  // Se l'API restituisce 401 e non è il tentativo di login stesso, segnala sessione non valida
  if (response.status === 401 && isApiRequest && !isLoginEndpoint) {
    clearStoredToken();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  return response;
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
    const res = await window.fetch('/api/auth/status', {
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
      await window.fetch('/api/auth/logout', {
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
 * Tenta di installare in modo sicuro l'intercettore solo se window.fetch è configurabile
 */
export function initAuthInterceptor(): void {
  if (typeof window === 'undefined') return;

  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    // Se ha solo un getter e non è configurabile, non sovrascrivere direttamente window.fetch
    if (desc && !desc.writable && !desc.set && !desc.configurable) {
      return;
    }

    const originalFetch = window.fetch;
    if (!originalFetch) return;

    // Sovrascrittura controllata protetta da try/catch
    try {
      window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        return authFetch(input, init);
      };
    } catch {
      // In ambienti sandbox o iframe dove window.fetch ha solo un getter, ignora l'errore
    }
  } catch {
    // Silenzioso
  }
}
