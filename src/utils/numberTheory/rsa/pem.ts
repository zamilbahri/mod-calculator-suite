import { bigIntToBytes } from './encoding';
import { computeLambdaN, computeModulus, computeQInverseModP } from './keyMath';
import { modNormalize } from '../core';

type RsaPemAlgorithmName = 'RSA-OAEP' | 'RSASSA-PKCS1-v1_5';
type RsaPemHashName = 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface RsaPrivateKeyComponents {
  p: bigint;
  q: bigint;
  e: bigint;
  d: bigint;
  n?: bigint;
}

export interface RsaPemExportOptions extends RsaPrivateKeyComponents {
  algorithmName?: RsaPemAlgorithmName;
  hashName?: RsaPemHashName;
}

export interface RsaPemExportResult {
  privateKeyPem: string;
  publicKeyPem: string;
}

export interface RsaPublicPemExportOptions {
  n: bigint;
  e: bigint;
  algorithmName?: RsaPemAlgorithmName;
  hashName?: RsaPemHashName;
}

const toBase64 = (bytes: Uint8Array): string => {
  if (typeof btoa === 'function') {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  throw new Error('Base64 conversion is not available in this environment.');
};

const toBase64Url = (bytes: Uint8Array): string =>
  toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const wrapPem = (
  label: 'PRIVATE KEY' | 'PUBLIC KEY',
  der: ArrayBuffer,
): string => {
  const base64 = toBase64(new Uint8Array(der));
  const chunked = base64.match(/.{1,64}/g)?.join('\n') ?? '';
  return `-----BEGIN ${label}-----\n${chunked}\n-----END ${label}-----`;
};

export const bigIntToBase64UrlUInt = (value: bigint): string => {
  if (value < 0n) throw new Error('RSA integer values must be non-negative.');
  return toBase64Url(bigIntToBytes(value));
};

export const buildRsaPublicJwk = (n: bigint, e: bigint): JsonWebKey => ({
  kty: 'RSA',
  n: bigIntToBase64UrlUInt(n),
  e: bigIntToBase64UrlUInt(e),
  ext: true,
});

export const buildRsaPrivateJwk = ({
  p,
  q,
  e,
  d,
  n = computeModulus(p, q),
}: RsaPrivateKeyComponents): JsonWebKey => {
  const lambda = computeLambdaN(p, q);
  const dp = modNormalize(d, p - 1n);
  const dq = modNormalize(d, q - 1n);
  const qi = computeQInverseModP(q, p);

  if (lambda <= 0n) {
    throw new Error('Invalid RSA parameters for lambda(n).');
  }

  return {
    kty: 'RSA',
    n: bigIntToBase64UrlUInt(n),
    e: bigIntToBase64UrlUInt(e),
    d: bigIntToBase64UrlUInt(d),
    p: bigIntToBase64UrlUInt(p),
    q: bigIntToBase64UrlUInt(q),
    dp: bigIntToBase64UrlUInt(dp),
    dq: bigIntToBase64UrlUInt(dq),
    qi: bigIntToBase64UrlUInt(qi),
    ext: true,
  };
};

const getKeyUsages = (
  algorithmName: RsaPemAlgorithmName,
): { privateUsages: KeyUsage[]; publicUsages: KeyUsage[] } => {
  if (algorithmName === 'RSASSA-PKCS1-v1_5') {
    return {
      privateUsages: ['sign'],
      publicUsages: ['verify'],
    };
  }
  return {
    privateUsages: ['decrypt'],
    publicUsages: ['encrypt'],
  };
};

export const exportRsaKeyPairToPem = async ({
  p,
  q,
  e,
  d,
  n = computeModulus(p, q),
  algorithmName = 'RSA-OAEP',
  hashName = 'SHA-256',
}: RsaPemExportOptions): Promise<RsaPemExportResult> => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not available.');
  }

  const privateJwk = buildRsaPrivateJwk({ p, q, e, d, n });
  const publicJwk = buildRsaPublicJwk(n, e);
  const { privateUsages, publicUsages } = getKeyUsages(algorithmName);

  const algorithm: RsaHashedImportParams = {
    name: algorithmName,
    hash: hashName,
  };

  const privateCryptoKey = await crypto.subtle.importKey(
    'jwk',
    privateJwk,
    algorithm,
    true,
    privateUsages,
  );

  const publicCryptoKey = await crypto.subtle.importKey(
    'jwk',
    publicJwk,
    algorithm,
    true,
    publicUsages,
  );

  const exportedPrivateDer = await crypto.subtle.exportKey(
    'pkcs8',
    privateCryptoKey,
  );
  const exportedPublicDer = await crypto.subtle.exportKey(
    'spki',
    publicCryptoKey,
  );

  return {
    privateKeyPem: wrapPem('PRIVATE KEY', exportedPrivateDer),
    publicKeyPem: wrapPem('PUBLIC KEY', exportedPublicDer),
  };
};

export const exportRsaPublicKeyToPem = async ({
  n,
  e,
  algorithmName = 'RSA-OAEP',
  hashName = 'SHA-256',
}: RsaPublicPemExportOptions): Promise<string> => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not available.');
  }

  const publicJwk = buildRsaPublicJwk(n, e);
  const { publicUsages } = getKeyUsages(algorithmName);
  const algorithm: RsaHashedImportParams = {
    name: algorithmName,
    hash: hashName,
  };

  const publicCryptoKey = await crypto.subtle.importKey(
    'jwk',
    publicJwk,
    algorithm,
    true,
    publicUsages,
  );

  const exportedPublicDer = await crypto.subtle.exportKey('spki', publicCryptoKey);
  return wrapPem('PUBLIC KEY', exportedPublicDer);
};
