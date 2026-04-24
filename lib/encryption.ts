import CryptoJS from 'crypto-js';

const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY || 'default-development-encryption-key-32-bytes!';
  return key;
};

export const encryptToken = (token: string): string => {
  const key = getEncryptionKey();
  return CryptoJS.AES.encrypt(token, key).toString();
};

export const decryptToken = (encryptedToken: string): string => {
  const key = getEncryptionKey();
  const bytes = CryptoJS.AES.decrypt(encryptedToken, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
