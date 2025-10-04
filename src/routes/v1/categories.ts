import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../config/database';
import { categories } from '../../schemas';
import { eq } from 'drizzle-orm';

const app = new Hono();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

// GET /api/v1/categories - List all categories
app.get('/', async (c) => {
  try {
    const allCategories = await db.select().from(categories);
    return c.json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    throw error;
  }
});

// GET /api/v1/categories/:id - Get category by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (category.length === 0) {
      return c.json(
        {
          error: 'Category not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: category[0],
    });
  } catch (error) {
    throw error;
  }
});

// POST /api/v1/categories - Create new category
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createCategorySchema.parse(body);

    const newCategory = await db
      .insert(categories)
      .values(validatedData)
      .returning();

    return c.json(
      {
        success: true,
        data: newCategory[0],
      },
      201
    );
  } catch (error) {
    throw error;
  }
});

// PUT /api/v1/categories/:id - Update category
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validatedData = updateCategorySchema.parse(body);

    const updatedCategory = await db
      .update(categories)
      .set(validatedData)
      .where(eq(categories.id, id))
      .returning();

    if (updatedCategory.length === 0) {
      return c.json(
        {
          error: 'Category not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: updatedCategory[0],
    });
  } catch (error) {
    throw error;
  }
});

// DELETE /api/v1/categories/:id - Delete category
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const deletedCategory = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (deletedCategory.length === 0) {
      return c.json(
        {
          error: 'Category not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    throw error;
  }
});

export { app as categoryRoutes };
