import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, FileText, Send, Server, History, GraduationCap } from 'lucide-react';

interface NavbarProps {
  activeTab: 'course' | 'send' | 'templates' | 'smtp' | 'docs' | 'logs';
  onTabChange: (tab: 'course' | 'send' | 'templates' | 'smtp' | 'docs' | 'logs') => void;
  smtpStatus: {
    isConfigured: boolean;
    mode: string;
    host: string;
  } | null;
  logsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, smtpStatus, logsCount }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 text-base sm:text-lg tracking-tight">
                  SMTP Mail Service
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  Node.js Backend
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Invio email via SMTP con template HTML dinamici e parametri Handlebars
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-3">
            {smtpStatus ? (
              <div
                className={`hidden md:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  smtpStatus.isConfigured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {smtpStatus.isConfigured ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SMTP Configurato ({smtpStatus.host})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Modalità Sandbox (Ethereal)</span>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-3 border-t border-slate-100 overflow-x-auto py-2">
          <button
            id="tab-course"
            onClick={() => onTabChange('course')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'course'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Richiesta Info Corsi (sendCourseInfoRequest)</span>
          </button>

          <button
            id="tab-send"
            onClick={() => onTabChange('send')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'send'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Banco di Prova</span>
          </button>

          <button
            id="tab-templates"
            onClick={() => onTabChange('templates')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Template HTML Dinamici</span>
          </button>

          <button
            id="tab-smtp"
            onClick={() => onTabChange('smtp')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'smtp'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Configurazione SMTP</span>
          </button>

          <button
            id="tab-docs"
            onClick={() => onTabChange('docs')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>API & Integrazione</span>
          </button>

          <button
            id="tab-logs"
            onClick={() => onTabChange('logs')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Registro Invii</span>
            {logsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[11px] bg-slate-200 text-slate-700 font-bold">
                {logsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
