import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';
import { EmailLogEntry, SendEmailPayload, SendEmailResult, SmtpConfig } from '../src/types/mail.js';
import { defaultTemplates, renderEmail, renderSubject } from './templates.js';

// Memoria in-process per salvare lo storico degli invii
const emailLogs: EmailLogEntry[] = [];

// Transporter di default (o Ethereal se non configurato da .env)
let defaultTransporter: Transporter | null = null;
let etherealAccount: any = null;

/**
 * Ottiene la configurazione SMTP corrente da variabili d'ambiente o fallback
 */
export function getEnvSmtpConfig(): Partial<SmtpConfig> {
  return {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Node.js Mail Service <noreply@example.com>',
  };
}

/**
 * Crea o riutilizza un account Ethereal per test sicuri senza server SMTP reale
 */
export async function getOrCreateEtherealTransporter(): Promise<{ transporter: Transporter; account: any }> {
  if (defaultTransporter && etherealAccount) {
    return { transporter: defaultTransporter, account: etherealAccount };
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealAccount = testAccount;
    defaultTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[SMTP] Account di test Ethereal generato: ${testAccount.user}`);
    return { transporter: defaultTransporter, account: testAccount };
  } catch (err) {
    console.error('[SMTP] Errore creazione test account Ethereal:', err);
    throw err;
  }
}

/**
 * Crea un transporter nodemailer in base alla configurazione
 */
export async function createTransporter(configOverride?: Partial<SmtpConfig>): Promise<{
  transporter: Transporter;
  isTestMode: boolean;
  fromAddress: string;
  hostName: string;
}> {
  const envConfig = getEnvSmtpConfig();
  const activeConfig: Partial<SmtpConfig> = {
    ...envConfig,
    ...(configOverride || {}),
  };

  const hasExplicitConfig = Boolean(activeConfig.host && (activeConfig.user || activeConfig.port));

  if (hasExplicitConfig) {
    const rawPass = (activeConfig.pass || '').trim();
    const cleanPass = (activeConfig.host?.includes('gmail') && rawPass.includes(' '))
      ? rawPass.replace(/\s+/g, '')
      : rawPass;

    const transporter = nodemailer.createTransport({
      host: activeConfig.host,
      port: activeConfig.port || 587,
      secure: activeConfig.secure || false,
      auth: activeConfig.user
        ? {
            user: activeConfig.user,
            pass: cleanPass,
          }
        : undefined,
      tls: {
        rejectUnauthorized: false, // Per ambienti di dev e certificati self-signed
      },
    });

    return {
      transporter,
      isTestMode: false,
      fromAddress: activeConfig.from || envConfig.from || 'noreply@example.com',
      hostName: `${activeConfig.host}:${activeConfig.port}`,
    };
  }

  // Fallback ad account test Ethereal se non configurato
  const { transporter, account } = await getOrCreateEtherealTransporter();
  return {
    transporter,
    isTestMode: true,
    fromAddress: activeConfig.from || `"Test Mailer" <${account.user}>`,
    hostName: `Ethereal Sandbox (${account.smtp.host})`,
  };
}

/**
 * Verifica la connettività di un server SMTP
 */
export async function verifySmtpConnection(configOverride?: Partial<SmtpConfig>): Promise<{
  success: boolean;
  message: string;
  isTestMode: boolean;
  host: string;
  error?: string;
}> {
  try {
    const { transporter, isTestMode, hostName } = await createTransporter(configOverride);
    await transporter.verify();
    return {
      success: true,
      message: isTestMode
        ? 'Connessione SMTP verificata con successo (Ethereal Sandbox attivo).'
        : `Connessione SMTP verificata con successo a ${hostName}.`,
      isTestMode,
      host: hostName,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Impossibile verificare il server SMTP: ${error.message || error}`,
      isTestMode: false,
      host: configOverride?.host || process.env.SMTP_HOST || 'unknown',
      error: error.code || error.message,
    };
  }
}

/**
 * Invia una email renderizzando il template HTML dinamico con i parametri
 */
export async function sendEmailService(payload: SendEmailPayload): Promise<SendEmailResult> {
  const { to, subject: rawSubject, templateId, html: rawHtml, data = {}, text, from, cc, bcc, replyTo, smtpConfig } = payload;

  if (!to) {
    throw new Error('Il parametro "to" (destinatario) è obbligatorio.');
  }

  // Risoluzione template HTML e Soggetto
  let htmlToRender = rawHtml || '';
  let subjectToRender = rawSubject || '';

  if (templateId) {
    const found = defaultTemplates.find((t) => t.id === templateId);
    if (!found) {
      throw new Error(`Template con ID "${templateId}" non trovato.`);
    }
    if (!htmlToRender) htmlToRender = found.html;
    if (!subjectToRender) subjectToRender = found.defaultSubject;
  }

  if (!htmlToRender && !text) {
    throw new Error('Specificare un templateId, oppure passare un campo "html" o "text".');
  }

  // Compilazione dinamica Handlebars con i parametri in input
  const finalHtml = htmlToRender ? renderEmail(htmlToRender, data) : undefined;
  const finalSubject = subjectToRender ? renderSubject(subjectToRender, data) : 'Nessun Oggetto';

  // Fallback testo plain se non fornito
  const finalText = text || (finalHtml ? finalHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : '');

  // Istanziazione del transport
  const { transporter, isTestMode, fromAddress, hostName } = await createTransporter(smtpConfig);

  const mailOptions: SendMailOptions = {
    from: from || fromAddress,
    to,
    cc,
    bcc,
    replyTo,
    subject: finalSubject,
    html: finalHtml,
    text: finalText,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    const result: SendEmailResult = {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || false,
      accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : [],
      rejected: Array.isArray(info.rejected) ? info.rejected.map(String) : [],
      response: info.response,
      timestamp: new Date().toISOString(),
    };

    // Salvataggio nei log recenti
    emailLogs.unshift({
      id: info.messageId || `log_${Date.now()}`,
      timestamp: result.timestamp,
      to,
      subject: finalSubject,
      templateId,
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || false,
      smtpHost: hostName,
    });

    if (emailLogs.length > 50) emailLogs.pop();

    return result;
  } catch (err: any) {
    const errorMsg = err.message || String(err);

    emailLogs.unshift({
      id: `err_${Date.now()}`,
      timestamp: new Date().toISOString(),
      to,
      subject: finalSubject,
      templateId,
      success: false,
      error: errorMsg,
      smtpHost: hostName,
    });
    if (emailLogs.length > 50) emailLogs.pop();

    throw new Error(`Errore durante l'invio SMTP: ${errorMsg}`);
  }
}

/**
 * Ritorna la lista dei log di invio recenti
 */
export function getEmailLogs(): EmailLogEntry[] {
  return emailLogs;
}
