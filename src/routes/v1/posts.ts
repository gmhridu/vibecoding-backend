import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../config/database';
import { posts, postCategories, categories } from '../../schemas';
import { eq, and } from 'drizzle-orm';

const app = new Hono();

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  slug: z.string().min(1).max(255),
  published: z.boolean().default(false),
  categoryIds: z.array(z.string().uuid()).optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).max(255).optional(),
  published: z.boolean().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

// GET /api/v1/posts - List all posts
app.get('/', async (c) => {
  try {
    const allPosts = await db.select().from(posts);
    return c.json({
      success: true,
      data: allPosts,
    });
  } catch (error) {
    throw error;
  }
});

// GET /api/v1/posts/:id - Get post by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (post.length === 0) {
      return c.json(
        {
          error: 'Post not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: post[0],
    });
  } catch (error) {
    throw error;
  }
});

// POST /api/v1/posts - Create new post
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createPostSchema.parse(body);

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Create the post
      const newPost = await tx
        .insert(posts)
        .values({
          ...validatedData,
          authorId: 'default-author-id', // TODO: Get from auth context
        })
        .returning();

      const post = newPost[0];

      // Add categories if provided
      if (validatedData.categoryIds && validatedData.categoryIds.length > 0) {
        const postCategoryData = validatedData.categoryIds.map((categoryId) => ({
          postId: post.id,
          categoryId,
        }));

        await tx.insert(postCategories).values(postCategoryData);
      }

      return post;
    });

    return c.json(
      {
        success: true,
        data: result,
      },
      201
    );
  } catch (error) {
    throw error;
  }
});

// PUT /api/v1/posts/:id - Update post
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validatedData = updatePostSchema.parse(body);

    const result = await db.transaction(async (tx) => {
      // Update the post
      const updatedPost = await tx
        .update(posts)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      if (updatedPost.length === 0) {
        throw new Error('Post not found');
      }

      const post = updatedPost[0];

      // Update categories if provided
      if (validatedData.categoryIds !== undefined) {
        // Remove existing categories
        await tx.delete(postCategories).where(eq(postCategories.postId, id));

        // Add new categories
        if (validatedData.categoryIds.length > 0) {
          const postCategoryData = validatedData.categoryIds.map((categoryId) => ({
            postId: post.id,
            categoryId,
          }));

          await tx.insert(postCategories).values(postCategoryData);
        }
      }

      return post;
    });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    throw error;
  }
});

// DELETE /api/v1/posts/:id - Delete post
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const result = await db.transaction(async (tx) => {
      // Delete post categories first
      await tx.delete(postCategories).where(eq(postCategories.postId, id));

      // Delete the post
      const deletedPost = await tx
        .delete(posts)
        .where(eq(posts.id, id))
        .returning();

      if (deletedPost.length === 0) {
        throw new Error('Post not found');
      }

      return deletedPost[0];
    });

    return c.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    throw error;
  }
});

export { app as postRoutes };
