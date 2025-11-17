import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

export type WordpressPublishMode = 'draft_only' | 'manual_approval' | 'auto_publish';

export interface WordpressCredentials {
  type: 'wordpress_application_password';
  baseUrl: string;
  username: string;
  applicationPassword: string;
  autoPublishMode?: WordpressPublishMode;
}

export type WordpressPostStatus = 'draft' | 'publish';

export interface WordpressPostPayload {
  title: string;
  content: string;
  status?: WordpressPostStatus;
  slug?: string;
  excerpt?: string;
  categories?: number[];
  tags?: number[];
}

export interface WordpressPostResponse {
  id: number;
  status: string;
  link?: string;
  [key: string]: unknown;
}

export class WordpressClientError extends Error {
  constructor(message: string, public readonly status: number, public readonly responseBody: unknown) {
    super(message);
    Object.setPrototypeOf(this, WordpressClientError.prototype);
  }
}

const buildAuthHeader = (credentials: WordpressCredentials) => {
  const token = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString('base64');
  return `Basic ${token}`;
};

const sendRequest = async <T>(
  credentials: WordpressCredentials,
  path: string,
  method: 'POST' | 'PUT',
  payload: unknown
): Promise<T> => {
  const url = new URL(path, credentials.baseUrl);
  const transport = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const body = JSON.stringify(payload);
  const headers = {
    Authorization: buildAuthHeader(credentials),
    'Content-Type': 'application/json'
  };

  return new Promise<T>((resolve, reject) => {
    const req = transport(
      url,
      {
        method,
        headers
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          const status = res.statusCode ?? 0;
          let payloadData: unknown = null;
          if (text) {
            try {
              payloadData = JSON.parse(text);
            } catch {
              payloadData = text;
            }
          }
          if (status >= 400) {
            reject(new WordpressClientError(`WordPress responded with status ${status}`, status, payloadData));
            return;
          }
          resolve(payloadData as T);
        });
      }
    );

    req.on('error', (error) => reject(error));
    req.write(body);
    req.end();
  });
};

export const createPost = (
  credentials: WordpressCredentials,
  payload: WordpressPostPayload
): Promise<WordpressPostResponse> =>
  sendRequest(credentials, '/wp-json/wp/v2/posts', 'POST', payload);

export const updatePost = (
  credentials: WordpressCredentials,
  postId: string | number,
  payload: WordpressPostPayload
): Promise<WordpressPostResponse> =>
  sendRequest(credentials, `/wp-json/wp/v2/posts/${postId}`, 'POST', payload);
