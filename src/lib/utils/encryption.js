import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Get encryption key from environment or generate a default one for development
const getEncryptionKey = () => {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey && envKey.length === KEY_LENGTH * 2) { // Hex string should be 64 chars
    return Buffer.from(envKey, 'hex');
  }
  
  // Development fallback - DO NOT use in production
  console.warn('Using default encryption key for development. Set ENCRYPTION_KEY in production!');
  return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
};

export function encrypt(text) {
  if (!text) return '';
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(Buffer.from('unified-ai-workspace'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine iv + tag + encrypted data
    return iv.toString('hex') + tag.toString('hex') + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedData) {
  if (!encryptedData) return '';
  
  try {
    const key = getEncryptionKey();
    
    // Extract iv, tag, and encrypted data
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
    const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
    const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(Buffer.from('unified-ai-workspace'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, hashedPassword) {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

export function generateSecretKey() {
  return crypto.randomBytes(64).toString('hex');
}
