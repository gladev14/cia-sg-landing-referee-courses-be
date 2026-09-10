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
} from 'lucide-react';
import { CourseInfoRequestInput } from '../types/mail';

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

    try {
      const res = await fetch('/api/sendCourseInfoRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Errore durante l\'invio della richiesta');
      }

      setResponseSuccess(data);
      onSubmitted();
    } catch (err: any) {
      setResponseError(err.message || 'Errore di connessione al backend');
    } finally {
      setIsSending(false);
    }
  };

  const currentPayload = buildPayload();

  return (
    <div className="space-y-6">
      {/* Header Sezione */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Modulo Richiesta Informazioni Corsi CIA (<code className="text-blue-600 text-base font-mono">sendCourseInfoRequest</code>)
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Collauda il flusso di invio con routing regionale automatico, notifica in copia al candidato (CC) e all'amministratore centrale.
          </p>
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
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-xs font-semibold">{responseError}</span>
          </div>
          <button onClick={() => setResponseError(null)} className="text-xs underline">
            Chiudi
          </button>
        </div>
      )}

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

          {/* Anteprima Testo Messaggio CIA */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Anteprima Messaggio Compilato (CIA)</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400">Template CMEL</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
{`Caro Presidente,
ti segnaliamo che ${formData.name || '...'} ${formData.surname || '...'} è interessato a partecipare al corso arbitri presso la tua regione; la sua provincia di residenza è ${formData.city || '...'}.
 
Ti chiediamo di contattare ${formData.name || '...'}, di seguito i suoi recapiti:
- indirizzo mail -> ${formData.mail || '...'}
- cellulare -> ${formData.telephone || '...'}
 
Grazie per la collaborazione.
A presto,
CMEL`}
            </div>
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
