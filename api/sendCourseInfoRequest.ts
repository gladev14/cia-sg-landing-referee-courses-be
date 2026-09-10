import { sendEmailService } from '../server/mailer.js';
import type { SendEmailPayload } from '../src/types/mail.js';

export default async function handler(req: any, res: any) {
  // 1. Configurazione CORS universale via codice
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, x-auth-token'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  // 2. Intercetta immediatamente le chiamate preflight OPTIONS del browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Health check veloce su GET
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      endpoint: '/api/sendCourseInfoRequest',
      time: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: `Metodo HTTP ${req.method} non consentito. Usa POST.`,
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
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
    } = body;

    if (!name || !surname || !mail) {
      return res.status(400).json({
        success: false,
        error: 'Parametri obbligatori mancanti: name, surname, mail.',
      });
    }

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
    const text = `Caro Presidente,\nti segnaliamo che ${name} ${surname} è interessato a partecipare al corso arbitri presso la tua regione; la sua provincia di residenza è ${city || 'N/D'}.\n\nTi chiediamo di contattare ${name}, di seguito i suoi recapiti:\n- indirizzo mail -> ${mail}\n- cellulare -> ${telephone}\n\nGrazie per la collaborazione.\nA presto,\nCMEL`;

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

    return res.status(200).json({
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
    console.error('[Vercel sendCourseInfoRequest error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Errore durante l\'invio della richiesta informazioni corso',
    });
  }
}
