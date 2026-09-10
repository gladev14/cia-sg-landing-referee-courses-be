import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmailSender } from './components/EmailSender';
import { TemplateGallery } from './components/TemplateGallery';
import { SmtpConfigPanel } from './components/SmtpConfigPanel';
import { ApiDocs } from './components/ApiDocs';
import { SentLogs } from './components/SentLogs';
import { CourseInfoFormTester } from './components/CourseInfoFormTester';
import { EmailTemplate, EmailLogEntry } from './types/mail';

export default function App() {
  const [activeTab, setActiveTab] = useState<'course' | 'send' | 'templates' | 'smtp' | 'docs' | 'logs'>('course');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('course_info_request');
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Caricamento iniziale template
  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
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
  };

  // Caricamento stato SMTP
  const fetchSmtpStatus = async () => {
    try {
      const res = await fetch('/api/smtp/status');
      const data = await res.json();
      setSmtpStatus(data);
    } catch (err) {
      console.error('Errore caricamento stato SMTP:', err);
    }
  };

  // Caricamento log invii
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Errore caricamento log:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchSmtpStatus();
    fetchLogs();
  }, []);

  const handleEmailSent = () => {
    fetchLogs();
  };

  const handleSelectTemplateAndGoToSend = (id: string) => {
    setSelectedTemplateId(id);
    setActiveTab('send');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
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
            Servizio Backend Node.js per invio email SMTP • Supporto Handlebars & HTML dinamici
          </span>
          <span className="font-mono">
            API Endpoints: /api/send-email • /api/templates/render • /api/smtp/verify
          </span>
        </div>
      </footer>
    </div>
  );
}
