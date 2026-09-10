export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'ecommerce' | 'security' | 'billing' | 'notification' | 'education' | 'custom';
  defaultSubject: string;
  html: string;
  sampleData: Record<string, any>;
  variables: {
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    description?: string;
  }[];
}

export interface CourseInfoRequestInput {
  region: string;
  name: string;
  surname: string;
  city: string;
  mail: string;
  telephone: string;
  recipient?: string;
  coordinator?: string;
  to_email?: string;
  admin_email?: string;
  cc_email?: string;
  regional_email?: string;
  regional_committee?: string;
  submitted_at?: string;
}

export interface SendEmailPayload {
  to: string;
  subject?: string;
  templateId?: string;
  html?: string;
  data?: Record<string, any>;
  text?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  smtpConfig?: Partial<SmtpConfig>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  accepted?: string[];
  rejected?: string[];
  response?: string;
  error?: string;
  timestamp: string;
}

export interface RenderTemplatePayload {
  templateId?: string;
  html?: string;
  subject?: string;
  data: Record<string, any>;
}

export interface RenderTemplateResult {
  html: string;
  subject: string;
  detectedVariables: string[];
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  templateId?: string;
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
  smtpHost: string;
}
