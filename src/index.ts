import "dotenv/config";
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';

// Create Hono app instance
const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: env.ALLOWED_ORIGINS.split(','),
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.get('/', (c) => {
  return c.json({
    message: 'Welcome to the VibeCoding',
  });
})

// API routes
app.route('/api/v1', routes);

// Error handling middleware (must be last)
app.onError(errorHandler);

// Start server
const port = env.PORT;
console.log(`🚀 Server starting on port ${port} in ${env.NODE_ENV} mode`);

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  // Use dynamic import to avoid issues in serverless environments
  import('node:http').then(http => {
    const server = http.createServer(async (req, res) => {
      try {
        // Create Web API compatible request from Node.js request
        const url = `http://${req.headers.host}${req.url || ''}`;
        const headers = new Headers();

        // Copy headers from Node.js request
        for (const [key, value] of Object.entries(req.headers)) {
          if (value !== undefined) {
            headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          }
        }

        // Handle request body
        let body: ReadableStream<Uint8Array> | undefined;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          body = new ReadableStream({
            start(controller) {
              req.on('data', (chunk: Buffer) => {
                controller.enqueue(new Uint8Array(chunk));
              });
              req.on('end', () => {
                controller.close();
              });
              req.on('error', (err) => {
                controller.error(err);
              });
            }
          });
        }

        const request = new Request(url, {
          method: req.method,
          headers,
          body
        });

        const response = await app.fetch(request);

        // Set status code
        res.statusCode = response.status;

        // Set headers
        for (const [key, value] of response.headers) {
          res.setHeader(key, value);
        }

        // Handle response body
        if (response.body) {
          const reader = response.body.getReader();
          const pump = (): Promise<void> => {
            return reader.read().then(({ done, value }) => {
              if (done) {
                res.end();
                return Promise.resolve();
              }
              res.write(value);
              return pump();
            });
          };
          return pump().catch(err => {
            res.statusCode = 500;
            res.end('Internal Server Error');
          });
        } else {
          res.end();
        }
      } catch (error) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server is running on http://localhost:${port}`);
      console.log(`📍 Health check: http://localhost:${port}/health`);
      console.log(`🏠 Welcome: http://localhost:${port}/`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default {
  port,
  fetch: app.fetch,
};
