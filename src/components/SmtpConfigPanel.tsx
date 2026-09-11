import React, { useState } from 'react';
import {
  Server,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Lock,
  Mail,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { authFetch } from '../utils/auth';

interface SmtpConfigPanelProps {
  status: {
    isConfigured: boolean;
    mode: string;
    config: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      hasPassword: boolean;
      from?: string;
    };
  } | null;
  onRefreshStatus: () => void;
}

export const SmtpConfigPanel: React.FC<SmtpConfigPanelProps> = ({ status, onRefreshStatus }) => {
  // Test connection form state
  const [testHost, setTestHost] = useState('');
  const [testPort, setTestPort] = useState(587);
  const [testSecure, setTestSecure] = useState(false);
  const [testUser, setTestUser] = useState('');
  const [testPass, setTestPass] = useState('');
  const [testFrom, setTestFrom] = useState('');

  const [isTesting, setIsTesting] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    isTestMode?: boolean;
    error?: string;
  } | null>(null);

  // Ethereal generator state
  const [isGeneratingEthereal, setIsGeneratingEthereal] = useState(false);
  const [etherealAccount, setEtherealAccount] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Test della connessione SMTP
  const handleVerifyConnection = async () => {
    setIsTesting(true);
    setVerifyResult(null);

    const configOverride: any = {};
    if (testHost) configOverride.host = testHost;
    if (testPort) configOverride.port = Number(testPort);
    configOverride.secure = testSecure;
    if (testUser) configOverride.user = testUser;
    if (testPass) configOverride.pass = testPass;
    if (testFrom) configOverride.from = testFrom;

    try {
      const res = await authFetch('/api/smtp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpConfig: Object.keys(configOverride).length > 0 ? configOverride : undefined }),
      });

      const data = await res.json();
      setVerifyResult(data);
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: 'Errore durante la verifica: ' + err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Generazione account di test Ethereal
  const handleGenerateEthereal = async () => {
    setIsGeneratingEthereal(true);
    try {
      const res = await authFetch('/api/smtp/test-account', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEtherealAccount(data.account);
        // Precompila il form di test
        setTestHost(data.account.smtp.host);
        setTestPort(data.account.smtp.port);
        setTestSecure(data.account.smtp.secure);
        setTestUser(data.account.user);
        setTestPass(data.account.pass);
        setTestFrom(`"Test Mailer" <${data.account.user}>`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingEthereal(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-600" />
            <span>Configurazione & Diagnostica SMTP</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestisci i parametri di connessione SMTP (Host, Porta, Autenticazione, TLS) e testa la connettività del server.
          </p>
        </div>

        <button
          onClick={onRefreshStatus}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Aggiorna Stato Server</span>
        </button>
      </div>

      {/* Grid 2 Colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonna Sinistra: Stato Attuale e Variabili .env */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card Stato Corrente */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Stato Configurazione Attuale
              </h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center space-x-1 ${
                  status?.isConfigured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {status?.isConfigured ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Server SMTP Esterno Configurato</span>
                  </>
                ) : (
                  <>
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ethereal Test Sandbox Attivo</span>
                  </>
                )}
              </span>
            </div>

            {status ? (
              <div className="bg-slate-50 rounded-lg p-4 divide-y divide-slate-200 text-xs font-mono space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Host:</span>
                  <span className="font-semibold text-slate-800">{status.config.host}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Porta:</span>
                  <span className="font-semibold text-slate-800">{status.config.port}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">SSL/TLS (Secure):</span>
                  <span className="font-semibold text-slate-800">{status.config.secure ? 'true (Porta 465)' : 'false (STARTTLS)'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Utente SMTP:</span>
                  <span className="font-semibold text-slate-800">{status.config.user}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Password Configurata:</span>
                  <span className="font-semibold text-slate-800">{status.config.hasPassword ? 'Sì (Nascosta)' : 'No'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Mittente Default (From):</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[220px]">{status.config.from}</span>
                </div>
              </div>
            ) : null}

            {!status?.isConfigured && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
                <p className="font-semibold">Nessun server SMTP personalizzato impostato in .env</p>
                <p>
                  Il servizio è attualmente attivo in modalità <strong>Ethereal Sandbox</strong>: ogni email inviata genera un link di anteprima web reale su Ethereal per visionare la mail recapitata, senza rischiare invii accidentali.
                </p>
              </div>
            )}
          </div>

          {/* Card Istruzioni .env per Produzione */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Configurazione Ambiente (.env)
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(`SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="secret_password"
SMTP_FROM="Acme <noreply@example.com>"`)
                }
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copia Snippet</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Per connettere il servizio al tuo provider SMTP reale (es. SendGrid, Mailgun, AWS SES, Brevo, o server aziendale), definisci queste variabili:
            </p>

            <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-lg text-xs font-mono overflow-auto">
{`# Provider SMTP Reale
SMTP_HOST="smtp.sendgrid.net" # o smtp.mailgun.org, email-smtp.eu-west-1.amazonaws.com
SMTP_PORT="587"
SMTP_SECURE="false"          # "true" per porta 465 SSL, "false" per STARTTLS 587/25
SMTP_USER="apikey"
SMTP_PASS="SG.your_api_key_secret"
SMTP_FROM="Notifiche Aziendali <info@tuodominio.it>"`}
            </pre>
          </div>
        </div>

        {/* Colonna Destra: Strumento di Test Connessione & Ethereal Generator */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card Strumento di Test Connessione SMTP */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Tester Connessione SMTP
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifica handshake TLS e credenziali (usa i valori sotto o quelli di sistema se vuoti)
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateEthereal}
                disabled={isGeneratingEthereal}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors"
                title="Crea un account SMTP temporaneo istantaneo"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isGeneratingEthereal ? 'Creazione...' : 'Crea Test Account'}</span>
              </button>
            </div>

            {/* Form Parametri Test */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Host SMTP</label>
                  <input
                    type="text"
                    value={testHost}
                    onChange={(e) => setTestHost(e.target.value)}
                    placeholder="es. smtp.mailgun.org"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Porta</label>
                  <input
                    type="number"
                    value={testPort}
                    onChange={(e) => setTestPort(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-secure"
                  checked={testSecure}
                  onChange={(e) => setTestSecure(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chk-secure" className="text-xs text-slate-700">
                  Usa SSL/TLS Diretto (Secure = true, tipicamente porta 465)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Username SMTP</label>
                  <input
                    type="text"
                    value={testUser}
                    onChange={(e) => setTestUser(e.target.value)}
                    placeholder="utente o apikey"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Password SMTP</label>
                  <input
                    type="password"
                    value={testPass}
                    onChange={(e) => setTestPass(e.target.value)}
                    placeholder="password o token"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Indirizzo Mittente (From)</label>
                <input
                  type="text"
                  value={testFrom}
                  onChange={(e) => setTestFrom(e.target.value)}
                  placeholder="Nome <mittente@esempio.it>"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleVerifyConnection}
                  disabled={isTesting}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifica handshake e autenticazione...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verifica Connessione SMTP (/api/smtp/verify)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Risultato verifica */}
              {verifyResult && (
                <div
                  className={`p-3.5 rounded-lg text-xs border flex items-start space-x-2.5 ${
                    verifyResult.success
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  {verifyResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{verifyResult.success ? 'Connessione Riuscita!' : 'Verifica Fallita'}</p>
                    <p className="mt-0.5">{verifyResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
