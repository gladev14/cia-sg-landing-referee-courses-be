import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ShieldCheck, Key, Lock } from 'lucide-react';
import { getStoredToken } from '../utils/auth';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const currentToken = getStoredToken() || 'cia-arbitri-2026';

  const curlExample = `curl -X POST http://localhost:3000/api/sendCourseInfoRequest \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${currentToken}" \\
  -d '{
    "region": "Lombardia",
    "name": "Gianluca",
    "surname": "Atzeni",
    "city": "Milano",
    "mail": "gianluca.atzeni2000@gmail.com",
    "telephone": "+39 340 1234567"
  }'`;

  const copyToClipboard = async (text: string, isCurl = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isCurl) {
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 2000);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Autorizzazione & Chiavi API</h3>
              <p className="text-xs text-slate-500">Credenziali attive per chiamate programmatiche</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sessione Browser Autenticata (Ruolo: <strong>Admin</strong>)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Token Attivo / Chiave Amministratore:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={currentToken}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 select-all"
              />
              <button
                onClick={() => copyToClipboard(currentToken)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1 shrink-0 transition-colors"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copiato' : 'Copia'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Esempio cURL con Autorizzazione:</span>
              </label>
              <button
                onClick={() => copyToClipboard(curlExample, true)}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurl ? 'Copiato' : 'Copia cURL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl text-xs font-mono overflow-x-auto select-all leading-relaxed">
              {curlExample}
            </pre>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Header Supportati per le chiamate API:</span>
            </div>
            <p className="text-[11px]">• <code className="text-slate-800 font-mono">Authorization: Bearer &lt;chiave&gt;</code></p>
            <p className="text-[11px]">• <code className="text-slate-800 font-mono">x-api-key: &lt;chiave&gt;</code></p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
