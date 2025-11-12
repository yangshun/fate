import {
  arrayToConnection,
  createConnectionProcedure,
} from '../../fate-server/connection.ts';
import { prismaSelect } from '../../fate-server/prismaSelect.tsx';
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
    map: ({ rows }) =>
      (rows as Array<ProjectRow>).map(
        ({ updates, ...project }: ProjectRow) => ({
          ...project,
          updates: arrayToConnection(updates),
        }),
      ),
    query: async ({ ctx, cursor, input, skip, take }) => {
      const select = prismaSelect(input.select);

      return ctx.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          ...projectSelect,
          ...select,
        },
        take,
        ...(cursor
          ? {
              cursor: { id: cursor },
              skip,
            }
          : {}),
      });
    },
  }),
});
