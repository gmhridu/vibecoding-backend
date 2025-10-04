import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';
import { env } from '../config/env';

// Types for JWT payload
interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Extend Hono context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      },
      401
    );
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = await verify(token, env.JWT_SECRET);
    const payload: JwtPayload = {
      sub: (decoded as any).sub,
      email: (decoded as any).email,
      iat: (decoded as any).iat,
      exp: (decoded as any).exp,
    };

    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Token has expired',
        },
        401
      );
    }

    // Add user to context
    c.set('user', payload);

    await next();
  } catch (error) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Invalid token',
      },
      401
    );
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = await verify(token, env.JWT_SECRET);
      const payload: JwtPayload = {
        sub: (decoded as any).sub,
        email: (decoded as any).email,
        iat: (decoded as any).iat,
        exp: (decoded as any).exp,
      };
      c.set('user', payload);
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  await next();
};
