import React from 'react';
import { History, CheckCircle2, XCircle, ExternalLink, RefreshCw, Mail, Clock } from 'lucide-react';
import { EmailLogEntry } from '../types/mail';

interface SentLogsProps {
  logs: EmailLogEntry[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const SentLogs: React.FC<SentLogsProps> = ({ logs, onRefresh, isLoading }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Registro Consegne & Log SMTP</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Storico delle email inviate dal servizio con identificativo di consegna e link di anteprima reale.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Ricarica Storico</span>
        </button>
      </div>

      {/* Tabella Log */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Stato</th>
                  <th className="px-4 py-3">Destinatario (To)</th>
                  <th className="px-4 py-3">Oggetto Renderizzato</th>
                  <th className="px-4 py-3">Host SMTP</th>
                  <th className="px-4 py-3">Data / Ora</th>
                  <th className="px-4 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.success ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Inviata</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Fallita</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 font-mono">
                      {log.to}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                      {log.subject}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {log.smtpHost}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {log.previewUrl ? (
                        <a
                          href={log.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <span>Apri Anteprima</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : log.error ? (
                        <span className="text-rose-600 truncate max-w-xs block" title={log.error}>
                          {log.error}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">
                          {log.messageId ? log.messageId.substring(0, 16) + '...' : 'OK'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Nessuna email inviata finora</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Utilizza il tab "Invia Email & Test" per effettuare il primo invio di prova con parametri dinamici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
