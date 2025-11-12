import { z } from 'zod';
import {
  arrayToConnection,
  createConnectionProcedure,
} from '../../fate-server/connection.ts';
import { prismaSelect } from '../../fate-server/prismaSelect.tsx';
import { Category, Post } from '../../prisma/prisma-client/client.ts';
import { CategoryFindManyArgs } from '../../prisma/prisma-client/models.ts';
import { procedure, router } from '../init.ts';

const categorySelect = {
  _count: {
    select: { posts: true },
  },
  id: true,
} as const;

type CategoryRow = Category & {
  _count?: { posts: number };
  posts?: Array<Post>;
} & Category;

const transformCategory = ({ _count, posts, ...category }: CategoryRow) => ({
  ...category,
  postCount: _count?.posts ?? 0,
  posts: arrayToConnection(posts),
});

export const categoryRouter = router({
  byId: procedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)).nonempty(),
        select: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const select = prismaSelect(input.select);
      delete select.postCount;

      const categories = await ctx.prisma.category.findMany({
        select: { ...select, ...categorySelect },
        where: { id: { in: input.ids } },
      } as CategoryFindManyArgs);

      const map = new Map(
        categories.map((category) => {
          const result = transformCategory(category as CategoryRow);
          return [result.id, result];
        }),
      );
      return input.ids.map((id) => map.get(id)).filter(Boolean);
    }),
  list: createConnectionProcedure({
    map: ({ rows }) =>
      (rows as Array<CategoryRow & { _count: { posts: number } }>).map(
        (category) => transformCategory(category),
      ),
    query: async ({ ctx, cursor, input, skip, take }) => {
      const select = prismaSelect(input.select);
      delete select.postCount;

      const findOptions: CategoryFindManyArgs = {
        orderBy: { createdAt: 'asc' },
        select: { ...select, ...categorySelect },
        take,
      };

      if (cursor) {
        findOptions.cursor = { id: cursor };
        findOptions.skip = skip;
      }

      return await ctx.prisma.category.findMany(findOptions);
    },
  }),
});
