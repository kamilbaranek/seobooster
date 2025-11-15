import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer | null;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret) {
      // eslint-disable-next-line no-console
      console.warn('ENCRYPTION_KEY is not configured; credential endpoints will not work.');
      this.key = null;
    } else {
      const key = Buffer.from(secret, 'base64');
      if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be a base64 encoded 32-byte key');
      }
      this.key = key;
    }
  }

  encrypt(payload: string): string {
    if (!this.key) {
      throw new Error('ENCRYPTION_KEY is not configured');
    }
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(ciphertext: string): string {
    if (!this.key) {
      throw new Error('ENCRYPTION_KEY is not configured');
    }
    const buffer = Buffer.from(ciphertext, 'base64');
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
