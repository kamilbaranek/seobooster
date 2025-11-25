import { PrismaClient } from '@prisma/client';
import { createDecipheriv } from 'crypto';
import * as dotenv from 'dotenv';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// --- WP Client Logic (Inlined) ---

export type WordpressPublishMode = 'draft_only' | 'manual_approval' | 'auto_publish';

export interface WordpressCredentials {
    type: 'wordpress_application_password';
    baseUrl: string;
    username: string;
    applicationPassword: string;
    autoPublishMode?: WordpressPublishMode;
}

export interface WordpressPostResponse {
    id: number;
    status: string;
    link?: string;
    [key: string]: unknown;
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
                        reject(new Error(`WordPress responded with status ${status}`));
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

const fetchPost = (
    credentials: WordpressCredentials,
    postId: string | number
): Promise<WordpressPostResponse> => sendRequest(credentials, `/wp-json/wp/v2/posts/${postId}`, 'GET');

const parseWordpressCredentials = (json: string): WordpressCredentials | null => {
    try {
        const parsed = JSON.parse(json);
        if (parsed.type === 'wordpress_application_password') {
            return parsed as WordpressCredentials;
        }
        return null;
    } catch {
        return null;
    }
};

// --- End WP Client Logic ---

function decrypt(ciphertext: string, keyBase64: string): string {
    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be a base64 encoded 32-byte key');
    }
    const buffer = Buffer.from(ciphertext, 'base64');
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}

async function main() {
    console.log('Starting backfill of article URLs...');

    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
        console.error('ENCRYPTION_KEY environment variable is missing.');
        process.exit(1);
    }

    const articles = await prisma.article.findMany({
        where: {
            wordpressPostId: { not: null },
            url: null
        },
        include: {
            web: {
                include: {
                    credentials: true
                }
            }
        }
    });

    console.log(`Found ${articles.length} articles to check.`);

    // Group by Web to avoid re-decrypting credentials
    const articlesByWeb = new Map<string, typeof articles>();
    for (const article of articles) {
        const webId = article.webId;
        if (!articlesByWeb.has(webId)) {
            articlesByWeb.set(webId, []);
        }
        articlesByWeb.get(webId)?.push(article);
    }

    for (const [webId, webArticles] of articlesByWeb.entries()) {
        const web = webArticles[0].web;
        console.log(`Processing web: ${web.url} (${webArticles.length} articles)`);

        if (!web.credentials?.encryptedJson) {
            console.warn(`Web ${web.url} has no credentials. Skipping.`);
            continue;
        }

        let credentials;
        try {
            const decryptedJson = decrypt(web.credentials.encryptedJson, encryptionKey);
            credentials = parseWordpressCredentials(decryptedJson);
        } catch (error) {
            console.error(`Failed to decrypt credentials for web ${web.url}:`, error);
            continue;
        }

        if (!credentials) {
            console.warn(`Invalid credentials format for web ${web.url}. Skipping.`);
            continue;
        }

        for (const article of webArticles) {
            if (!article.wordpressPostId) continue;

            try {
                console.log(`Fetching post ${article.wordpressPostId} for article "${article.title}"...`);
                const post = await fetchPost(credentials, article.wordpressPostId);

                if (post.link) {
                    console.log(`Updating URL to: ${post.link}`);
                    await prisma.article.update({
                        where: { id: article.id },
                        data: { url: post.link }
                    });
                } else {
                    console.warn(`Post ${article.wordpressPostId} returned no link.`);
                }
            } catch (error) {
                console.error(`Failed to fetch/update article ${article.id}:`, error);
            }
        }
    }

    console.log('Backfill completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
