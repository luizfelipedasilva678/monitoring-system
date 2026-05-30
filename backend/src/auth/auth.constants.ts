import { Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

export const ACCESS_TOKEN_COOKIE = 'access_token';

export function setAuthCookie(res: Response, token: string, expiresIn: string) {
  const maxAge = parseExpiresIn(expiresIn);
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE);
}

function parseExpiresIn(expiresIn: string): number {
  const match = /^(\d+)([dhms])$/.exec(expiresIn);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
