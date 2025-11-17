import { expect, test, vi } from 'vitest';
import ViewDataCache from '../cache.ts';
import { Store } from '../store.ts';

test('keeps cursor alignment when removing ids with undefined cursors', () => {
  const store = new Store();
  const cache = new ViewDataCache();
  const listKey = 'list';

  store.setList(listKey, {
    cursors: ['cursor-one', undefined],
    ids: ['one', 'two'],
  });

  store.removeReferencesTo('one', cache);

  const list = store.getList(listKey);
  expect(list).toEqual(['two']);

  const state = list ? store.getListState(listKey) : undefined;
  expect(state?.cursors).toEqual([undefined]);
});

test('does not update records or notify subscribers for shallow equal merges', () => {
  const store = new Store();
  const entityId = 'Post:1';

  store.merge(
    entityId,
    {
      __typename: 'Post',
      id: 'post-1',
      title: 'Apple',
    },
    new Set(['__typename', 'id', 'title']),
  );

  const initialRecord = store.read(entityId);
  const subscriber = vi.fn();
  store.subscribe(entityId, subscriber);

  store.merge(entityId, {}, new Set());

  expect(store.read(entityId)).toBe(initialRecord);
  expect(subscriber).not.toHaveBeenCalled();

  store.merge(
    entityId,
    {
      title: 'Apple',
    },
    new Set(['title']),
  );

  expect(store.read(entityId)).toBe(initialRecord);
  expect(subscriber).not.toHaveBeenCalled();

  store.merge(
    entityId,
    {
      title: 'Banana',
    },
    new Set(['title']),
  );

  expect(store.read(entityId)).not.toBe(initialRecord);
  expect(subscriber).toHaveBeenCalled();
});
