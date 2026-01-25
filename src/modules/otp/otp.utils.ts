import crypto from 'crypto';

export const generateSecureOtp = async (): Promise<string> => {
  return new Promise(resolve => {
    crypto.randomBytes(3, (err, buf) => {
      if (err) {
        // Fallback to Math.random if crypto fails (very rare)
        const fallback = Math.floor(100000 + Math.random() * 900000);
        return resolve(fallback.toString().padStart(6, '0'));
      }

      // Convert to 6-digit number (0 to 999999)
      const otpNumber = buf.readUIntBE(0, 3) % 1000000;
      const otp = otpNumber.toString().padStart(6, '0');
      resolve(otp);
    });
  });
};

export const generateSessionId = async (length: number = 32): Promise<string> => {
  return new Promise(resolve => {
    crypto.randomBytes(Math.ceil(length / 2), (err, buf) => {
      if (err) {
        // Extremely rare fallback
        const fallback = crypto
          .createHash('sha256')
          .update(Date.now().toString() + Math.random().toString())
          .digest('hex')
          .slice(0, length);
        return resolve(fallback);
      }

      const sessionId = buf.toString('hex').slice(0, length);
      resolve(sessionId);
    });
  });
};
