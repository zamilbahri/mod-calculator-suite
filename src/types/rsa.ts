export type RsaMode = 'encrypt' | 'decrypt';

export type RsaEncodingMode = 'fixed-width-numeric' | 'radix' | 'pkcs1-v1_5';

export type RsaAlphabetMode = 'ascii' | 'custom';

export type RsaRecoverWorkerId = 'balanced' | 'low';

export type RsaPrimeSizeType = 'bits' | 'digits';

export type RsaFactorCheckVerdict = 'Prime' | 'Probably Prime' | 'Composite';

export interface RsaComputedKeySnapshot {
  p: string;
  q: string;
  n: string;
  phi: string;
  d: string;
}

export type RsaDecryptRecoverRequest = {
  type: 'recover';
  jobId: number;
  workerId: RsaRecoverWorkerId;
  n: string;
  start: string;
  endExclusive?: string;
  e?: string;
};

export type RsaDecryptCompletedMessage = {
  type: 'completed';
  jobId: number;
  workerId: RsaRecoverWorkerId;
  p: string;
  q: string;
  phi: string;
  d: string;
};

export type RsaDecryptHeartbeatMessage = {
  type: 'heartbeat';
  jobId: number;
  workerId: RsaRecoverWorkerId;
  attempts: number;
};

export type RsaDecryptNotFoundMessage = {
  type: 'not_found';
  jobId: number;
  workerId: RsaRecoverWorkerId;
};

export type RsaDecryptErrorMessage = {
  type: 'error';
  jobId: number;
  workerId: RsaRecoverWorkerId;
  message: string;
};

export type RsaDecryptWorkerRequest = RsaDecryptRecoverRequest;

export type RsaDecryptWorkerResponse =
  | RsaDecryptHeartbeatMessage
  | RsaDecryptCompletedMessage
  | RsaDecryptNotFoundMessage
  | RsaDecryptErrorMessage;
