import { initTRPC } from '@trpc/server';
import { expect, test, vi } from 'vitest';
import { z } from 'zod';
import { arrayToConnection, withConnection } from '../connection.ts';

const t = initTRPC.create();

const router = t.router;
const procedure = t.procedure;

const createConnectionProcedure = withConnection(procedure);

test('allows nested connection args', async () => {
  const query = vi.fn(async () => [] as Array<unknown>);
  const list = createConnectionProcedure({ query });
  const appRouter = router({ list });
  const caller = appRouter.createCaller({
    headers: {},
    prisma: {} as never,
    sessionUser: null,
  });

  await expect(
    caller.list({
      args: { comments: { first: 2 } },
      select: [],
    }),
  ).resolves.toEqual({
    items: [],
    pagination: {
      hasNext: false,
      hasPrevious: false,
      nextCursor: undefined,
      previousCursor: undefined,
    },
  });

  expect(query).toHaveBeenCalledWith(
    expect.objectContaining({
      cursor: undefined,
      direction: 'forward',
      input: expect.objectContaining({
        args: { comments: { first: 2 } },
      }),
      skip: undefined,
      take: 21,
    }),
  );
});

test('merges additional input options', async () => {
  const query = vi.fn(async () => [] as Array<unknown>);
  const list = createConnectionProcedure({
    input: z.object({
      search: z.string().min(1, 'Search query is required'),
    }),
    query,
  });
  const appRouter = router({ list });
  const caller = appRouter.createCaller({
    headers: {},
    prisma: {} as never,
    sessionUser: null,
  });

  await expect(
    caller.list({
      args: { first: 1, search: 'comment' },
      select: [],
    }),
  ).resolves.toEqual({
    items: [],
    pagination: {
      hasNext: false,
      hasPrevious: false,
      nextCursor: undefined,
      previousCursor: undefined,
    },
  });

  expect(query).toHaveBeenCalledWith(
    expect.objectContaining({
      cursor: undefined,
      direction: 'forward',
      input: expect.objectContaining({
        args: { first: 1, search: 'comment' },
      }),
      skip: undefined,
      take: 2,
    }),
  );
});

test('derives pagination from provided args', () => {
  const result = arrayToConnection([{ id: 'comment-1' }, { id: 'comment-2' }], {
    args: { first: 1 },
  });

  expect(result).toEqual({
    items: [
      {
        cursor: 'comment-1',
        node: { id: 'comment-1' },
      },
    ],
    pagination: {
      hasNext: true,
      hasPrevious: false,
      nextCursor: 'comment-1',
      previousCursor: undefined,
    },
  });
});
