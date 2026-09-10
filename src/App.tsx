import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { EmailSender } from './components/EmailSender';
import { TemplateGallery } from './components/TemplateGallery';
import { SmtpConfigPanel } from './components/SmtpConfigPanel';
import { ApiDocs } from './components/ApiDocs';
import { SentLogs } from './components/SentLogs';
import { CourseInfoFormTester } from './components/CourseInfoFormTester';
import { AuthScreen } from './components/AuthScreen';
import { ApiKeyModal } from './components/ApiKeyModal';
import { EmailTemplate, EmailLogEntry } from './types/mail';
import { checkAuthStatus, performLogout } from './utils/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'course' | 'send' | 'templates' | 'smtp' | 'docs' | 'logs'>('course');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('course_info_request');
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Verifica stato autenticazione iniziale
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      const status = await checkAuthStatus();
      setIsAuthenticated(status.authenticated);
      setIsCheckingAuth(false);
    };

    verifyAuth();

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Caricamento iniziale template (solo se autenticato)
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) return;
      const data = await res.json();
      if (data.templates && data.templates.length > 0) {
        setTemplates(data.templates);
        if (!selectedTemplateId) {
          setSelectedTemplateId(data.templates[0].id);
        }
      }
    } catch (err) {
      console.error('Errore caricamento template:', err);
    }
  }, [selectedTemplateId]);

  // Caricamento stato SMTP
  const fetchSmtpStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/smtp/status');
      if (!res.ok) return;
      const data = await res.json();
      setSmtpStatus(data);
    } catch (err) {
      console.error('Errore caricamento stato SMTP:', err);
    }
  }, []);

  // Caricamento log invii
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) return;
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Errore caricamento log:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  // Quando l'utente si autentica, carica le risorse protette
  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates();
      fetchSmtpStatus();
      fetchLogs();
    }
  }, [isAuthenticated, fetchTemplates, fetchSmtpStatus, fetchLogs]);

  const handleEmailSent = () => {
    fetchLogs();
  };

  const handleSelectTemplateAndGoToSend = (id: string) => {
    setSelectedTemplateId(id);
    setActiveTab('send');
  };

  const handleLogout = async () => {
    await performLogout();
    setIsAuthenticated(false);
  };

  // 1. Schermata di caricamento iniziale controllo sessione
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-400 font-medium">Verifica autorizzazione in corso...</p>
      </div>
    );
  }

  // 2. Se non autorizzato, mostra la schermata di accesso protetta
  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // 3. Pannello principale per utenti autorizzati
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Modal Credenziali API */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        smtpStatus={
          smtpStatus
            ? {
                isConfigured: smtpStatus.isConfigured,
                mode: smtpStatus.mode,
                host: smtpStatus.config.host,
              }
            : null
        }
        logsCount={logs.length}
        onLogout={handleLogout}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'course' && (
          <CourseInfoFormTester onSubmitted={handleEmailSent} />
        )}

        {activeTab === 'send' && (
          <EmailSender
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
            onEmailSent={handleEmailSent}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateGallery
            templates={templates}
            onSelectTemplate={handleSelectTemplateAndGoToSend}
            onTemplateCreated={fetchTemplates}
          />
        )}

        {activeTab === 'smtp' && (
          <SmtpConfigPanel status={smtpStatus} onRefreshStatus={fetchSmtpStatus} />
        )}

        {activeTab === 'docs' && <ApiDocs />}

        {activeTab === 'logs' && (
          <SentLogs logs={logs} onRefresh={fetchLogs} isLoading={isLoadingLogs} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Servizio Backend Node.js per invio email SMTP • Accesso Protetto (Ruolo: Admin)
          </span>
          <span className="font-mono">
            API Protette con Authorization: Bearer &lt;key&gt; o x-api-key
          </span>
        </div>
      </footer>
    </div>
  );
}
