import { expect, it } from 'vitest';
import ViewDataCache from '../cache.ts';
import { Store } from '../store.ts';

it('keeps cursor alignment when removing ids with undefined cursors', () => {
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
