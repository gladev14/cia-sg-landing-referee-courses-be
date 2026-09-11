import React, { useState, useEffect } from 'react';
import {
  Send,
  Eye,
  Code2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EmailTemplate, SendEmailResult } from '../types/mail';
import { authFetch } from '../utils/auth';

interface EmailSenderProps {
  templates: EmailTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onEmailSent: () => void;
}

export const EmailSender: React.FC<EmailSenderProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onEmailSent,
}) => {
  // Destinatario ed impostazioni email
  const [to, setTo] = useState('destinatario@example.com');
  const [cc, setCc] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Template e parametri
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const [paramData, setParamData] = useState<Record<string, any>>({});
  const [paramJsonString, setParamJsonString] = useState('');
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Modalità custom HTML se l'utente vuole scrivere codice da zero
  const [isCustomHtml, setIsCustomHtml] = useState(false);
  const [customHtmlContent, setCustomHtmlContent] = useState(
    '<h1>Ciao {{userName}}!</h1>\n<p>Questo è un template dinamico HTML compilato con i tuoi parametri: <strong>{{parametro}}</strong>.</p>',
  );

  // Live Rendering state
  const [renderedHtml, setRenderedHtml] = useState('');
  const [renderedSubject, setRenderedSubject] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Preview tab & device
  const [previewTab, setPreviewTab] = useState<'preview' | 'html' | 'payload'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Invio email state
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendEmailResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Inizializza i parametri di default quando cambia template
  useEffect(() => {
    if (activeTemplate) {
      const initialData = { ...activeTemplate.sampleData };
      setParamData(initialData);
      setParamJsonString(JSON.stringify(initialData, null, 2));
      setCustomSubject(activeTemplate.defaultSubject);
    }
  }, [selectedTemplateId, activeTemplate]);

  // Funzione per chiamare l'endpoint di render backend /api/templates/render
  const triggerRender = async (dataToUse: Record<string, any>) => {
    setIsRendering(true);
    setRenderError(null);
    try {
      const res = await authFetch('/api/templates/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: isCustomHtml ? undefined : activeTemplate?.id,
          html: isCustomHtml ? customHtmlContent : undefined,
          subject: customSubject,
          data: dataToUse,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Errore durante il rendering del template');
      }

      setRenderedHtml(result.html);
      setRenderedSubject(result.subject);
    } catch (err: any) {
      setRenderError(err.message);
    } finally {
      setIsRendering(false);
    }
  };

  // Trigger render on parameter or subject change (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerRender(paramData);
    }, 250);
    return () => clearTimeout(timer);
  }, [paramData, customSubject, isCustomHtml, customHtmlContent, selectedTemplateId]);

  // Aggiorna singolo parametro da form
  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...paramData, [key]: value };
    setParamData(updated);
    setParamJsonString(JSON.stringify(updated, null, 2));
  };

  // Aggiorna parametri da JSON raw editor
  const handleJsonChange = (val: string) => {
    setParamJsonString(val);
    try {
      const parsed = JSON.parse(val);
      setParamData(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError('JSON non valido: ' + err.message);
    }
  };

  // Invio effettivo della mail via SMTP backend
  const handleSendEmail = async () => {
    setIsSending(true);
    setSendResult(null);
    setSendError(null);

    try {
      const payload: any = {
        to,
        subject: customSubject,
        data: paramData,
      };

      if (cc) payload.cc = cc;

      if (isCustomHtml) {
        payload.html = customHtmlContent;
      } else {
        payload.templateId = activeTemplate.id;
      }

      const res = await authFetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invio fallito');
      }

      setSendResult(data);
      onEmailSent();
    } catch (err: any) {
      setSendError(err.message || 'Errore sconosciuto durante l\'invio');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del banco di prova */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Banco di Prova Invio Email & Rendering Dinamico
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configura i parametri in input, visualizza il render HTML in tempo reale ed invia la mail via SMTP.
          </p>
        </div>

        {/* Selezione Template Rapida */}
        <div className="flex items-center space-x-2">
          <label htmlFor="template-select" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Template:
          </label>
          <select
            id="template-select"
            value={isCustomHtml ? 'custom' : selectedTemplateId}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setIsCustomHtml(true);
              } else {
                setIsCustomHtml(false);
                onSelectTemplate(e.target.value);
              }
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
            <option value="custom">✏️ HTML Personalizzato (Scrivi tu)</option>
          </select>
        </div>
      </div>

      {/* Messaggio Risultato Invio */}
      {sendResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Email inviata con successo via SMTP!
              </p>
              <p className="text-xs text-emerald-700 font-mono mt-0.5">
                Message-ID: {sendResult.messageId || 'Generato'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {sendResult.previewUrl && (
              <a
                href={sendResult.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                <span>Visualizza Email Ricevuta (Ethereal)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => setSendResult(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 px-2 py-1"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {sendError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-rose-800">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Errore durante l'invio SMTP</p>
              <p className="text-xs mt-0.5">{sendError}</p>
            </div>
          </div>
          <button
            onClick={() => setSendError(null)}
            className="text-xs text-rose-700 hover:text-rose-900 px-2 py-1"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* Grid: Editor Parametri a Sinistra / Preview Rendered a Destra */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonna Sinistra: Modulo Invio & Parametri Dinamici */}
        <div className="lg:col-span-5 space-y-5">
          {/* Box Destinatario & Oggetto */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
              <span>Intestazione Messaggio</span>
              <span className="text-[11px] font-normal text-slate-500">Node.js nodemailer</span>
            </h3>

            {/* A (To) */}
            <div>
              <label htmlFor="input-to" className="block text-xs font-medium text-slate-700 mb-1">
                Destinatario (To) *
              </label>
              <div className="flex space-x-2">
                <input
                  id="input-to"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="utente@esempio.it"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTo('gianluca.atzeni2000@gmail.com')}
                  title="Imposta la tua email"
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap"
                >
                  Usa Mia
                </button>
              </div>
            </div>

            {/* Oggetto Dinamico */}
            <div>
              <label htmlFor="input-subject" className="block text-xs font-medium text-slate-700 mb-1">
                Oggetto (Supporta tag Handlebars)
              </label>
              <input
                id="input-subject"
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Oggetto dell'email con {{variabili}}"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
              />
              {renderedSubject && (
                <p className="text-xs text-slate-500 mt-1 truncate">
                  <span className="font-semibold text-slate-600">Oggetto renderizzato: </span>
                  {renderedSubject}
                </p>
              )}
            </div>

            {/* Campi avanzati (CC) */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
                {showAdvanced ? 'Nascondi campi opzionali' : 'Mostra CC / Opzioni avanzate'}
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                  <div>
                    <label htmlFor="input-cc" className="block text-xs font-medium text-slate-600 mb-1">
                      CC (Copia Conoscenza)
                    </label>
                    <input
                      id="input-cc"
                      type="email"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="copia@esempio.it"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Box Parametri Dinamici Input */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Parametri Dinamici in Input
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Valori iniettati nei segnaposto <code className="text-blue-600">{'{{chiave}}'}</code>
                </p>
              </div>

              {/* Toggle Form / JSON */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setIsJsonMode(false)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    !isJsonMode ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3 h-3 inline mr-1" />
                  Form
                </button>
                <button
                  type="button"
                  onClick={() => setIsJsonMode(true)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    isJsonMode ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3 h-3 inline mr-1" />
                  JSON
                </button>
              </div>
            </div>

            {/* Visualizzatore o Editor HTML se custom */}
            {isCustomHtml && (
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-semibold text-slate-700">Codice Template HTML</label>
                <textarea
                  value={customHtmlContent}
                  onChange={(e) => setCustomHtmlContent(e.target.value)}
                  rows={6}
                  className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg bg-slate-900 text-slate-100 focus:outline-none"
                />
              </div>
            )}

            {/* Modalità Form Campi Guidati */}
            {!isJsonMode ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {activeTemplate?.variables && activeTemplate.variables.length > 0 ? (
                  activeTemplate.variables.map((variable) => {
                    const val = paramData[variable.key];
                    const isArrayOrObject = variable.type === 'array' || typeof val === 'object';

                    return (
                      <div key={variable.key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">
                            {variable.label || variable.key}
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {'{{' + variable.key + '}}'}
                          </span>
                        </div>

                        {isArrayOrObject ? (
                          <textarea
                            value={typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val ?? '')}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                handleFieldChange(variable.key, parsed);
                              } catch {
                                handleFieldChange(variable.key, e.target.value);
                              }
                            }}
                            rows={3}
                            className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type={variable.type === 'number' ? 'number' : 'text'}
                            value={val ?? ''}
                            onChange={(e) =>
                              handleFieldChange(
                                variable.key,
                                variable.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        )}
                        {variable.description && (
                          <p className="text-[11px] text-slate-400">{variable.description}</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    Nessuna variabile predefinita. Usa la modalità JSON per definire qualsiasi parametro.
                  </div>
                )}
              </div>
            ) : (
              /* Modalità Raw JSON Editor */
              <div className="space-y-2">
                <textarea
                  id="json-param-editor"
                  value={paramJsonString}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={10}
                  className={`w-full p-3 font-mono text-xs border rounded-lg bg-slate-900 text-slate-100 focus:outline-none ${
                    jsonError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  }`}
                  placeholder='{"nome": "Mario", "ordine": 123}'
                />
                {jsonError ? (
                  <p className="text-xs text-rose-600">{jsonError}</p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Sintassi JSON valida per Handlebars. Supporta oggetti annidati e array.
                  </p>
                )}
              </div>
            )}

            {/* Pulsante Invia Email Principale */}
            <div className="pt-2 border-t border-slate-100">
              <button
                id="btn-send-email"
                type="button"
                onClick={handleSendEmail}
                disabled={isSending || Boolean(jsonError)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Invio tramite SMTP in corso...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Invia Email via SMTP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Colonna Destra: Live Preview HTML renderizzato */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 flex flex-col min-h-[580px]">
          {/* Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
            {/* Tab switchers */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1.5 transition-colors ${
                  previewTab === 'preview'
                    ? 'bg-white shadow-xs text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Anteprima Visuale</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('html')}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1.5 transition-colors ${
                  previewTab === 'html'
                    ? 'bg-white shadow-xs text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>HTML Compilato</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('payload')}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1.5 transition-colors ${
                  previewTab === 'payload'
                    ? 'bg-white shadow-xs text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Payload API</span>
              </button>
            </div>

            {/* Device Switcher (Desktop vs Mobile) */}
            {previewTab === 'preview' && (
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-white shadow-xs text-blue-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Desktop (Larghezza 100%)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-white shadow-xs text-blue-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Mobile (Larghezza 380px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Preview Container */}
          <div className="flex-1 mt-4 relative bg-slate-100 rounded-lg p-2 overflow-hidden flex items-center justify-center">
            {isRendering && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 text-xs text-slate-600 font-medium space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Aggiornamento render...</span>
              </div>
            )}

            {renderError ? (
              <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs border border-rose-200">
                Errore compilazione Handlebars: {renderError}
              </div>
            ) : previewTab === 'preview' ? (
              /* Iframe sandbox per rendering sicuro e isolato dei CSS inline dell'email */
              <div
                className={`transition-all duration-300 bg-white shadow-md rounded-lg overflow-hidden h-[540px] ${
                  previewDevice === 'mobile' ? 'w-[380px]' : 'w-full'
                }`}
              >
                <iframe
                  title="Email Render Preview"
                  srcDoc={renderedHtml}
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : previewTab === 'html' ? (
              /* Codice sorgente HTML generato */
              <div className="w-full h-[540px] bg-slate-900 rounded-lg p-4 overflow-auto text-slate-200 font-mono text-xs">
                <pre>{renderedHtml}</pre>
              </div>
            ) : (
              /* JSON Payload per richiesta POST /api/send-email */
              <div className="w-full h-[540px] bg-slate-900 rounded-lg p-4 overflow-auto text-emerald-400 font-mono text-xs">
                <pre>
                  {JSON.stringify(
                    {
                      to,
                      subject: customSubject,
                      templateId: isCustomHtml ? undefined : activeTemplate?.id,
                      html: isCustomHtml ? customHtmlContent : undefined,
                      data: paramData,
                      cc: cc || undefined,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
