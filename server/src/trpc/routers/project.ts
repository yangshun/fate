import {
  arrayToConnection,
  createConnectionProcedure,
} from '../../fate-server/connection.ts';
import {
  prismaSelect,
  scopedArgsForPath,
} from '../../fate-server/prismaSelect.tsx';
import { Project, ProjectUpdate } from '../../prisma/prisma-client/client.ts';
import { router } from '../init.ts';

const projectSelect = {
  focusAreas: true,
  id: true,
  metrics: true,
  name: true,
  progress: true,
  startDate: true,
  status: true,
  summary: true,
  targetDate: true,
  updates: {
    select: {
      confidence: true,
      content: true,
      createdAt: true,
      id: true,
      mood: true,
    },
  },
} as const;

type ProjectRow = Project & {
  updates?: Array<ProjectUpdate>;
};

export const projectRouter = router({
  list: createConnectionProcedure({
    defaultSize: 3,
    map: ({ input, rows }) =>
      (rows as Array<ProjectRow>).map(
        ({ updates, ...project }: ProjectRow) => ({
          ...project,
          updates: arrayToConnection(updates, {
            args: scopedArgsForPath(input.args, 'updates'),
          }),
        }),
      ),
    query: async ({ ctx, cursor, direction, input, skip, take }) => {
      const select = prismaSelect(input.select, input.args);

      const rows = await ctx.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          ...projectSelect,
          ...select,
        },
        take: direction === 'forward' ? take : -take,
        ...(cursor
          ? {
              cursor: { id: cursor },
              skip,
            }
          : {}),
      });
      return direction === 'forward' ? rows : rows.reverse();
    },
  }),
});
