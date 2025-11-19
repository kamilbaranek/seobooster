import FormData from 'form-data';
import Mailgun from 'mailgun.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { MessagesSendResult } from 'mailgun.js';

export interface EmailConfig {
    apiKey: string;
    domain: string;
    host?: string; // e.g. 'api.eu.mailgun.net'
    fromEmail: string;
}

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class EmailService {
    private client: ReturnType<Mailgun['client']>;
    private domain: string;
    private fromEmail: string;

    constructor(config: EmailConfig) {
        const mailgun = new Mailgun(FormData);
        this.client = mailgun.client({
            username: 'api',
            key: config.apiKey.trim(),
            url: config.host ? `https://${config.host.trim()}` : undefined
        });
        this.domain = config.domain.trim();
        this.fromEmail = config.fromEmail.trim();
    }

    async sendEmail(options: SendEmailOptions): Promise<any> {
        try {
            return await this.client.messages.create(this.domain, {
                from: this.fromEmail,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text ?? this.stripHtml(options.html)
            });
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>?/gm, '');
    }
}
