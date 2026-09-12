import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  defaultTemplates,
  extractVariablesFromTemplate,
  renderEmail,
  renderSubject,
} from './server/templates.js';
import {
  getEnvSmtpConfig,
  verifySmtpConnection,
  sendEmailService,
  getEmailLogs,
  getOrCreateEtherealTransporter,
} from './server/mailer.js';
import { EmailTemplate, RenderTemplatePayload, SendEmailPayload } from './src/types/mail.js';
import {
  requireAuth,
  handleLogin,
  handleAuthStatus,
  handleLogout,
  getAdminApiKey,
  extractAuthToken,
  validateTokenOrKey,
} from './server/auth.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 3000;

// Configurazione CORS universale e permissiva per qualsiasi frontend (Vercel, localhost, etc.)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-api-key',
      'x-auth-token',
    ],
    exposedHeaders: ['Authorization'],
  })
);

// Fallback manuale per garantire sempre header CORS e gestire istantaneamente OPTIONS
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, x-auth-token'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Permette payload JSON per parametri e template ampi
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// AUTORIZZAZIONE & SICUREZZA GLOBALE API
// ==========================================

// Endpoint pubblici di autenticazione e diagnostica
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Node.js SMTP Mail Service', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', handleLogin);
app.get('/api/auth/status', handleAuthStatus);
app.get('/api/auth/me', handleAuthStatus);
app.post('/api/auth/logout', handleLogout);

// Info pubblica sulle modalità di autorizzazione (senza svelare la chiave segreta)
app.get('/api/auth/info', (req, res) => {
  res.json({
    requiresAuth: true,
    supportedMethods: [
      'Authorization: Bearer <API_KEY_OR_TOKEN>',
      'x-api-key: <API_KEY>',
      'Browser Session Login (/api/auth/login)',
    ],
    hasConfiguredKey: Boolean(getAdminApiKey()),
  });
});

// Endpoint dedicato: sendCourseInfoRequest (Richiesta Informazioni Corsi CIA con routing regionale)
// Supporta sia chiamate dal FE pubblico dei candidati sia chiamate autorizzate
const handleCourseInfoRequest = async (req: express.Request, res: express.Response) => {
  try {
    // Se un token viene passato, deve essere valido
    const token = extractAuthToken(req);
    if (token) {
      const authResult = validateTokenOrKey(token);
      if (!authResult.valid) {
        return res.status(401).json({
          success: false,
          error: 'Credenziale di autorizzazione non valida.',
        });
      }
    }

    const {
      region,
      name,
      surname,
      city,
      mail,
      telephone,
      recipient,
      coordinator,
      to_email,
      admin_email,
      cc_email,
      regional_email,
      regional_committee,
      submitted_at,
    } = req.body || {};

    // Validazione parametri essenziali
    if (!name || !surname || !mail) {
      return res.status(400).json({
        success: false,
        error: 'Parametri obbligatori mancanti: name, surname, mail.',
      });
    }

    // Risoluzione destinatari e routing
    const targetRecipient = to_email || recipient || regional_email;
    if (!targetRecipient) {
      return res.status(400).json({
        success: false,
        error: 'Nessun indirizzo destinatario specificato (recipient / to_email / regional_email).',
      });
    }

    const targetCc = cc_email || mail;
    const targetBcc = coordinator || admin_email;
    const computedCommittee = regional_committee || (region ? `CIA ${region}` : 'Comitato Regionale CIA');
    const computedSubmittedAt =
      submitted_at || new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });

    const subject = `Segnalazione corso arbitri - ${name} ${surname} (${city || region || 'N/D'})`;
    const text = `Caro Presidente,\nti segnaliamo che ${name} ${surname} è interessato a partecipare al corso arbitri presso la tua regione; la sua provincia di residenza è ${city || 'N/D'}.\n\nTi chiediamo di contattare ${name}, di seguito i suoi recapiti:\n\n• indirizzo mail: ${mail}\n• cellulare: ${telephone}\n\nGrazie per la collaborazione.\nA presto e buon lavoro!`;

    const payload: SendEmailPayload = {
      to: targetRecipient,
      cc: targetCc,
      bcc: targetBcc,
      replyTo: `${name} ${surname} <${mail}>`,
      subject,
      text,
      templateId: 'course_info_request',
      data: {
        region: region || '',
        name,
        surname,
        city: city || '',
        mail,
        telephone: telephone || '',
        recipient: targetRecipient,
        coordinator: coordinator || admin_email || '',
        to_email: targetRecipient,
        admin_email: admin_email || coordinator || '',
        cc_email: targetCc,
        regional_email: regional_email || targetRecipient,
        regional_committee: computedCommittee,
        submitted_at: computedSubmittedAt,
      },
    };

    const result = await sendEmailService(payload);

    res.json({
      success: true,
      message: `Richiesta informazioni corso per ${name} ${surname} inviata con successo a ${targetRecipient}`,
      routing: {
        to: targetRecipient,
        cc: targetCc,
        bcc: targetBcc,
        replyTo: `${name} ${surname} <${mail}>`,
        regional_committee: computedCommittee,
      },
      delivery: result,
    });
  } catch (err: any) {
    console.error('[API sendCourseInfoRequest error]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Errore durante l\'invio della richiesta informazioni corso',
    });
  }
};

