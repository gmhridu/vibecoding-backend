import { NotFoundHandler } from 'hono';

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    {
      error: 'Not Found',
      message: `The requested path ${c.req.path} was not found`,
      method: c.req.method,
    },
    404
  );
};
