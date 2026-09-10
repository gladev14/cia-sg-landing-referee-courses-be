import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, Globe } from 'lucide-react';

export const ApiDocs: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'node' | 'python'>('curl');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlCode = `curl -X POST http://localhost:3000/api/send-email \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "cliente@azienda.it",
    "templateId": "order_confirmation",
    "subject": "Conferma Ordine #{{orderId}}",
    "data": {
      "orderId": "ORD-12345",
      "customerName": "Mario Rossi",
      "orderDate": "2026-09-10T12:00:00Z",
      "items": [
        { "name": "Licenza Cloud Pro", "quantity": 1, "price": 99.00, "total": 99.00 },
        { "name": "Supporto Dedicato 24/7", "quantity": 1, "price": 49.00, "total": 49.00 }
      ],
      "subtotal": 148.00,
      "shipping": 0.00,
      "tax": 32.56,
      "total": 180.56,
      "shippingAddress": "Via Garibaldi 10, Torino",
      "trackingUrl": "https://tracking.example.com/shipments/TRK-98421"
    }
  }'`;

  const nodeCode = `// Esempio Node.js (con fetch nativo)
async function sendNotificationEmail() {
  const payload = {
    to: "destinatario@azienda.it",
    templateId: "welcome", // oppure codice HTML dinamico nel campo 'html'
    data: {
      companyName: "Acme Corp",
      userName: "Laura Verdi",
      userEmail: "laura.verdi@example.com",
      activationLink: "https://app.example.com/activate?token=xyz-987",
      expiryHours: 48,
      supportEmail: "help@example.com"
    }
  };

  const response = await fetch("http://localhost:3000/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (result.success) {
    console.log("Email inviata con successo! ID:", result.messageId);
    if (result.previewUrl) {
      console.log("Visualizza anteprima Ethereal:", result.previewUrl);
    }
  } else {
    console.error("Errore invio:", result.error);
  }
}

sendNotificationEmail();`;

  const pythonCode = `import requests

url = "http://localhost:3000/api/send-email"

payload = {
    "to": "destinatario@azienda.it",
    "templateId": "password_reset",
    "data": {
        "userName": "Alessandro Neri",
        "resetUrl": "https://app.example.com/reset?token=xyz",
        "expiryMinutes": 15,
        "ipAddress": "192.168.1.50",
        "requestedAt": "2026-09-10T11:45:00Z"
    }
}

response = requests.post(url, json=payload)
result = response.json()

if response.status_code == 200 and result.get("success"):
    print("Email inviata! Message-ID:", result.get("messageId"))
else:
    print("Errore invio:", result.get("error"))`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <span>Specifiche API & Guida Integrazione Backend</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Endpoint REST per integrare il servizio di invio mail via SMTP nei tuoi microservizi o applicazioni.
        </p>
      </div>

      {/* Endpoint: POST /api/send-email */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded">
              POST
            </span>
            <span className="font-mono text-sm font-semibold text-slate-800">
              /api/send-email
            </span>
          </div>
          <span className="text-xs text-slate-500">Invia Email con Template Dinamico via SMTP</span>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Renderizza il template specificato (o il codice HTML fornito) interpolando le variabili passate nell'oggetto <code>data</code> ed effettua la spedizione tramite il server SMTP configurato.
          </p>

          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Parametri del Body (JSON)
          </h4>

          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-left">
                <tr>
                  <th className="p-2.5">Campo</th>
                  <th className="p-2.5">Tipo</th>
                  <th className="p-2.5">Obbligatorio</th>
                  <th className="p-2.5">Descrizione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-2.5 text-blue-600 font-semibold">to</td>
                  <td className="p-2.5 text-slate-500 font-sans">string</td>
                  <td className="p-2.5 text-emerald-600 font-sans font-semibold">Sì</td>
                  <td className="p-2.5 text-slate-700 font-sans">Indirizzo email del destinatario</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-semibold">templateId</td>
                  <td className="p-2.5 text-slate-500 font-sans">string</td>
                  <td className="p-2.5 text-slate-500 font-sans">No (se html è presente)</td>
                  <td className="p-2.5 text-slate-700 font-sans">ID del template predefinito (es. 'welcome', 'order_confirmation')</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-semibold">html</td>
                  <td className="p-2.5 text-slate-500 font-sans">string</td>
                  <td className="p-2.5 text-slate-500 font-sans">No (se templateId è presente)</td>
                  <td className="p-2.5 text-slate-700 font-sans">Codice sorgente HTML personalizzato con tag Handlebars</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-semibold">data</td>
                  <td className="p-2.5 text-slate-500 font-sans">object</td>
                  <td className="p-2.5 text-slate-500 font-sans">No</td>
                  <td className="p-2.5 text-slate-700 font-sans">Dizionario chiave-valore con i parametri dinamici da iniettare</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-semibold">subject</td>
                  <td className="p-2.5 text-slate-500 font-sans">string</td>
                  <td className="p-2.5 text-slate-500 font-sans">No</td>
                  <td className="p-2.5 text-slate-700 font-sans">Oggetto dell'email (supporta anch'esso tag dinamici come `Ordine #&#123;&#123;orderId&#125;&#125;`)</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-semibold">cc / bcc</td>
                  <td className="p-2.5 text-slate-500 font-sans">string</td>
                  <td className="p-2.5 text-slate-500 font-sans">No</td>
                  <td className="p-2.5 text-slate-700 font-sans">Destinatari in copia conoscenza o copia nascosta</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-semibold">smtpConfig</td>
                  <td className="p-2.5 text-slate-500 font-sans">object</td>
                  <td className="p-2.5 text-slate-500 font-sans">No</td>
                  <td className="p-2.5 text-slate-700 font-sans">Override facoltativo delle credenziali SMTP per singola chiamata</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Code Snippets Switcher */}
        <div className="border-t border-slate-200 bg-slate-900">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
            <div className="flex space-x-2 text-xs">
              <button
                onClick={() => setSelectedLang('curl')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedLang === 'curl' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setSelectedLang('node')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedLang === 'node' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Node.js
              </button>
              <button
                onClick={() => setSelectedLang('python')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedLang === 'python' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python
              </button>
            </div>

            <button
              onClick={() => {
                const code =
                  selectedLang === 'curl' ? curlCode : selectedLang === 'node' ? nodeCode : pythonCode;
                copyCode(code, 'snippet');
              }}
              className="text-slate-400 hover:text-white text-xs flex items-center space-x-1"
            >
              {copiedSection === 'snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'snippet' ? 'Copiato!' : 'Copia'}</span>
            </button>
          </div>

          <pre className="p-4 font-mono text-xs text-slate-200 overflow-auto max-h-72">
            {selectedLang === 'curl' && curlCode}
            {selectedLang === 'node' && nodeCode}
            {selectedLang === 'python' && pythonCode}
          </pre>
        </div>
      </div>

      {/* Endpoint Specifico: POST /api/sendCourseInfoRequest */}
      <div className="bg-white rounded-xl border-2 border-blue-500/40 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-blue-100 flex items-center justify-between bg-blue-50/70">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded">
              POST
            </span>
            <span className="font-mono text-sm font-semibold text-blue-900">
              /api/sendCourseInfoRequest
            </span>
          </div>
          <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
            Routing Regionale Automatico CIA
          </span>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            Riceve il payload del form contatti inviato dal Frontend, applica la logica di instradamento SMTP verso il comitato regionale (<code>to_email</code>), invia copia conoscenza all'utente richiedente (<code>cc_email</code>), notifica l'amministratore centrale (<code>admin_email</code> / <code>coordinator</code>) ed imposta l'intestazione <strong>Reply-To</strong> sul contatto del candidato.
          </p>

          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Esempio Chiamata dal Frontend (React / Fetch)
          </h4>

          <div className="bg-slate-900 text-emerald-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
{`// Esempio di integrazione nel componente Form React
const sendCourseInfoRequest = async (formData, regionalEmail, adminEmail) => {
  const payload = {
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
    regional_committee: \`CIA \${formData.region}\`,
    submitted_at: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
  };

  const response = await fetch('/api/sendCourseInfoRequest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Errore invio richiesta');
  }

  return data;
};`}
          </div>
        </div>
      </div>

      {/* Altri Endpoint Disponibili */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Render endpoint */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded">POST</span>
            <span className="font-mono text-xs font-semibold text-slate-800">/api/templates/render</span>
          </div>
          <p className="text-xs text-slate-600">
            Renderizza l'HTML dinamico e l'oggetto in base ai dati in input senza spedire la mail. Utile per anteprime applicative o test automatizzati.
          </p>
        </div>

        {/* Verify endpoint */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded">POST</span>
            <span className="font-mono text-xs font-semibold text-slate-800">/api/smtp/verify</span>
          </div>
          <p className="text-xs text-slate-600">
            Effettua il test di handshake e autenticazione SMTP per validare la raggiungibilità del mail server e la correttezza delle credenziali.
          </p>
        </div>
      </div>
    </div>
  );
};
