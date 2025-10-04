import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../config/database';
import { users } from '../../schemas';
import { eq } from 'drizzle-orm';

const app = new Hono();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/v1/users - List all users
app.get('/', async (c) => {
  try {
    const allUsers = await db.select().from(users);
    return c.json({
      success: true,
      data: allUsers,
    });
  } catch (error) {
    throw error;
  }
});

// GET /api/v1/users/:id - Get user by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      return c.json(
        {
          error: 'User not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    throw error;
  }
});

// POST /api/v1/users - Create new user
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createUserSchema.parse(body);

    // Hash password in real implementation
    const hashedPassword = validatedData.password; // TODO: Hash password

    const newUser = await db
      .insert(users)
      .values({
        ...validatedData,
        password: hashedPassword,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: newUser[0],
      },
      201
    );
  } catch (error) {
    throw error;
  }
});

// PUT /api/v1/users/:id - Update user
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validatedData = updateUserSchema.parse(body);

    const updatedUser = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return c.json(
        {
          error: 'User not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: updatedUser[0],
    });
  } catch (error) {
    throw error;
  }
});

// DELETE /api/v1/users/:id - Delete user
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return c.json(
        {
          error: 'User not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    throw error;
  }
});

export { app as userRoutes };
