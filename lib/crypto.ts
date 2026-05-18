import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_HEX = process.env.TOKEN_ENCRYPTION_KEY

export function encrypt(text: string): string {
  if (!text) return text
  if (!KEY_HEX) {
    console.error('TOKEN_ENCRYPTION_KEY is not set')
    return text
  }
  const KEY = Buffer.from(KEY_HEX, 'hex')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':')
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText
  if (!KEY_HEX) {
    console.error('TOKEN_ENCRYPTION_KEY is not set')
    return encryptedText
  }
  // Return as-is if not encrypted (migration safety)
  if (!encryptedText.includes(':')) return encryptedText
  try {
    const KEY = Buffer.from(KEY_HEX, 'hex')
    const [ivHex, authTagHex, encryptedHex] =
      encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv(
      ALGORITHM, KEY, iv
    )
    decipher.setAuthTag(authTag)
    return decipher.update(encrypted) +
      decipher.final('utf8')
  } catch {
    return encryptedText
  }
}
