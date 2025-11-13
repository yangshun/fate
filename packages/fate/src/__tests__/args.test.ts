import { expect, test } from 'vitest';
import { args, resolveArgs, v } from '../args.ts';
import { AnyRecord } from '../types.ts';

const createMarker = () =>
  args({
    filter: {
      range: { end: v('end', 100), start: v('start') },
      status: ['published', v('status')],
      tags: [{ label: 'important', value: v('tag') }],
    },
    limit: 10,
  });

test('resolveArgs resolves nested VarReferences inside plain objects', () => {
  const marker = createMarker();

  const resolved = resolveArgs(marker, {
    args: { start: 1, status: 'draft', tag: 't-1' },
  });

  expect(resolved).toEqual({
    filter: {
      range: { end: 100, start: 1 },
      status: ['published', 'draft'],
      tags: [{ label: 'important', value: 't-1' }],
    },
    limit: 10,
  });
});

test('resolveArgs clones plain object arguments when resolving', () => {
  const marker = createMarker();
  const resolved = resolveArgs(marker, {
    args: { start: 1, status: 'draft', tag: 't-1' },
  });

  const filter = resolved.filter as AnyRecord;
  expect(filter).not.toBe(marker.filter);
  expect(filter.range).not.toBe(marker.filter.range);
  expect(filter.tags).not.toBe(marker.filter.tags);
  expect((filter.tags as Array<unknown>)[0]).not.toBe(marker.filter.tags[0]);
});
