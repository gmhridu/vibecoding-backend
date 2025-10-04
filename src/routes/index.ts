import { Hono } from 'hono';

// Import route modules
import { userRoutes } from './v1/users';

const app = new Hono();

// Public routes (no authentication required)
app.route('/users', userRoutes);

// Protected routes (authentication required)
// app.use('*', authMiddleware);
// app.route('/admin', adminRoutes);

export { app as routes };
