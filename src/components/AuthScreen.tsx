import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ArrowRight, AlertCircle, KeyRound, Terminal, CheckCircle2 } from 'lucide-react';
import { setStoredToken } from '../utils/auth';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [credential, setCredential] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = credential.trim();
    if (!cleanKey) {
      setErrorMessage('Inserisci la chiave API o la password amministratore.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleanKey }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Credenziale di autorizzazione non valida.');
      }

      // Salva token nella sessione o local storage
      setStoredToken(data.token, rememberMe);
      onAuthenticated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore durante la verifica delle credenziali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaultKey = () => {
    setCredential('cia-arbitri-2026');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Sfondo geometrico discreto */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <Shield className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Accesso Riservato
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Portale SMTP & Notifiche Corsi Arbitri (CIA)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          <div className="mb-6 p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-start space-x-3 text-xs text-blue-200">
            <Lock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold block text-white mb-0.5">Controllo Accessi Attivo</span>
              L'invio delle email e l'interazione con gli endpoint API richiedono autenticazione autorizzata per impedire utilizzi non autorizzati.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="auth-credential" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Chiave di Autorizzazione / Password</span>
                <button
                  type="button"
                  onClick={handleUseDefaultKey}
                  className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Usa predefinita</span>
                </button>
              </label>

              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="auth-credential"
                  name="credential"
                  type={showKey ? 'text' : 'password'}
                  required
                  autoFocus
                  autoComplete="current-password"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="Inserisci password o ADMIN_API_KEY..."
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                  aria-label={showKey ? 'Nascondi chiave' : 'Mostra chiave'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-start space-x-2 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <span className="ml-2">Resta collegato su questo browser</span>
              </label>
            </div>

            <div>
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Accedi al Portale</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Guida Rapida API */}
          <div className="mt-6 pt-6 border-t border-slate-700/60 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Autorizzazione Chiamate API (cURL / Backend):</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Per chiamare le API programmaticamente, includi l'header:
            </p>
            <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 border border-slate-800 break-all select-all">
              Authorization: Bearer cia-arbitri-2026
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Configurabile via variabile d'ambiente <code className="text-slate-400">ADMIN_API_KEY</code> nel file <code className="text-slate-400">.env</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
