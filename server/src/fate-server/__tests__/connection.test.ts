import { describe, expect, it, vi } from 'vitest';
import { router } from '../../trpc/init.ts';
import { arrayToConnection, createConnectionProcedure } from '../connection.ts';

describe('createConnectionProcedure', () => {
  it('allows nested connection args', async () => {
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
});

describe('arrayToConnection', () => {
  it('derives pagination from provided args', () => {
    const result = arrayToConnection(
      [{ id: 'comment-1' }, { id: 'comment-2' }],
      { args: { first: 1 } },
    );

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
});
