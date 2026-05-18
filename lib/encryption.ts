import { encrypt, decrypt } from './crypto';

export const encryptToken = (token: string): string => {
  return encrypt(token);
};

export const decryptToken = (encryptedToken: string): string => {
  return decrypt(encryptedToken);
};
