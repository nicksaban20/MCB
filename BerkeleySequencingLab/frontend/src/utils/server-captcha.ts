import { createHmac, timingSafeEqual } from 'crypto';

const CAPTCHA_TTL_MS = 10 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

type CaptchaPayload = {
  email: string;
  answer: string;
  expiresAt: number;
};

function getCaptchaSecret() {
  const secret = process.env.CAPTCHA_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('CAPTCHA_SECRET is required in production.');
  }

  return 'dev-captcha-secret-change-me';
}

function encodePayload(payload: CaptchaPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodePayload(value: string): CaptchaPayload | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as CaptchaPayload;
  } catch {
    return null;
  }
}

function signPayload(encodedPayload: string) {
  return createHmac('sha256', getCaptchaSecret())
    .update(encodedPayload)
    .digest('base64url');
}

function createCaptchaToken(payload: CaptchaPayload) {
  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function parseCaptchaToken(token: string): CaptchaPayload | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  return decodePayload(encodedPayload);
}

export function createCaptchaChallenge(email: string) {
  const first = Math.floor(Math.random() * 8) + 1;
  const second = Math.floor(Math.random() * 8) + 1;
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;
  const challenge: CaptchaPayload = {
    email: normalizeEmail(email),
    answer: String(first + second),
    expiresAt,
  };

  const captchaId = createCaptchaToken({
    email: challenge.email,
    answer: challenge.answer,
    expiresAt: challenge.expiresAt,
  });

  return {
    captchaId,
    prompt: `What is ${first} + ${second}?`,
    expiresAt,
  };
}

export function validateCaptchaChallenge(input: {
  email: string;
  captchaId: string;
  captchaAnswer: string;
}) {
  const challenge = parseCaptchaToken(input.captchaId);
  if (!challenge) {
    return false;
  }

  return (
    challenge.expiresAt > Date.now() &&
    challenge.email === normalizeEmail(input.email) &&
    challenge.answer === input.captchaAnswer.trim()
  );
}

export function clearCaptchaChallengesForEmail(email: string) {
  normalizeEmail(email);
}

export function clearAllCaptchaChallenges() {
  return;
}
