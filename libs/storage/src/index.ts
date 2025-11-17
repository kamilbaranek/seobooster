import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { dirname, isAbsolute, normalize, resolve } from 'path';

export type AssetBinary = Buffer | Uint8Array | ArrayBuffer;

export interface AssetStorage {
  saveFile(path: string, binary: AssetBinary, contentType: string): Promise<string>;
  getFile(path: string): Promise<Buffer>;
  deleteFile(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}

const toBuffer = (input: AssetBinary) => {
  if (Buffer.isBuffer(input)) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return Buffer.from(input);
  }
  return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
};

export type LocalAssetStorageOptions = {
  rootPath: string;
  publicBaseUrl: string;
};

export type S3AssetStorageOptions = {
  bucket: string;
  region: string;
  publicBaseUrl: string;
};

const sanitizeRelativePath = (path: string) => {
  const normalized = normalize(path).replace(/^\.\/+/, '');
  if (normalized.startsWith('..')) {
    throw new Error('Path traversal is not allowed for asset storage');
  }
  return normalized.replace(/\\/g, '/');
};

const resolveRootPath = (rootPath: string) => {
  if (isAbsolute(rootPath)) {
    return rootPath;
  }
  const projectRoot = process.env.PROJECT_ROOT ?? process.cwd();
  return resolve(projectRoot, rootPath);
};

export class LocalAssetStorage implements AssetStorage {
  private readonly rootPath: string;
  private readonly publicBaseUrl: string;

  constructor(options: LocalAssetStorageOptions) {
    this.rootPath = resolveRootPath(options.rootPath);
    this.publicBaseUrl = options.publicBaseUrl.replace(/\/$/, '');
  }

  private resolvePath(path: string) {
    const sanitized = sanitizeRelativePath(path);
    return {
      sanitized,
      absolute: resolve(this.rootPath, sanitized)
    };
  }

  async saveFile(path: string, binary: AssetBinary, _contentType: string): Promise<string> {
    const { sanitized, absolute } = this.resolvePath(path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, toBuffer(binary));
    return this.getPublicUrl(sanitized);
  }

  async getFile(path: string): Promise<Buffer> {
    const { absolute } = this.resolvePath(path);
    return readFile(absolute);
  }

  async deleteFile(path: string): Promise<void> {
    const { absolute } = this.resolvePath(path);
    await rm(absolute, { force: true });
  }

  getPublicUrl(path: string): string {
    const sanitized = sanitizeRelativePath(path);
    return `${this.publicBaseUrl}/${sanitized}`;
  }
}

export class S3AssetStorage implements AssetStorage {
  constructor(private readonly options: S3AssetStorageOptions) {}

  // The S3 driver is not implemented in this MVP build. The class serves as a placeholder
  // so the rest of the codebase can be wired up via configuration.
  async saveFile(): Promise<string> {
    throw new Error('S3AssetStorage is not implemented yet');
  }

  async getFile(): Promise<Buffer> {
    throw new Error('S3AssetStorage is not implemented yet');
  }

  async deleteFile(): Promise<void> {
    throw new Error('S3AssetStorage is not implemented yet');
  }

  getPublicUrl(path: string): string {
    return `${this.options.publicBaseUrl.replace(/\/$/, '')}/${sanitizeRelativePath(path)}`;
  }
}

export type AssetStorageDriver = 'local' | 's3';

export type AssetStorageConfig = {
  driver: AssetStorageDriver;
  local?: LocalAssetStorageOptions;
  s3?: S3AssetStorageOptions;
};

export const createAssetStorage = (config: AssetStorageConfig): AssetStorage => {
  if (config.driver === 'local') {
    if (!config.local) {
      throw new Error('Local storage configuration missing');
    }
    return new LocalAssetStorage(config.local);
  }

  if (config.driver === 's3') {
    if (!config.s3) {
      throw new Error('S3 storage configuration missing');
    }
    return new S3AssetStorage(config.s3);
  }

  throw new Error(`Unsupported asset storage driver: ${config.driver}`);
};
