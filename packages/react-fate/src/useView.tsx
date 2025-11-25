import {
  EntityId,
  View,
  ViewData,
  ViewEntity,
  ViewEntityName,
  ViewRef,
  ViewSelection,
  ViewSnapshot,
  ViewTag,
} from '@nkzw/fate';
import {
  use,
  useCallback,
  useDeferredValue,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useFateClient } from './context.tsx';

type ViewEntityWithTypename<V extends View<any, any>> = ViewEntity<V> & {
  __typename: ViewEntityName<V>;
};

export function useView<V extends View<any, any>>(
  view: V,
  ref: ViewRef<ViewEntityName<V>>,
): ViewData<ViewEntityWithTypename<V>, ViewSelection<V>> {
  const client = useFateClient();

  const idRef = useRef<ReadonlySet<EntityId> | null>(null);
  const getSnapshot = useCallback(() => {
    const snapshot = client.readView<ViewEntity<V>, V[ViewTag]['select'], V>(
      view,
      ref,
    );
    idRef.current = snapshot.status === 'fulfilled' ? snapshot.value.ids : null;
    return snapshot;
  }, [client, view, ref]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const subscriptions = new Map<EntityId, () => void>();

      const onChange = () => {
        updateSubscriptions();
        onStoreChange();
      };

      const subscribe = (entityId: EntityId) => {
        if (!subscriptions.has(entityId)) {
          subscriptions.set(
            entityId,
            client.store.subscribe(entityId, onChange),
          );
        }
      };

      const cleanupObsolete = (nextIds: ReadonlySet<EntityId>) => {
        for (const [entityId, unsubscribe] of subscriptions) {
          if (!nextIds.has(entityId)) {
            unsubscribe();
            subscriptions.delete(entityId);
          }
        }
      };

      const updateSubscriptions = () => {
        if (!idRef.current) {
          return;
        }

        for (const entityId of idRef.current) {
          subscribe(entityId);
        }

        cleanupObsolete(idRef.current);
      };

      updateSubscriptions();

      return () => {
        for (const unsubscribe of subscriptions.values()) {
          unsubscribe();
        }
        subscriptions.clear();
      };
    },
    [client.store],
  );

  return (
    use(
      useDeferredValue(
        useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
      ),
    ) as ViewSnapshot<ViewEntity<V>, ViewSelection<V>>
  ).data;
}
