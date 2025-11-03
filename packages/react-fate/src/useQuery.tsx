import { isNodeItem, type FragmentRef, type Query } from '@nkzw/fate';
import { AnyQuery } from '@nkzw/fate/src/types.ts';
import { use, useMemo } from 'react';
import { useFateClient } from './context.tsx';

type QueryResult<Q extends AnyQuery> = {
  [K in keyof Q]: Q[K] extends { type: infer NodeType extends string }
    ? Array<FragmentRef<NodeType>>
    : never;
};

export function useQuery<Q extends Query>(query: Q): QueryResult<Q> {
  const client = useFateClient();
  const promise = client.ensureQuery(query);
  if (promise) {
    use(promise);
  }

  const result = useMemo(() => {
    const result: Record<string, unknown> = {};
    for (const [name, item] of Object.entries(query)) {
      result[name] = isNodeItem(item)
        ? item.ids.map((id) => client.ref(item.type, id, item.root))
        : (client.store.getList(name) ?? []).map((id: string) =>
            client.entityRef(id, item.root),
          );
    }
    return result as QueryResult<Q>;
  }, [client, query]);

  return result;
}
