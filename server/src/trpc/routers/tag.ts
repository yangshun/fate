import { z } from 'zod';
import { prismaSelect } from '../../fate-server/prismaSelect.tsx';
import { TagFindManyArgs } from '../../prisma/prisma-client/models.ts';
import { procedure, router } from '../init.ts';

export const tagRouter = router({
  byId: procedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)).nonempty(),
        select: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const select = prismaSelect(input.select);

      const tags = await ctx.prisma.tag.findMany({
        select,
        where: { id: { in: input.ids } },
      } as TagFindManyArgs);

      const map = new Map(tags.map((tag) => [tag.id, tag] as const));
      return input.ids
        .map((id) => map.get(id))
        .filter((tag): tag is (typeof tags)[number] => tag != null);
    }),
});
