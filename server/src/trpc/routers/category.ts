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

const transformCategory = (
  { _count, posts, ...category }: CategoryRow,
  args?: Record<string, unknown>,
) => ({
  ...category,
  postCount: _count?.posts ?? 0,
  posts: arrayToConnection(posts, {
    args: scopedArgsForPath(args, 'posts'),
  }),
});

export const categoryRouter = router({
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
      delete select.postCount;

      const categories = await ctx.prisma.category.findMany({
        select: { ...select, ...categorySelect },
        where: { id: { in: input.ids } },
      } as CategoryFindManyArgs);

      const map = new Map(
        categories.map((category) => {
          const result = transformCategory(category as CategoryRow, input.args);
          return [result.id, result];
        }),
      );
      return input.ids.map((id) => map.get(id)).filter(Boolean);
    }),
  list: createConnectionProcedure({
    map: ({ input, rows }) =>
      (rows as Array<CategoryRow & { _count: { posts: number } }>).map(
        (category) => transformCategory(category, input.args),
      ),
    query: async ({ ctx, cursor, direction, input, skip, take }) => {
      const select = prismaSelect(input.select, input.args);
      delete select.postCount;

      const findOptions: CategoryFindManyArgs = {
        orderBy: { createdAt: 'asc' },
        select: { ...select, ...categorySelect },
        take: direction === 'forward' ? take : -take,
      };

      if (cursor) {
        findOptions.cursor = { id: cursor };
        findOptions.skip = skip;
      }

      const rows = await ctx.prisma.category.findMany(findOptions);
      return direction === 'forward' ? rows : rows.reverse();
    },
  }),
});