app.post('/api/sendCourseInfoRequest', handleCourseInfoRequest);
app.post('/api/send-course-info-request', handleCourseInfoRequest);

// Middleware di protezione su TUTTI gli altri endpoint /api/* (invio email arbitrarie, configurazione SMTP, log)
app.use('/api', requireAuth);

// In-memory array per template personalizzati creati via API
const customTemplates: EmailTemplate[] = [];

// ==========================================
// API ROUTES (PROTETTE DA AUTORIZZAZIONE)
// ==========================================

// 2. Lista di tutti i template HTML disponibili
app.get('/api/templates', (req, res) => {
  const all = [...defaultTemplates, ...customTemplates];
  res.json({ templates: all });
});

// 3. Dettaglio singolo template
app.get('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const all = [...defaultTemplates, ...customTemplates];
  const found = all.find((t) => t.id === id);
  if (!found) {
    return res.status(404).json({ error: `Template "${id}" non trovato.` });
  }
  res.json({ template: found });
});

// 4. Creazione nuovo template personalizzato
app.post('/api/templates', (req, res) => {
  try {
    const { name, description, defaultSubject, html, sampleData = {}, category = 'custom' } = req.body;
    if (!name || !html) {
      return res.status(400).json({ error: 'Campi "name" e "html" obbligatori.' });
    }

    const id = `custom_${Date.now()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const detectedVars = extractVariablesFromTemplate(html);
    const variables = detectedVars.map((v) => ({
      key: v,
      label: v,
      type: 'string' as const,
    }));

    const newTemplate: EmailTemplate = {
      id,
      name,
      description: description || 'Template HTML dinamico personalizzato',
      category,
      defaultSubject: defaultSubject || 'Notifica {{name}}',
      html,
      sampleData,
      variables,
    };

    customTemplates.push(newTemplate);
    res.status(201).json({ success: true, template: newTemplate });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Render dinamico di un template con parametri in input (senza invio)
app.post('/api/templates/render', (req, res) => {
  try {
    const { templateId, html, subject, data = {} }: RenderTemplatePayload = req.body;

    let targetHtml = html || '';
    let targetSubject = subject || '';

    if (templateId) {
      const all = [...defaultTemplates, ...customTemplates];
      const found = all.find((t) => t.id === templateId);
      if (!found) {
        return res.status(404).json({ error: `Template con id "${templateId}" non trovato.` });
      }
      if (!targetHtml) targetHtml = found.html;
      if (!targetSubject) targetSubject = found.defaultSubject;
    }

    if (!targetHtml) {
      return res.status(400).json({ error: 'Specificare "templateId" oppure "html".' });
    }

    const renderedHtml = renderEmail(targetHtml, data);
    const renderedSubject = renderSubject(targetSubject, data);
    const detectedVariables = extractVariablesFromTemplate(targetHtml);

    res.json({
      success: true,
      html: renderedHtml,
      subject: renderedSubject,
      detectedVariables,
    });
  } catch (err: any) {
    res.status(400).json({ error: `Errore durante il rendering del template: ${err.message}` });
  }
});

// 6. Invio Email via SMTP con supporto template HTML dinamici
app.post('/api/send-email', async (req, res) => {
  try {
    const payload: SendEmailPayload = req.body;

    if (!payload || !payload.to) {
      return res.status(400).json({ error: 'Campo "to" (destinatario) mancante.' });
    }

    const result = await sendEmailService(payload);
    res.json(result);
  } catch (err: any) {
    console.error('[API send-email error]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Errore interno durante l\'invio della mail',
    });
  }
});

// 7. Verifica connessione server SMTP
app.post('/api/smtp/verify', async (req, res) => {
  try {
    const { smtpConfig } = req.body || {};
    const result = await verifySmtpConnection(smtpConfig);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Stato configurazione SMTP corrente
app.get('/api/smtp/status', (req, res) => {
  const envConfig = getEnvSmtpConfig();
  const isConfigured = Boolean(envConfig.host && (envConfig.user || envConfig.port));

  res.json({
    isConfigured,
    mode: isConfigured ? 'production_smtp' : 'ethereal_sandbox',
    config: {
      host: envConfig.host || '(non configurato in .env - usa Ethereal sandbox)',
      port: envConfig.port,
      secure: envConfig.secure,
      user: envConfig.user ? `${envConfig.user.substring(0, 3)}***` : '(vuoto)',
      hasPassword: Boolean(envConfig.pass),
      from: envConfig.from,
    },
  });
});

// 9. Genera account Ethereal esplicito per test
app.post('/api/smtp/test-account', async (req, res) => {
  try {
    const { account } = await getOrCreateEtherealTransporter();
    res.json({
      success: true,
      account: {
        user: account.user,
        pass: account.pass,
        smtp: account.smtp,
        imap: account.imap,
        pop3: account.pop3,
        web: account.web,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Storico dei log di invio
app.get('/api/logs', (req, res) => {
  res.json({ logs: getEmailLogs() });
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SMTP Mail Service] Server in ascolto su http://0.0.0.0:${PORT}`);
  });
}

export default app;
export { app };

// Avvio server standalone se non eseguito in ambiente serverless
if (!process.env.VERCEL) {
  start().catch((err) => {
    console.error('Errore avvio server:', err);
  });
}
