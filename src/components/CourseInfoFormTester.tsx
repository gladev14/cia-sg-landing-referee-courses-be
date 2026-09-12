import React, { useState } from 'react';
import {
  GraduationCap,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  RefreshCw,
  Mail,
  MapPin,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Server,
  Globe,
  Radio,
  HelpCircle,
} from 'lucide-react';
import { CourseInfoRequestInput } from '../types/mail';
import { getStoredToken } from '../utils/auth';

// Mappa delle regioni con relative email regionali CIA
const REGIONAL_EMAILS: Record<string, string> = {
  Abruzzo: 'corsi.abruzzo@cia.example.it',
  Basilicata: 'corsi.basilicata@cia.example.it',
  Calabria: 'corsi.calabria@cia.example.it',
  Campania: 'corsi.campania@cia.example.it',
  'Emilia-Romagna': 'corsi.emiliaromagna@cia.example.it',
  'Friuli Venezia Giulia': 'corsi.fvg@cia.example.it',
  Lazio: 'corsi.lazio@cia.example.it',
  Liguria: 'corsi.liguria@cia.example.it',
  Lombardia: 'corsi.lombardia@cia.example.it',
  Marche: 'corsi.marche@cia.example.it',
  Molise: 'corsi.molise@cia.example.it',
  Piemonte: 'corsi.piemonte@cia.example.it',
  Puglia: 'corsi.puglia@cia.example.it',
  Sardegna: 'corsi.sardegna@cia.example.it',
  Sicilia: 'corsi.sicilia@cia.example.it',
  Toscana: 'corsi.toscana@cia.example.it',
  'Trentino-Alto Adige': 'corsi.trentino@cia.example.it',
  Umbria: 'corsi.umbria@cia.example.it',
  "Valle d'Aosta": 'corsi.valledaosta@cia.example.it',
  Veneto: 'corsi.veneto@cia.example.it',
};

const DEFAULT_ADMIN_EMAIL = 'coordinatore.corsi@cia.example.it';

interface CourseInfoFormTesterProps {
  onSubmitted: () => void;
}

