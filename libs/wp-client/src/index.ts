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
  approvalEmail?: string;
}

export type WordpressPostStatus = 'draft' | 'publish';

export interface WordpressPostPayload {
  title: string;
  content: string;
  status?: WordpressPostStatus;
  slug?: string;
  excerpt?: string;
  author?: number;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}

export interface WordpressPostResponse {
  id: number;
  status: string;
  link?: string;
  [key: string]: unknown;
}

export interface WordpressMediaResponse {
  id: number;
  source_url: string;
  media_type?: string;
  mime_type?: string;
  alt_text?: string;
  title?: { rendered: string } | string;
  [key: string]: unknown;
}

export type MediaBinary = Buffer | Uint8Array | ArrayBuffer;

export interface UploadMediaOptions {
  filename: string;
  mimeType: string;
  title?: string;
  altText?: string;
}

export interface WordpressCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WordpressAuthor {
  id: number;
  name: string;
  slug: string;
}

export interface WordpressTag {
  id: number;
  name: string;
  slug: string;
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
  method: 'GET' | 'POST' | 'PUT',
  payload?: unknown
): Promise<T> => {
  const url = new URL(path, credentials.baseUrl);
  const transport = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const body = payload !== undefined ? JSON.stringify(payload) : null;
  const headers: Record<string, string> = {
    Authorization: buildAuthHeader(credentials)
  };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

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
    if (body) {
      req.write(body);
    }
    req.end();
  });
};

export const createPost = (
  credentials: WordpressCredentials,
  payload: WordpressPostPayload
): Promise<WordpressPostResponse> => sendRequest(credentials, '/wp-json/wp/v2/posts', 'POST', payload);

export const updatePost = (
  credentials: WordpressCredentials,
  postId: string | number,
  payload: WordpressPostPayload
): Promise<WordpressPostResponse> => sendRequest(credentials, `/wp-json/wp/v2/posts/${postId}`, 'POST', payload);

export const fetchPost = (
  credentials: WordpressCredentials,
  postId: string | number
): Promise<WordpressPostResponse> => sendRequest(credentials, `/wp-json/wp/v2/posts/${postId}`, 'GET');

export const fetchCategories = (credentials: WordpressCredentials): Promise<WordpressCategory[]> =>
  sendRequest(credentials, '/wp-json/wp/v2/categories?per_page=100', 'GET');

export const fetchAuthors = async (credentials: WordpressCredentials): Promise<WordpressAuthor[]> => {
  try {
    return await sendRequest<WordpressAuthor[]>(
      credentials,
      '/wp-json/wp/v2/users?roles=author&per_page=100',
      'GET'
    );
  } catch (error) {
    if (error instanceof WordpressClientError && error.status === 403) {
      // Fallback: current user only (no permission to list all authors)
      const me = await sendRequest<WordpressAuthor>(credentials, '/wp-json/wp/v2/users/me', 'GET');
      return [me];
    }
    throw error;
  }
};

export const fetchTags = (
  credentials: WordpressCredentials,
  search?: string
): Promise<WordpressTag[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}&per_page=100` : '?per_page=100';
  return sendRequest(credentials, `/wp-json/wp/v2/tags${query}`, 'GET');
};

export const createTag = (
  credentials: WordpressCredentials,
  name: string
): Promise<WordpressTag> => sendRequest(credentials, '/wp-json/wp/v2/tags', 'POST', { name });

const toBuffer = (binary: MediaBinary) => {
  if (Buffer.isBuffer(binary)) {
    return binary;
  }
  if (binary instanceof ArrayBuffer) {
    return Buffer.from(binary);
  }
  return Buffer.from(binary.buffer, binary.byteOffset, binary.byteLength);
};

const sanitizeHeader = (str: string) => {
  // Normalize to decompose combined graphemes (e.g. "č" -> "c" + "ˇ")
  // then remove diacritics and keep only ASCII characters.
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
};

export const uploadMedia = (
  credentials: WordpressCredentials,
  binary: MediaBinary,
  options: UploadMediaOptions
): Promise<WordpressMediaResponse> => {
  const url = new URL('/wp-json/wp/v2/media', credentials.baseUrl);
  const transport = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const body = toBuffer(binary);
  const safeFilename = sanitizeHeader(options.filename);

  const headers: Record<string, string> = {
    Authorization: buildAuthHeader(credentials),
    'Content-Type': options.mimeType,
    'Content-Length': String(body.byteLength),
    'Content-Disposition': `attachment; filename="${safeFilename}"`
  };
  if (options.title) {
    headers['X-WP-Title'] = sanitizeHeader(options.title);
  }
  if (options.altText) {
    headers['X-WP-Alt-Text'] = sanitizeHeader(options.altText);
  }

  return new Promise<WordpressMediaResponse>((resolve, reject) => {
    const req = transport(
      url,
      {
        method: 'POST',
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
          resolve(payloadData as WordpressMediaResponse);
        });
      }
    );

    req.on('error', (error) => reject(error));
    req.write(body);
    req.end();
  });
};
