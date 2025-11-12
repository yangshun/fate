import { z } from 'zod';
import {
  arrayToConnection,
  createConnectionProcedure,
} from '../../fate-server/connection.ts';
import { prismaSelect } from '../../fate-server/prismaSelect.tsx';
import { Event, EventAttendee } from '../../prisma/prisma-client/client.ts';
import { procedure, router } from '../init.ts';

const eventSelect = {
  _count: {
    select: {
      attendees: {
        where: { status: 'GOING' },
      },
    },
  },
  attendees: {
    select: {
      id: true,
      notes: true,
      status: true,
      user: { select: { id: true } },
    },
  },
  capacity: true,
  description: true,
  endAt: true,
  id: true,
  livestreamUrl: true,
  location: true,
  name: true,
  resources: true,
  startAt: true,
  topics: true,
  type: true,
} as const;

type EventRow = {
  _count?: { attendees: number };
  attendees?: Array<EventAttendee>;
} & Event;

const transformEvent = ({ _count, attendees, ...event }: EventRow) => ({
  ...event,
  attendees: arrayToConnection(attendees),
  attendingCount: _count?.attendees ?? 0,
});

export const eventRouter = router({
  byId: procedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)).nonempty(),
        select: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const select = prismaSelect(input.select);
      const events = await ctx.prisma.event.findMany({
        select: { ...select, ...eventSelect },
        where: { id: { in: input.ids } },
      });

      const map = new Map(
        events.map((event) => {
          const result = transformEvent(event as unknown as EventRow);
          return [result.id, result];
        }),
      );
      return input.ids.map((id) => map.get(id)).filter(Boolean);
    }),
  list: createConnectionProcedure({
    defaultSize: 3,
    map: ({ rows }) =>
      (rows as Array<EventRow & { _count: { attendees: number } }>).map(
        (event) => transformEvent(event),
      ),
    query: async ({ ctx, cursor, input, skip, take }) => {
      const select = prismaSelect(input.select);
      delete select.attendingCount;

      return ctx.prisma.event.findMany({
        orderBy: { startAt: 'asc' },
        select: { ...select, ...eventSelect },
        take,
        ...(cursor
          ? ({
              cursor: { id: cursor },
              skip,
            } as const)
          : null),
      });
    },
  }),
});
