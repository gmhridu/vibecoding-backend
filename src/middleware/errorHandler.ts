import { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { env } from '../config/env';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err);

  // Handle HTTP exceptions
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: 'Validation Error',
        details: err.errors,
      },
      400
    );
  }

  // Handle custom application errors
  if (err.name === 'AppError' && 'status' in err) {
    return c.json(
      {
        error: err.message,
      },
      (err as any).status || 500
    );
  }

  // Handle database errors
  if ('code' in err && err.code) {
    switch (err.code) {
      case '23505': // Unique constraint violation
        return c.json(
          {
            error: 'Resource already exists',
          },
          409
        );
      case '23503': // Foreign key constraint violation
        return c.json(
          {
            error: 'Referenced resource does not exist',
          },
          400
        );
      default:
        return c.json(
          {
            error: 'Database error',
          },
          500
        );
    }
  }

  // Handle generic errors
  return c.json(
    {
      error: env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    },
    500
  );
};
