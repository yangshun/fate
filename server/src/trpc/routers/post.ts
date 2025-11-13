import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  arrayToConnection,
  connectionArgs,
  createConnectionProcedure,
} from '../../fate-server/connection.ts';
import {
  prismaSelect,
  scopedArgsForPath,
} from '../../fate-server/prismaSelect.tsx';
import { Post } from '../../prisma/prisma-client/client.ts';
import { PostFindManyArgs } from '../../prisma/prisma-client/models.ts';
import { procedure, router } from '../init.ts';

type CommentRow = { id: string | number } & Record<string, unknown>;

type TagRow = { id: string | number } & Record<string, unknown>;

type PostRow = {
  comments?: Array<CommentRow>;
  id: string;
  tags?: Array<TagRow>;
} & Post;

const transformPost = (
  { comments, tags, ...post }: PostRow,
  args?: Record<string, unknown>,
) => ({
  ...post,
  comments: arrayToConnection(comments, {
    args: scopedArgsForPath(args, 'comments'),
  }),
  tags: arrayToConnection(tags, {
    args: scopedArgsForPath(args, 'tags'),
  }),
});

export const postRouter = router({
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
      const posts = await ctx.prisma.post.findMany({
        select,
        where: { id: { in: input.ids } },
      } as PostFindManyArgs);

      const map = new Map(
        posts.map((post) => {
          const result = transformPost(post as PostRow, input.args);
          return [result.id, result];
        }),
      );
      return input.ids.map((id) => map.get(id)).filter(Boolean);
    }),
  like: procedure
    .input(
      z.object({
        args: connectionArgs,
        id: z.string().min(1, 'Post id is required.'),
        select: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found.',
        });
      }

      const select = prismaSelect(input.select, input.args);
      const data = {
        likes: {
          increment: 1,
        },
      } as const;
      const where = { id: input.id };

      const updated = await ctx.prisma.post.update({
        data,
        select,
        where,
      });
      return transformPost(updated as unknown as PostRow, input.args);
    }),
  list: createConnectionProcedure({
    map: ({ input, rows }) =>
      (rows as Array<PostRow>).map((post) => transformPost(post, input.args)),
    query: async ({ ctx, cursor, direction, input, skip, take }) => {
      const select = prismaSelect(input.select, input.args);
      const findOptions: PostFindManyArgs = {
        orderBy: { createdAt: 'desc' },
        select,
        take: direction === 'forward' ? take : -take,
      };

      if (cursor) {
        findOptions.cursor = { id: cursor };
        findOptions.skip = skip;
      }

      const rows = await ctx.prisma.post.findMany(findOptions);
      return direction === 'forward' ? rows : rows.reverse();
    },
  }),
  unlike: procedure
    .input(
      z.object({
        args: connectionArgs,
        id: z.string().min(1, 'Post id is required.'),
        select: z.array(z.string()),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.post.findUnique({
          select: {
            likes: true,
          },
          where: {
            id: input.id,
          },
        });

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        const select = prismaSelect(input.select, input.args);
        const where = { id: input.id };

        if (existing.likes <= 0) {
          const result = await tx.post.findUniqueOrThrow({
            select,
            where,
          });
          return transformPost(result as unknown as PostRow, input.args);
        }

        const data = {
          likes: {
            decrement: 1,
          },
        } as const;

        const updated = await tx.post.update({
          data,
          select,
          where,
        });
        return transformPost(updated as unknown as PostRow, input.args);
      }),
    ),
});