export const CourseInfoFormTester: React.FC<CourseInfoFormTesterProps> = ({ onSubmitted }) => {
  // Simulazione dello stato formData del Frontend
  const [formData, setFormData] = useState({
    region: 'Lombardia',
    name: 'Gianluca',
    surname: 'Atzeni',
    city: 'Milano',
    mail: 'gianluca.atzeni2000@gmail.com',
    telephone: '+39 340 1234567',
  });

  const [adminEmail, setAdminEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [customRegionalEmail, setCustomRegionalEmail] = useState('');

  // Risoluzione email regionale
  const regionalEmail = customRegionalEmail || REGIONAL_EMAILS[formData.region] || `corsi.${formData.region.toLowerCase()}@cia.example.it`;

  const [isSending, setIsSending] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState<any>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'visual' | 'text'>('visual');

  // Selezione Server Backend di Destinazione
  const [targetServerUrl, setTargetServerUrl] = useState<string>('/api/sendCourseInfoRequest');
  const [customServerUrl, setCustomServerUrl] = useState<string>('https://corsiarbitri-fip-be.vercel.app/api/sendCourseInfoRequest');
  const [isTestingServer, setIsTestingServer] = useState<boolean>(false);
  const [serverDiagnostic, setServerDiagnostic] = useState<{
    tested: boolean;
    status: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const activeEndpointUrl = targetServerUrl === 'custom' ? customServerUrl.trim() : targetServerUrl;

  const testServerConnection = async () => {
    setIsTestingServer(true);
    setServerDiagnostic(null);

    const urlToTest = activeEndpointUrl;
    try {
      // 1. Proviamo a testare la rotta di health o la rotta stessa con OPTIONS/GET
      let healthUrl = urlToTest;
      if (healthUrl.includes('/api/')) {
        healthUrl = healthUrl.substring(0, healthUrl.indexOf('/api/') + 5) + 'health';
      }

      const startTime = performance.now();
      const res = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        setServerDiagnostic({
          tested: true,
          status: 'success',
          title: 'Server Raggiungibile & CORS Attivo',
          message: `Il backend risponde correttamente (${res.status} ${res.statusText}) con latenza ${latency}ms. Permessi CORS OK!`,
        });
      } else if (res.status === 404) {
        setServerDiagnostic({
          tested: true,
          status: 'error',
          title: 'Errore 404 - Endpoint non trovato su Vercel',
          message: `Il server risponde ma la route non è stata trovata (404 NOT_FOUND). Su Vercel è necessario configurare vercel.json e la cartella /api per distribuire le funzioni serverless.`,
          details: `URL testato: ${healthUrl}`,
        });
      } else {
        setServerDiagnostic({
          tested: true,
          status: 'warning',
          title: `Risposta ${res.status} dal server`,
          message: `Il server ha risposto con codice ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      setServerDiagnostic({
        tested: true,
        status: 'error',
        title: 'Impossibile raggiungere il server (Failed to fetch)',
        message: err.message || 'Errore di connessione o restrizioni CORS del server remoto.',
        details: `Causa tipica: Il server '${urlToTest}' è spento, ha restituito un errore 404/500 senza gli header 'Access-Control-Allow-Origin', oppure non accetta chiamate dal tuo dominio frontend.`,
      });
    } finally {
      setIsTestingServer(false);
    }
  };

  // Calcolo del payload identico alla specifica inviata dal client
  const buildPayload = (): CourseInfoRequestInput => {
    return {
      region: formData.region,
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      city: formData.city.trim(),
      mail: formData.mail.trim().toLowerCase(),
      telephone: formData.telephone.trim(),
      // Parametri di configurazione routing richiesti
      recipient: regionalEmail, // Regione destinataria (email del comitato/sezione regionale CIA)
      coordinator: adminEmail, // Mail dell'amministratore centrale
      // Parametri aggiuntivi utili per il routing dinamico configurato sul pannello EmailJS
      to_email: regionalEmail,
      admin_email: adminEmail,
      cc_email: formData.mail.trim().toLowerCase(),
      regional_email: regionalEmail,
      regional_committee: `CIA ${formData.region}`,
      submitted_at: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
    };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResponseSuccess(null);
    setResponseError(null);

    const payload = buildPayload();
    const token = getStoredToken();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(activeEndpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Risposta non valida dal server (${res.status}): ${text.slice(0, 120)}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Errore durante l'invio della richiesta (HTTP ${res.status})`);
      }

      setResponseSuccess(data);
      onSubmitted();
    } catch (err: any) {
      const msg = err.message || 'Errore di connessione al backend';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setResponseError(
          `Impossibile raggiungere il server (${activeEndpointUrl}): Failed to fetch. Verifica la connessione di rete o i permessi CORS del backend.`
        );
      } else {
        setResponseError(msg);
      }
    } finally {
      setIsSending(false);
    }
  };

  const currentPayload = buildPayload();

  return (
    <div className="space-y-6">
      {/* Header Sezione */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-xl shrink-0">
            <img src="/assets/fip-logo-blue.png" alt="Logo FIP" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Modulo Richiesta Informazioni Corsi CIA (<code className="text-blue-600 text-base font-mono">sendCourseInfoRequest</code>)
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Collauda il flusso di invio con routing regionale automatico, notifica in copia al candidato (CC) e all'amministratore centrale.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            Endpoint: POST /api/sendCourseInfoRequest
          </span>
        </div>
      </div>

      {/* Messaggio di successo */}
      {responseSuccess && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Richiesta Informazioni Inviata con Successo via SMTP!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">{responseSuccess.message}</p>
              </div>
            </div>
            {responseSuccess.delivery?.previewUrl && (
              <a
                href={responseSuccess.delivery.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <span>Visualizza Email Ricevuta</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="bg-white/80 p-3 rounded-lg border border-emerald-200 text-xs font-mono grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div><strong>Destinatario (To):</strong> {responseSuccess.routing.to}</div>
            <div><strong>Copia Conoscenza (CC):</strong> {responseSuccess.routing.cc}</div>
            <div><strong>Coordinatore (BCC):</strong> {responseSuccess.routing.bcc}</div>
            <div><strong>Reply-To (Rispondi A):</strong> {responseSuccess.routing.replyTo}</div>
          </div>
        </div>
      )}

      {/* Messaggio di errore */}
      {responseError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-800">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block">Errore Connessione / CORS</span>
                <span className="text-xs font-medium">{responseError}</span>
              </div>
            </div>
            <button onClick={() => setResponseError(null)} className="text-xs text-rose-600 hover:text-rose-800 underline">
              Chiudi
            </button>
          </div>
          {responseError.includes('corsiarbitri-fip-be.vercel.app') && (
            <div className="text-xs bg-rose-100/70 p-2.5 rounded-lg border border-rose-200 mt-2 text-rose-900 leading-relaxed">
              <strong>Diagnosi Vercel:</strong> Il backend su Vercel (<code>https://corsiarbitri-fip-be.vercel.app</code>) restituiva errore 404 (NOT_FOUND) poiché su Vercel i server Node Express necessitano di un file di configurazione <code>vercel.json</code> e dell'entrypoint serverless <code>api/index.ts</code>. Abbiamo ora aggiunto questi file nel repository! Nel frattempo, puoi selezionare qui sotto il <strong>Server Locale / Attuale</strong> per inviare le richieste con successo immediato.
            </div>
          )}
        </div>
      )}

      {/* Pannello Selezione Destinazione Backend & Strumento Diagnostica CORS */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Destinazione Chiamata API (<code className="text-xs font-mono text-blue-700">sendCourseInfoRequest</code>)
            </h3>
          </div>
          <button
            type="button"
            id="btn-test-backend-connection"
            onClick={testServerConnection}
            disabled={isTestingServer}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isTestingServer ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{isTestingServer ? 'Verifica in corso...' : 'Test Connessione & Permessi CORS'}</span>
          </button>
        </div>

        {/* Radio selector server */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label
            className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
              targetServerUrl === '/api/sendCourseInfoRequest'
                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Server Attuale (Locale)</span>
              </span>
              <input
                type="radio"
                name="targetServer"
                checked={targetServerUrl === '/api/sendCourseInfoRequest'}
                onChange={() => {
                  setTargetServerUrl('/api/sendCourseInfoRequest');
                  setServerDiagnostic(null);
                }}
                className="text-blue-600 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono break-all">
              /api/sendCourseInfoRequest
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Attivo con CORS & SMTP</span>
          </label>

          <label
            className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
              targetServerUrl === 'https://corsiarbitri-fip-be.vercel.app/api/sendCourseInfoRequest'
                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span>Backend Vercel</span>
              </span>
              <input
                type="radio"
                name="targetServer"
                checked={targetServerUrl === 'https://corsiarbitri-fip-be.vercel.app/api/sendCourseInfoRequest'}
                onChange={() => {
                  setTargetServerUrl('https://corsiarbitri-fip-be.vercel.app/api/sendCourseInfoRequest');
                  setServerDiagnostic(null);
                }}
                className="text-blue-600 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono break-all">
              corsiarbitri-fip-be.vercel.app
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Server remoto esterno</span>
          </label>

          <label
            className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
              targetServerUrl === 'custom'
                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">URL Personalizzato</span>
              <input
                type="radio"
                name="targetServer"
                checked={targetServerUrl === 'custom'}
                onChange={() => {
                  setTargetServerUrl('custom');
                  setServerDiagnostic(null);
                }}
                className="text-blue-600 focus:ring-blue-500"
              />
            </div>
            <input
              type="text"
              value={customServerUrl}
              onChange={(e) => setCustomServerUrl(e.target.value)}
              disabled={targetServerUrl !== 'custom'}
              placeholder="https://..."
              className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-mono bg-white disabled:bg-slate-100"
            />
            <span className="text-[10px] text-slate-400">Inserisci endpoint personalizzato</span>
          </label>
        </div>

        {/* Box Risultato Test Diagnostico */}
        {serverDiagnostic && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              serverDiagnostic.status === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : serverDiagnostic.status === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold mb-1">
              {serverDiagnostic.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{serverDiagnostic.title}</span>
            </div>
            <p>{serverDiagnostic.message}</p>
            {serverDiagnostic.details && (
              <div className="mt-1.5 p-2 bg-white/70 rounded text-[11px] font-mono text-slate-700 border border-slate-200/60">
                {serverDiagnostic.details}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Layout Grid: Modulo Form a Sinistra, JSON & Routing a Destra */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Frontend */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between pb-3 border-b border-slate-100">
            <span>Dati Input Utente (Form Frontend)</span>
            <span className="text-xs text-slate-400 font-normal">formData</span>
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Regione */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Regione di Interesse *</span>
                <span className="text-slate-400 font-mono text-[11px]">formData.region</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {Object.keys(REGIONAL_EMAILS).map((reg) => (
                  <option key={reg} value={reg}>
                    {reg} ({REGIONAL_EMAILS[reg]})
                  </option>
                ))}
              </select>
            </div>

            {/* Nome e Cognome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mario"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  placeholder="Rossi"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Città e Telefono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Città / Comune *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Milano"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefono *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+39 340 1234567"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email Candidato */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Email Candidato (Riceverà copia CC) *</span>
                <span className="text-slate-400 font-mono text-[11px]">formData.mail</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={formData.mail}
                  onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                  placeholder="mario.rossi@example.it"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Configurazione Routing Dinamico */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Parametri di Configurazione Routing
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Email Destinatario Regionale (recipient / to_email)
                  </label>
                  <input
                    type="email"
                    value={regionalEmail}
                    onChange={(e) => setCustomRegionalEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Coordinatore Centrale (coordinator / admin_email)
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Bottone Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Invio richiesta in corso...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Invia Richiesta Informazioni Corso (sendCourseInfoRequest)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* JSON Payload & Routing Scheme */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card Schema di Routing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Logica di Routing SMTP Risolta</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Destinatario (TO):</span>
                <span className="font-mono font-semibold text-slate-900 truncate max-w-[200px]" title={regionalEmail}>
                  {regionalEmail}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Copia Utente (CC):</span>
                <span className="font-mono font-semibold text-blue-600 truncate max-w-[200px]" title={formData.mail}>
                  {formData.mail}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Amministratore (BCC):</span>
                <span className="font-mono font-semibold text-slate-700 truncate max-w-[200px]" title={adminEmail}>
                  {adminEmail}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Rispondi A (Reply-To):</span>
                <span className="font-mono font-semibold text-slate-800 truncate max-w-[200px]">
                  {formData.name} {formData.surname} &lt;{formData.mail}&gt;
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Comitato:</span>
                <span className="font-semibold text-slate-800">CIA {formData.region}</span>
              </div>
            </div>
          </div>

          {/* Anteprima Email Ufficiale CIA con Logo FIP */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Anteprima Messaggio (CIA)</span>
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold">
                  Logo FIP
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setPreviewMode('visual')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    previewMode === 'visual'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Grafica Email
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('text')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    previewMode === 'text'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Solo Testo
                </button>
              </div>
            </div>

            {previewMode === 'visual' ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
                {/* Header Blu FIP con Logo Bianco */}
                <div className="bg-[#0c2356] px-4 py-3.5 border-b-2 border-blue-600 flex items-center space-x-3 text-white">
                  <img
                    src="/assets/fip-logo-white.png"
                    alt="Logo FIP"
                    className="w-10 h-10 object-contain shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white leading-tight">
                      Comitato Italiano Arbitri
                    </h4>
                    <p className="text-[11px] text-blue-200 mt-0.5">
                      Segnalazione candidato corso arbitri
                    </p>
                  </div>
                </div>

                {/* Contenuto Email */}
                <div className="p-4 bg-white text-xs text-slate-700 space-y-3 leading-relaxed">
                  <p className="font-semibold text-slate-900">Caro Presidente,</p>
                  <p>
                    ti segnaliamo che <strong>{formData.name || '...'} {formData.surname || '...'}</strong> è interessato a partecipare al corso arbitri presso la tua regione; la sua provincia di residenza è <strong>{formData.city || '...'}</strong>.
                  </p>
                  <p>
                    Ti chiediamo di contattare <strong>{formData.name || '...'}</strong>, di seguito i suoi recapiti:
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 border-l-4 border-l-blue-600 space-y-1.5 font-sans">
                    <div>
                      • <strong>indirizzo mail</strong>:{' '}
                      <span className="text-blue-600 underline font-medium">{formData.mail || '...'}</span>
                    </div>
                    <div>
                      • <strong>cellulare</strong>:{' '}
                      <span className="text-slate-900 font-semibold">{formData.telephone || '...'}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-slate-800">
                    Grazie per la collaborazione.<br />
                    <span className="font-semibold">A presto e buon lavoro!</span>
                  </div>
                </div>

                {/* Footer Email con Logo Blu FIP */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
                  <img
                    src="/assets/fip-logo-blue.png"
                    alt="FIP"
                    className="w-4 h-4 object-contain opacity-80"
                  />
                  <span>
                    Comunicazione automatica generata per il Comitato Regionale CIA {formData.region}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
{`Caro Presidente,
ti segnaliamo che ${formData.name || '...'} ${formData.surname || '...'} è interessato a partecipare al corso arbitri presso la tua regione; la sua provincia di residenza è ${formData.city || '...'}.
 
Ti chiediamo di contattare ${formData.name || '...'}, di seguito i suoi recapiti:

• indirizzo mail: ${formData.mail || '...'}
• cellulare: ${formData.telephone || '...'}
 
Grazie per la collaborazione.
A presto e buon lavoro!`}
              </div>
            )}
          </div>

          {/* Card Payload JSON Generato */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Payload JSON Trasmesso al Backend</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400">application/json</span>
            </div>

            <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-3 bg-slate-950 rounded-lg max-h-[380px]">
              {JSON.stringify(currentPayload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
