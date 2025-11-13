import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { connectionArgs } from '../../fate-server/connection.ts';
import { prismaSelect } from '../../fate-server/prismaSelect.tsx';
import { auth } from '../../lib/auth.tsx';
import { UserFindUniqueArgs } from '../../prisma/prisma-client/models.ts';
import { procedure, router } from '../init.ts';

export const userRouter = router({
  update: procedure
    .input(
      z.object({
        args: connectionArgs,
        name: z
          .string()
          .trim()
          .min(2, 'Name must be at least 2 characters.')
          .max(50, 'Name must be at most 32 characters.'),
        select: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.sessionUser) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update your name.',
        });
      }

      const select = prismaSelect(input.select, input.args);

      await auth.api.updateUser({
        body: { name: input.name },
        headers: ctx.headers,
      });

      return await ctx.prisma.user.findUniqueOrThrow({
        select,
        where: { id: ctx.sessionUser.id },
      } as UserFindUniqueArgs);
    }),
});
