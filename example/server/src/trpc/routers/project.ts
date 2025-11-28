import { createResolver } from '@nkzw/fate/server';
import type { ProjectSelect } from '../../prisma/prisma-client/models.ts';
import { createConnectionProcedure } from '../connection.ts';
import { router } from '../init.ts';
import { projectDataView } from '../views.ts';

export const projectRouter = router({
  list: createConnectionProcedure({
    defaultSize: 3,
    query: async ({ ctx, cursor, direction, input, skip, take }) => {
      const { resolveMany, select } = createResolver({
        ...input,
        ctx,
        view: projectDataView,
      });

      const items = await ctx.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        select: select as ProjectSelect,
        take: direction === 'forward' ? take : -take,
        ...(cursor
          ? {
              cursor: { id: cursor },
              skip,
            }
          : {}),
      });
      return resolveMany(direction === 'forward' ? items : items.reverse());
    },
  }),
});
