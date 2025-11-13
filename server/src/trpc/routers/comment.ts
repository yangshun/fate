import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { connectionArgs } from '../../fate-server/connection.ts';
import { prismaSelect } from '../../fate-server/prismaSelect.tsx';
import type { CommentFindManyArgs } from '../../prisma/prisma-client/models.ts';
import { procedure, router } from '../init.ts';

const postSelection = {
  select: {
    id: true,
    title: true,
  },
} as const;

export const commentRouter = router({
  add: procedure
    .input(
      z.object({
        args: connectionArgs,
        content: z.string().min(1, 'Content is required'),
        postId: z.string().min(1, 'Post id is required'),
        select: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.sessionUser) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to add a comment',
        });
      }

      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      const select = prismaSelect(input.select, input.args);
      const data = {
        authorId: ctx.sessionUser.id,
        content: input.content,
        postId: input.postId,
      };

      const prismaPostSelection = select.post;
      const mergedPostSelection =
        prismaPostSelection && typeof prismaPostSelection === 'object'
          ? {
              ...(prismaPostSelection as Record<string, unknown>),
              select: {
                ...postSelection.select,
                ...((
                  prismaPostSelection as { select?: Record<string, unknown> }
                ).select ?? {}),
              },
            }
          : postSelection;

      return ctx.prisma.comment.create({
        data,
        select: {
          ...select,
          post: mergedPostSelection,
        },
      });
    }),
  byId: procedure
    .input(
      z.object({
        args: connectionArgs,
        ids: z.array(z.string().min(1)).nonempty(),
        select: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const select = prismaSelect(input.select, input.args);
      const comments = await ctx.prisma.comment.findMany({
        select,
        where: { id: { in: input.ids } },
      } as CommentFindManyArgs);

      const map = new Map(comments.map((comment) => [comment.id, comment]));
      return input.ids.map((id) => map.get(id)).filter(Boolean);
    }),
  delete: procedure
    .input(
      z.object({
        id: z.string().min(1, 'Comment id is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        select: { authorId: true },
        where: { id: input.id },
      });

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }

      await ctx.prisma.comment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
