import { z } from 'zod';
import { connectionArgs, createResolver } from '@nkzw/fate/server';
import type { TagFindManyArgs } from '../../prisma/prisma-client/models.ts';
import { procedure, router } from '../init.ts';
import { tagDataView } from '../views.ts';

export const tagRouter = router({
  byId: procedure
    .input(
      z.object({
        args: connectionArgs,
        ids: z.array(z.string().min(1)).nonempty(),
        select: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { resolveMany, select } = createResolver({
        ...input,
        ctx,
        view: tagDataView,
      });

      return await resolveMany(
        await ctx.prisma.tag.findMany({
          select,
          where: { id: { in: input.ids } },
        } as TagFindManyArgs),
      );
    }),
});
