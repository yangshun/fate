import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  arrayToConnection,
  createConnectionProcedure,
} from '../../fate-server/connection.ts';
import { prismaSelect } from '../../fate-server/prismaSelect.tsx';
import { Post } from '../../prisma/prisma-client/client.ts';
import { PostFindManyArgs } from '../../prisma/prisma-client/models.ts';
import { procedure, router } from '../init.ts';

const authorSelection = {
  select: {
    id: true,
    name: true,
    username: true,
  },
} as const;

const commentInclude = {
  author: authorSelection,
} as const;

const categorySelection = {
  select: {
    description: true,
    id: true,
    name: true,
  },
} as const;

const tagSelection = {
  select: {
    description: true,
    id: true,
    name: true,
  },
} as const;

const postInclude = {
  author: authorSelection,
  category: categorySelection,
  comments: {
    include: commentInclude,
    orderBy: {
      createdAt: 'asc',
    },
  },
  tags: tagSelection,
} as const;

type CommentRow = { id: string | number } & Record<string, unknown>;

type TagRow = { id: string | number } & Record<string, unknown>;

type PostRow = {
  comments?: Array<CommentRow>;
  id: string;
  tags?: Array<TagRow>;
} & Post;

const transformPost = ({ comments, tags, ...post }: PostRow) => ({
  ...post,
  comments: arrayToConnection(comments),
  tags: arrayToConnection(tags),
});

export const postRouter = router({
  byId: procedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)).nonempty(),
        select: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const select = prismaSelect(input.select);
      const posts = await ctx.prisma.post.findMany({
        where: { id: { in: input.ids } },
        ...(select ? { select } : { include: postInclude }),
      } as PostFindManyArgs);

      const map = new Map(
        posts.map((post) => {
          const result = transformPost(post as PostRow);
          return [result.id, result];
        }),
      );
      return input.ids.map((id) => map.get(id)).filter(Boolean);
    }),
  like: procedure
    .input(
      z.object({
        id: z.string().min(1, 'Post id is required.'),
        select: z.array(z.string()).optional(),
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

      const select = prismaSelect(input.select);
      const data = {
        likes: {
          increment: 1,
        },
      } as const;
      const where = { id: input.id };

      if (select) {
        const updated = await ctx.prisma.post.update({
          data,
          select,
          where,
        });
        return transformPost(updated as unknown as PostRow);
      }

      const updated = await ctx.prisma.post.update({
        data,
        include: postInclude,
        where,
      });
      return transformPost(updated as PostRow);
    }),
  list: createConnectionProcedure({
    map: ({ rows }) =>
      (rows as Array<PostRow>).map((post) => transformPost(post)),
    query: async ({ ctx, cursor, input, skip, take }) => {
      const select = prismaSelect(input.select);
      const findOptions: PostFindManyArgs = {
        orderBy: { createdAt: 'desc' },
        take,
        ...(select ? { select } : { include: postInclude }),
      };

      if (cursor) {
        findOptions.cursor = { id: cursor };
        findOptions.skip = skip;
      }

      return ctx.prisma.post.findMany(findOptions);
    },
  }),
  unlike: procedure
    .input(
      z.object({
        id: z.string().min(1, 'Post id is required.'),
        select: z.array(z.string()).optional(),
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

        const select = prismaSelect(input.select);
        const where = { id: input.id };

        if (existing.likes <= 0) {
          if (select) {
            const result = await tx.post.findUniqueOrThrow({
              select,
              where,
            });
            return transformPost(result as unknown as PostRow);
          }

          const result = await tx.post.findUniqueOrThrow({
            include: postInclude,
            where,
          });
          return transformPost(result as PostRow);
        }

        const data = {
          likes: {
            decrement: 1,
          },
        } as const;

        if (select) {
          const updated = await tx.post.update({
            data,
            select,
            where,
          });
          return transformPost(updated as unknown as PostRow);
        }

        const updated = await tx.post.update({
          data,
          include: postInclude,
          where,
        });
        return transformPost(updated as PostRow);
      }),
    ),
});
