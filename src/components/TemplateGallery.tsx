import React, { useState } from 'react';
import {
  FileText,
  Send,
  Plus,
  Eye,
  Code2,
  Tag,
  CheckCircle2,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { EmailTemplate } from '../types/mail';
import { authFetch } from '../utils/auth';

interface TemplateGalleryProps {
  templates: EmailTemplate[];
  onSelectTemplate: (id: string) => void;
  onTemplateCreated: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  onSelectTemplate,
  onTemplateCreated,
}) => {
  const [selectedForModal, setSelectedForModal] = useState<EmailTemplate | null>(null);
  const [modalTab, setModalTab] = useState<'preview' | 'code' | 'vars'>('preview');

  // Modal per creare nuovo template
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateSubject, setNewTemplateSubject] = useState('Notifica per {{userName}}');
  const [newTemplateHtml, setNewTemplateHtml] = useState(
    `<div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
  <h2 style="color: #1e293b;">Gentile {{userName}},</h2>
  <p>La tua richiesta n. <strong>{{ticketId}}</strong> è stata elaborata con successo.</p>
  <div style="margin-top: 16px; padding: 12px; background: #e0f2fe; border-left: 4px solid #0284c7; color: #0369a1;">
    Stato: <strong>{{status}}</strong>
  </div>
</div>`,
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const handleSaveCustomTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateHtml.trim()) {
      setCreateError('Nome e codice HTML del template sono obbligatori.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await authFetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName,
          description: newTemplateDesc || 'Template HTML dinamico personalizzato',
          defaultSubject: newTemplateSubject,
          html: newTemplateHtml,
          sampleData: {
            userName: 'Mario Rossi',
            ticketId: 'TKT-1049',
            status: 'Completato',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore creazione template');
      }

      setIsCreating(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
      onTemplateCreated();
      onSelectTemplate(data.template.id);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'onboarding':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ecommerce':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'security':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'billing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'notification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Galleria */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Galleria Template HTML Dinamici</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Template reattivi predefiniti e supporto Handlebars per loop <code>&#123;&#123;#each&#125;&#125;</code>, condizionali <code>&#123;&#123;#if&#125;&#125;</code> e helper valute/date.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Template HTML</span>
        </button>
      </div>

      {/* Grid delle Card Template */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Badge Categoria */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                    tpl.category,
                  )}`}
                >
                  {tpl.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {tpl.id}</span>
              </div>

              {/* Titolo e Descrizione */}
              <h3 className="text-base font-bold text-slate-900 mb-1">{tpl.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4">{tpl.description}</p>

              {/* Tag Parametri / Variabili Rilevate */}
              <div className="space-y-1 mb-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Parametri accettati:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                  {tpl.variables.slice(0, 5).map((v) => (
                    <span
                      key={v.key}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded font-mono"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      <span>{v.key}</span>
                    </span>
                  ))}
                  {tpl.variables.length > 5 && (
                    <span className="text-[11px] text-slate-400 px-1 py-0.5">
                      +{tpl.variables.length - 5} altri
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Azioni Card */}
            <div className="pt-4 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={() => setSelectedForModal(tpl)}
                className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center space-x-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Anteprima</span>
              </button>

              <button
                onClick={() => onSelectTemplate(tpl.id)}
                className="flex-1 py-2 px-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-1 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Usa & Invia</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Anteprima e Ispezione Template */}
      {selectedForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedForModal.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Oggetto default: {selectedForModal.defaultSubject}
                </p>
              </div>
              <button
                onClick={() => setSelectedForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-5 space-x-4 text-xs font-medium bg-white">
              <button
                onClick={() => setModalTab('preview')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 ${
                  modalTab === 'preview'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Anteprima Render (Dati di Esempio)</span>
              </button>

              <button
                onClick={() => setModalTab('code')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 ${
                  modalTab === 'code'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Sorgente HTML & Handlebars</span>
              </button>

              <button
                onClick={() => setModalTab('vars')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 ${
                  modalTab === 'vars'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Parametri & Schemi ({selectedForModal.variables.length})</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-5 overflow-auto bg-slate-50">
              {modalTab === 'preview' && (
                <div className="bg-white rounded-lg shadow-xs overflow-hidden h-[420px] border border-slate-200">
                  <iframe
                    title="Template Preview"
                    srcDoc={selectedForModal.html}
                    className="w-full h-full border-none"
                  />
                </div>
              )}

              {modalTab === 'code' && (
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-auto h-[420px]">
                  <pre>{selectedForModal.html}</pre>
                </div>
              )}

              {modalTab === 'vars' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">
                      Tabella Variabili Accettate
                    </h4>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-slate-500">
                          <th className="pb-2">Chiave (Key)</th>
                          <th className="pb-2">Tipo</th>
                          <th className="pb-2">Descrizione</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedForModal.variables.map((v) => (
                          <tr key={v.key}>
                            <td className="py-2 font-mono text-blue-600 font-semibold">{`{{${v.key}}}`}</td>
                            <td className="py-2 text-slate-500 uppercase text-[10px]">{v.type}</td>
                            <td className="py-2 text-slate-700">{v.description || v.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
                      Payload di Esempio (JSON)
                    </h4>
                    <pre className="bg-slate-900 p-3 rounded text-emerald-400 font-mono text-xs overflow-auto">
                      {JSON.stringify(selectedForModal.sampleData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end space-x-2 bg-white">
              <button
                onClick={() => setSelectedForModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Chiudi
              </button>
              <button
                onClick={() => {
                  onSelectTemplate(selectedForModal.id);
                  setSelectedForModal(null);
                }}
                className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Usa questo template nel Banco di Prova</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Creazione Nuovo Template */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Crea Nuovo Template HTML Dinamico</h3>
              </div>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {createError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-200">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome Template *</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Es. Notifica Ticket Supporto"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descrizione Breve</label>
                <input
                  type="text"
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="Spiega quando viene inviato questo template"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Oggetto Default (Supporta tag)</label>
                <input
                  type="text"
                  value={newTemplateSubject}
                  onChange={(e) => setNewTemplateSubject(e.target.value)}
                  placeholder="Es. Aggiornamento ticket #{{ticketId}}"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Codice HTML con Variabili Handlebars <code className="text-blue-600">{'{{variabile}}'}</code> *
                </label>
                <textarea
                  value={newTemplateHtml}
                  onChange={(e) => setNewTemplateHtml(e.target.value)}
                  rows={8}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg bg-slate-900 text-slate-100 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Il backend rileverà in automatico tutte le variabili racchiuse tra doppie parentesi graffe.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end space-x-2 bg-slate-50">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveCustomTemplate}
                disabled={createLoading}
                className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salva Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
