import Handlebars from 'handlebars';
import { EmailTemplate } from '../src/types/mail.js';
import { FIP_LOGO_WHITE_BASE64, FIP_LOGO_BLUE_BASE64 } from './fipLogos.js';

// Registrazione helper personalizzati per Handlebars
Handlebars.registerHelper('formatCurrency', function (value: number | string, currency: string = 'EUR') {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return value;
  try {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(num);
  } catch {
    return `${num.toFixed(2)} €`;
  }
});
 
Handlebars.registerHelper('formatDate', function (value: string | number | Date) {
  if (!value) return '';
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return String(value);
  }
});

Handlebars.registerHelper('uppercase', function (str: string) {
  return typeof str === 'string' ? str.toUpperCase() : '';
});

Handlebars.registerHelper('lowercase', function (str: string) {
  return typeof str === 'string' ? str.toLowerCase() : '';
});

Handlebars.registerHelper('eq', function (a: any, b: any) {
  return a === b;
});

Handlebars.registerHelper('ne', function (a: any, b: any) {
  return a !== b;
});

Handlebars.registerHelper('default', function (value: any, defaultValue: any) {
  return value !== undefined && value !== null && value !== '' ? value : defaultValue;
});

// Template HTML Email moderni, reattivi e compatibili con tutti i client email
export const defaultTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Benvenuto & Attivazione Account',
    description: 'Email di onboarding con pulsante di attivazione e riepilogo credenziali',
    category: 'onboarding',
    defaultSubject: 'Benvenuto in {{companyName}}, {{userName}}! Attiva il tuo account',
    sampleData: {
      companyName: 'TechNova Cloud',
      userName: 'Marco Bianchi',
      userEmail: 'marco.bianchi@example.com',
      activationLink: 'https://technova.example.com/activate?token=abc-12345',
      expiryHours: 24,
      supportEmail: 'supporto@technova.example.com',
    },
    variables: [
      { key: 'companyName', label: 'Nome Azienda', type: 'string', description: 'Nome del servizio o azienda' },
      { key: 'userName', label: 'Nome Utente', type: 'string', description: 'Nome e cognome destinatario' },
      { key: 'userEmail', label: 'Email Utente', type: 'string', description: 'Indirizzo email registrato' },
      { key: 'activationLink', label: 'Link Attivazione', type: 'string', description: 'URL con token di conferma' },
      { key: 'expiryHours', label: 'Ore di Scadenza', type: 'number', description: 'Tempo limite per attivazione' },
      { key: 'supportEmail', label: 'Email Supporto', type: 'string', description: 'Contatto per assistenza' },
    ],
    html: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto in {{companyName}}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
    .content { padding: 40px; color: #334155; line-height: 1.6; font-size: 15px; }
    .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .badge { display: inline-block; background-color: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 6px; font-size: 13px; margin: 12px 0 24px; }
    .cta-container { text-align: center; margin: 32px 0; }
    .button { background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px; }
    .notice { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #1e40af; margin-top: 24px; }
    .footer { padding: 24px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>{{companyName}}</h1>
      </div>
      <div class="content">
        <div class="greeting">Ciao {{userName}},</div>
        <p>Siamo felici di darti il benvenuto nella nostra piattaforma! Il tuo account è stato predisposto con successo.</p>
        <div class="badge">Account: <strong>{{userEmail}}</strong></div>
        <p>Per completare la configurazione e accedere a tutti i servizi, ti chiediamo di confermare il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
        <div class="cta-container">
          <a href="{{activationLink}}" class="button" target="_blank">Attiva il mio Account</a>
        </div>
        <div class="notice">
          <strong>Nota di sicurezza:</strong> Questo link rimarrà attivo per <strong>{{expiryHours}} ore</strong>. Se non hai richiesto tu la registrazione, puoi ignorare questa comunicazione.
        </div>
        <p style="margin-top: 24px; font-size: 14px;">Hai dubbi o domande? Rispondi a questa email o scrivici a <a href="mailto:{{supportEmail}}" style="color: #2563eb;">{{supportEmail}}</a>.</p>
      </div>
      <div class="footer">
        © {{companyName}} • Comunicazione di servizio automatica inviata via SMTP Node.js
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'order_confirmation',
    name: 'Conferma Ordine E-commerce',
    description: 'Riepilogo acquisto con tabella prodotti dinamica, totali e tracking',
    category: 'ecommerce',
    defaultSubject: 'Conferma d\'ordine #{{orderId}} - Grazie per il tuo acquisto!',
    sampleData: {
      orderId: 'ORD-98421',
      customerName: 'Giulia Colombo',
      orderDate: '2026-09-10T10:30:00Z',
      items: [
        { name: 'Sensore IoT Ambientale Pro', quantity: 2, price: 49.90, total: 99.80 },
        { name: 'Gateway LoRaWAN Din-Rail', quantity: 1, price: 189.00, total: 189.00 },
        { name: 'Antenna Omnidirezionale 868MHz', quantity: 1, price: 29.50, total: 29.50 },
      ],
      subtotal: 318.30,
      shipping: 0.00,
      tax: 69.96,
      total: 388.26,
      shippingAddress: 'Via Roma 42, 20121 Milano (MI)',
      trackingUrl: 'https://tracking.example.com/shipments/TRK-98421',
      estimatedDelivery: '12-14 Settembre 2026',
    },
    variables: [
      { key: 'orderId', label: 'Numero Ordine', type: 'string', description: 'Identificativo univoco ordine' },
      { key: 'customerName', label: 'Nome Cliente', type: 'string', description: 'Nome acquirente' },
      { key: 'orderDate', label: 'Data Ordine', type: 'string', description: 'Data e ora ordine' },
      { key: 'items', label: 'Articoli (Array)', type: 'array', description: 'Lista prodotti (name, quantity, price, total)' },
      { key: 'subtotal', label: 'Subtotale', type: 'number', description: 'Imponibile totale' },
      { key: 'shipping', label: 'Spese di Spedizione', type: 'number', description: 'Costo consegna' },
      { key: 'tax', label: 'IVA / Imposte', type: 'number', description: 'Totale imposte' },
      { key: 'total', label: 'Totale Ordine', type: 'number', description: 'Importo totale finale' },
      { key: 'shippingAddress', label: 'Indirizzo Spedizione', type: 'string', description: 'Destinazione merci' },
      { key: 'trackingUrl', label: 'Link Tracking', type: 'string', description: 'URL tracciamento corriere' },
    ],
    html: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ordine #{{orderId}} Confermato</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 32px 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #047857; padding: 28px 32px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px; color: #334155; font-size: 14px; line-height: 1.5; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0 24px; display: table; width: 100%; box-sizing: border-box; }
    .meta-item { display: table-cell; width: 50%; vertical-align: top; }
    .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .val { font-size: 14px; font-weight: 600; color: #0f172a; }
    .table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
    .table th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; }
    .table td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; }
    .totals { width: 100%; margin-top: 16px; }
    .totals td { padding: 6px 8px; font-size: 14px; }
    .totals .grand-total { font-size: 17px; font-weight: 700; color: #0f172a; border-top: 2px solid #0f172a; padding-top: 10px; }
    .tracking-btn { display: inline-block; background: #047857; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Ordine Confermato • #{{orderId}}</h1>
        <p>Grazie {{customerName}}, stiamo preparando i tuoi articoli.</p>
      </div>
      <div class="content">
        <div class="meta-box">
          <div class="meta-item">
            <div class="label">Data Ordine</div>
            <div class="val">{{formatDate orderDate}}</div>
          </div>
          <div class="meta-item">
            <div class="label">Destinazione</div>
            <div class="val">{{shippingAddress}}</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Articolo</th>
              <th style="text-align: center;">Qtà</th>
              <th style="text-align: right;">Prezzo</th>
              <th style="text-align: right;">Totale</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td><strong>{{name}}</strong></td>
              <td style="text-align: center;">{{quantity}}</td>
              <td style="text-align: right;">{{formatCurrency price}}</td>
              <td style="text-align: right; font-weight: 600;">{{formatCurrency total}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>

        <table class="totals" align="right" style="max-width: 280px; margin-left: auto;">
          <tr>
            <td style="color: #64748b;">Subtotale:</td>
            <td align="right">{{formatCurrency subtotal}}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Spedizione:</td>
            <td align="right">{{#if shipping}}{{formatCurrency shipping}}{{else}}Gratuita{{/if}}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">IVA (22%):</td>
            <td align="right">{{formatCurrency tax}}</td>
          </tr>
          <tr class="grand-total">
            <td>Totale:</td>
            <td align="right">{{formatCurrency total}}</td>
          </tr>
        </table>
        <div style="clear: both;"></div>

        {{#if trackingUrl}}
        <div style="text-align: center; margin-top: 24px;">
          <a href="{{trackingUrl}}" class="tracking-btn" target="_blank">Traccia Spedizione</a>
          {{#if estimatedDelivery}}
          <p style="font-size: 13px; color: #64748b; margin-top: 8px;">Consegna stimata: <strong>{{estimatedDelivery}}</strong></p>
          {{/if}}
        </div>
        {{/if}}
      </div>
      <div class="footer">
        Ricevi questa email perché hai effettuato un acquisto sul nostro shop. Per assistenza scrivi al servizio clienti.
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'password_reset',
    name: 'Reset Password & Sicurezza',
    description: 'Email di sicurezza con link monouso per reimpostazione credenziali',
    category: 'security',
    defaultSubject: 'Richiesta di reimpostazione password per il tuo account',
    sampleData: {
      userName: 'Alessandro Neri',
      resetUrl: 'https://app.example.com/reset-password?token=sec_9938a8e1b3',
      expiryMinutes: 15,
      ipAddress: '151.48.201.12 (Milano, IT)',
      requestedAt: '2026-09-10T11:45:00Z',
    },
    variables: [
      { key: 'userName', label: 'Nome Utente', type: 'string', description: 'Nome destinatario' },
      { key: 'resetUrl', label: 'Link Reset', type: 'string', description: 'URL sicuro con token' },
      { key: 'expiryMinutes', label: 'Minuti di Validità', type: 'number', description: 'Scadenza token' },
      { key: 'ipAddress', label: 'Indirizzo IP', type: 'string', description: 'IP da cui è partita la richiesta' },
      { key: 'requestedAt', label: 'Orario Richiesta', type: 'string', description: 'Timestamp' },
    ],
    html: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reimposta Password</title>
  <style>
    body { margin: 0; padding: 0; background-color: #fef2f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { width: 100%; padding: 40px 0; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #fee2e2; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.05); }
    .header { background: #991b1b; padding: 28px 32px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 36px 32px; color: #374151; font-size: 15px; line-height: 1.6; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { background: #dc2626; color: #ffffff !important; padding: 13px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
    .info-box { background: #fef2f2; border: 1px solid #fecaca; padding: 14px; border-radius: 8px; font-size: 13px; color: #7f1d1d; margin-top: 24px; }
    .footer { padding: 20px; background: #fafafa; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Centro Sicurezza</h1>
      </div>
      <div class="content">
        <p>Gentile <strong>{{userName}}</strong>,</p>
        <p>Abbiamo ricevuto una richiesta di reimpostazione password per il tuo account. Se sei stato tu ad avanzare la richiesta, clicca sul pulsante sottostante:</p>
        <div class="btn-wrap">
          <a href="{{resetUrl}}" class="btn" target="_blank">Reimposta la tua Password</a>
        </div>
        <p style="font-size: 14px; color: #4b5563;">Il link resterà valido per i prossimi <strong>{{expiryMinutes}} minuti</strong>.</p>
        <div class="info-box">
          <strong>Dettagli richiesta:</strong><br>
          • Data/Ora: {{formatDate requestedAt}}<br>
          • Indirizzo IP: {{ipAddress}}<br>
          Se non hai effettuato tu questa richiesta, il tuo account potrebbe essere a rischio. Ti consigliamo di contattare subito il supporto e non inoltrare questa email a nessuno.
        </div>
      </div>
      <div class="footer">
        Protezione dell'account • Invio sicuro via SMTP
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'invoice',
    name: 'Notifica Fattura Elettronica / Proforma',
    description: 'Documento contabile con importi, scadenze e link al download PDF',
    category: 'billing',
    defaultSubject: 'Fattura n. {{invoiceNumber}} emessa per {{clientName}}',
    sampleData: {
      clientName: 'Studio Tecnico Associato Delta',
      invoiceNumber: 'FAT-2026/0412',
      issueDate: '2026-09-01',
      dueDate: '2026-09-30',
      amount: 1450.00,
      currency: 'EUR',
      status: 'In attesa di pagamento',
      paymentMethod: 'Bonifico Bancario 30 gg D.F. (IBAN IT60X0542811101000000123456)',
      downloadUrl: 'https://billing.example.com/invoices/FAT-2026-0412.pdf',
    },
    variables: [
      { key: 'clientName', label: 'Nome Cliente / Ragione Sociale', type: 'string' },
      { key: 'invoiceNumber', label: 'Numero Fattura', type: 'string' },
      { key: 'issueDate', label: 'Data Emissione', type: 'string' },
      { key: 'dueDate', label: 'Data Scadenza', type: 'string' },
      { key: 'amount', label: 'Importo Totale', type: 'number' },
      { key: 'status', label: 'Stato Pagamento', type: 'string' },
      { key: 'paymentMethod', label: 'Modalità di Pagamento', type: 'string' },
      { key: 'downloadUrl', label: 'Link Download PDF', type: 'string' },
    ],
    html: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fattura {{invoiceNumber}}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { width: 100%; padding: 32px 0; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; }
    .header { background: #1e293b; padding: 24px 32px; color: #ffffff; display: table; width: 100%; box-sizing: border-box; }
    .header-left { display: table-cell; vertical-align: middle; }
    .header-right { display: table-cell; text-align: right; vertical-align: middle; }
    .content { padding: 32px; color: #334155; font-size: 14px; line-height: 1.6; }
    .amount-banner { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .amount-banner .num { font-size: 28px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .details { width: 100%; margin: 20px 0; }
    .details td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .btn { background: #0284c7; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h2 style="margin: 0; font-size: 18px;">Notifica Fattura</h2>
          <span style="font-size: 13px; color: #94a3b8;">{{invoiceNumber}}</span>
        </div>
        <div class="header-right">
          <span style="background: #334155; padding: 4px 10px; border-radius: 4px; font-size: 12px;">{{status}}</span>
        </div>
      </div>
      <div class="content">
        <p>Spettabile <strong>{{clientName}}</strong>,</p>
        <p>È stata emessa la fattura relativa ai servizi concordati. Di seguito trovi il riepilogo delle condizioni contabili:</p>
        
        <div class="amount-banner">
          <span style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600;">Importo da Saldare</span>
          <div class="num">{{formatCurrency amount currency}}</div>
        </div>

        <table class="details">
          <tr>
            <td style="color: #64748b; width: 40%;">Data Emissione:</td>
            <td><strong>{{formatDate issueDate}}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748b;">Scadenza Pagamento:</td>
            <td><strong style="color: #b91c1c;">{{formatDate dueDate}}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748b;">Modalità:</td>
            <td>{{paymentMethod}}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 28px;">
          <a href="{{downloadUrl}}" class="btn" target="_blank">Scarica Fattura PDF</a>
        </div>
      </div>
      <div class="footer">
        Ufficio Amministrazione e Contabilità • Inviato tramite servizio SMTP Node.js
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'notification',
    name: 'Notifica di Sistema / Allarme Operativo',
    description: 'Messaggio di stato/allerta con livelli di criticità e link di risoluzione',
    category: 'notification',
    defaultSubject: '[{{uppercase severity}}] Notifica Servizio: {{alertTitle}}',
    sampleData: {
      alertTitle: 'Superamento soglia CPU su cluster worker-prod-02',
      severity: 'WARNING',
      serviceName: 'Core Ingestion API',
      message: 'Il carico medio della CPU ha superato la soglia critica del 85% per oltre 10 minuti consecutivi.',
      timestamp: '2026-09-10T12:00:00Z',
      dashboardUrl: 'https://monitoring.example.com/alerts/ALT-4018',
      assignedTo: 'On-Call DevOps Team',
    },
    variables: [
      { key: 'alertTitle', label: 'Titolo Allerta', type: 'string' },
      { key: 'severity', label: 'Gravità (INFO/WARNING/CRITICAL)', type: 'string' },
      { key: 'serviceName', label: 'Nome Servizio', type: 'string' },
      { key: 'message', label: 'Dettagli / Messaggio', type: 'string' },
      { key: 'timestamp', label: 'Data e Ora', type: 'string' },
      { key: 'dashboardUrl', label: 'Link Monitoraggio', type: 'string' },
      { key: 'assignedTo', label: 'Assegnato a', type: 'string' },
    ],
    html: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{alertTitle}}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; }
    .wrapper { width: 100%; padding: 32px 0; }
    .container { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 10px; border: 1px solid #334155; color: #f8fafc; }
    .header { padding: 20px 24px; border-bottom: 1px solid #334155; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #f59e0b; color: #000; text-transform: uppercase; }
    .badge.critical { background: #ef4444; color: #fff; }
    .content { padding: 24px; font-size: 14px; line-height: 1.6; }
    .metric-box { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 16px; margin: 16px 0; font-family: monospace; font-size: 13px; color: #38bdf8; }
    .btn { background: #3b82f6; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 13px; }
    .footer { padding: 16px 24px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="badge {{lowercase severity}}">{{severity}}</span>
        <h3 style="margin: 10px 0 0; font-size: 17px; color: #f8fafc;">{{alertTitle}}</h3>
      </div>
      <div class="content">
        <p style="color: #94a3b8; margin-top: 0;">Servizio interessato: <strong style="color: #f8fafc;">{{serviceName}}</strong></p>
        <div class="metric-box">
          {{message}}<br><br>
          Timestamp: {{formatDate timestamp}}<br>
          Assegnatario: {{assignedTo}}
        </div>
        <p style="font-size: 13px; color: #94a3b8;">Verifica lo stato delle risorse e intervieni tramite la dashboard dedicata.</p>
        <div style="margin-top: 20px;">
          <a href="{{dashboardUrl}}" class="btn" target="_blank">Apri Dashboard Incidenti</a>
        </div>
      </div>
      <div class="footer">
        Alert generato in automatico dal motore di monitoraggio • Node.js SMTP Delivery
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'course_info_request',
    name: 'Info Corsi Arbitri CIA',
    description: 'Segnalazione candidato corso arbitri per il Presidente regionale CIA',
    category: 'education',
    defaultSubject: 'Segnalazione corso arbitri - {{name}} {{surname}} ({{city}})',
    sampleData: {
      region: 'Lombardia',
      name: 'Gianluca',
      surname: 'Atzeni',
      city: 'Milano',
      mail: 'gianluca.atzeni2000@gmail.com',
      telephone: '+39 340 1234567',
      recipient: 'lombardia@cia.example.it',
      coordinator: 'coordinamento.corsi@cia.example.it',
      to_email: 'lombardia@cia.example.it',
      admin_email: 'coordinamento.corsi@cia.example.it',
      cc_email: 'gianluca.atzeni2000@gmail.com',
      regional_email: 'lombardia@cia.example.it',
      regional_committee: 'CIA Lombardia',
      submitted_at: '10/09/2026, 12:03:21',
    },
    variables: [
      { key: 'name', label: 'Nome Candidato', type: 'string', description: 'Nome del candidato' },
      { key: 'surname', label: 'Cognome Candidato', type: 'string', description: 'Cognome del candidato' },
      { key: 'city', label: 'Provincia di Residenza', type: 'string', description: 'Provincia o città di residenza' },
      { key: 'mail', label: 'Indirizzo Mail', type: 'string', description: 'Email del candidato' },
      { key: 'telephone', label: 'Cellulare', type: 'string', description: 'Numero di cellulare del candidato' },
      { key: 'region', label: 'Regione', type: 'string', description: 'Regione del comitato' },
      { key: 'regional_committee', label: 'Comitato Regionale', type: 'string', description: 'Es. CIA Lombardia' },
    ],
    html: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Corso Arbitri CIA - Segnalazione Candidato</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b; }
    .wrapper { width: 100%; background-color: #f8fafc; padding: 32px 0; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04); }
    .header { background: #0c2356; padding: 20px 28px; border-bottom: 3px solid #2563eb; }
    .header table { width: 100%; border-collapse: collapse; }
    .header td { vertical-align: middle; }
    .header .logo-cell { width: 52px; padding-right: 16px; }
    .header .logo-img { display: block; width: 46px; height: 46px; border: 0; }
    .header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em; line-height: 1.25; }
    .header p { margin: 3px 0 0; font-size: 12px; color: #cbd5e1; line-height: 1.3; }
    .content { padding: 32px; font-size: 15px; line-height: 1.65; color: #334155; }
    .salutation { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .contacts-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .contacts-list { list-style: none; padding: 0; margin: 0; font-size: 14px; }
    .contacts-list li { margin: 8px 0; }
    .contacts-list strong { color: #0f172a; }
    .link-mail { color: #2563eb; text-decoration: underline; font-weight: 500; }
    .link-tel { color: #0f172a; text-decoration: underline; font-weight: 600; }
    .actions { margin: 24px 0 16px 0; }
    .btn-action { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 8px; margin-bottom: 8px; }
    .btn-secondary { display: inline-block; background-color: #059669; color: #ffffff !important; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
    .closing { margin-top: 24px; }
    .signature { font-weight: 700; color: #0f172a; font-size: 15px; margin-top: 4px; }
    .footer { padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    .footer table { margin: 0 auto; border-collapse: collapse; }
    .footer td { vertical-align: middle; }
    .footer-logo { display: block; width: 20px; height: 20px; border: 0; opacity: 0.85; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td class="logo-cell">
              <img src="data:image/png;base64,${FIP_LOGO_WHITE_BASE64}" width="46" height="46" alt="Logo FIP" class="logo-img" />
            </td>
            <td>
              <h2>Comitato Italiano Arbitri</h2>
              <p>Segnalazione candidato corso arbitri</p>
            </td>
          </tr>
        </table>
      </div>

      <div class="content">
        <div class="salutation">Caro Presidente,</div>

        <p style="margin: 0 0 16px 0;">
          ti segnaliamo che <strong>{{name}} {{surname}}</strong> è interessato a partecipare al corso arbitri presso la tua regione; la sua provincia di residenza è <strong>{{city}}</strong>.
        </p>

        <p style="margin: 0 0 8px 0;">
          Ti chiediamo di contattare <strong>{{name}}</strong>, di seguito i suoi recapiti:
        </p>

        <div class="contacts-box">
          <ul class="contacts-list">
            <li>• <strong>indirizzo mail</strong>: <a href="mailto:{{mail}}?subject=Corso%20Arbitri%20CIA" class="link-mail">{{mail}}</a></li>
            <li>• <strong>cellulare</strong>: <a href="tel:{{telephone}}" class="link-tel">{{telephone}}</a></li>
          </ul>
        </div>

        <div class="actions">
          <a href="mailto:{{mail}}?subject=Corso%20Arbitri%20CIA%20-%20Informazioni" class="btn-action" target="_blank">
            Invia Email al Candidato
          </a>
          {{#if telephone}}
          <a href="tel:{{telephone}}" class="btn-secondary">
            Chiama al Cellulare
          </a>
          {{/if}}
        </div>

        <div class="closing">
          Grazie per la collaborazione.<br>
          A presto e buon lavoro!
        </div>
      </div>

      <div class="footer">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <img src="data:image/png;base64,${FIP_LOGO_BLUE_BASE64}" width="20" height="20" alt="FIP" class="footer-logo" />
            </td>
            <td style="font-size: 12px; color: #64748b;">
              Comunicazione automatica generata per il Comitato Regionale CIA {{region}}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
];

/**
 * Estrae le variabili Handlebars presenti in un template
 */
export function extractVariablesFromTemplate(content: string): string[] {
  const vars = new Set<string>();
  const regex = /{{\s*(?:#if\s+|#each\s+|#unless\s+)?([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const varName = match[1];
    if (
      !['formatCurrency', 'formatDate', 'uppercase', 'lowercase', 'eq', 'ne', 'default', 'this'].includes(
        varName,
      )
    ) {
      vars.add(varName);
    }
  }
  return Array.from(vars);
}

/**
 * Renderizza un template Handlebars con i parametri in input
 */
export function renderEmail(templateHtml: string, data: Record<string, any>): string {
  const compiled = Handlebars.compile(templateHtml);
  return compiled(data || {});
}

/**
 * Renderizza l'oggetto dell'email con i parametri
 */
export function renderSubject(subjectTemplate: string, data: Record<string, any>): string {
  if (!subjectTemplate) return '';
  const compiled = Handlebars.compile(subjectTemplate);
  return compiled(data || {});
}
