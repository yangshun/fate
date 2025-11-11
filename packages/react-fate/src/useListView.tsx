import {
  ConnectionMetadata,
  ConnectionTag,
  Pagination,
  type View,
} from '@nkzw/fate';
import { useMemo } from 'react';
import { useFateClient } from './context.tsx';

type ConnectionItems<C> = C extends { items?: ReadonlyArray<infer Item> }
  ? ReadonlyArray<Item>
  : ReadonlyArray<never>;

type LoadMoreFn = (() => Promise<void>) | null;

export function useListView<
  V extends View<any, any>,
  C extends
    | { items?: ReadonlyArray<any>; pagination?: Pagination }
    | null
    | undefined,
>(
  view: V,
  connection: C,
): [ConnectionItems<NonNullable<C>>, LoadMoreFn, LoadMoreFn] {
  const client = useFateClient();
  const metadata =
    connection && typeof connection === 'object'
      ? ((connection as Record<symbol, unknown>)[ConnectionTag] as
          | ConnectionMetadata
          | undefined)
      : null;

  const loadNext: LoadMoreFn = useMemo(() => {
    const pagination = connection?.pagination;
    if (
      !metadata ||
      !pagination ||
      !pagination.hasNext ||
      !pagination.nextCursor
    ) {
      return null;
    }

    return async () => {
      const { before, last, ...values } = metadata.args || {};
      await client.loadConnection(
        view,
        metadata,
        {
          ...values,
          after: pagination.nextCursor,
        },
        {
          direction: 'forward',
        },
      );
    };
  }, [client, connection?.pagination, metadata, view]);

  const loadPrevious: LoadMoreFn = useMemo(() => {
    const pagination = connection?.pagination;
    if (
      !metadata ||
      !pagination ||
      !pagination.hasPrevious ||
      !pagination.previousCursor
    ) {
      return null;
    }

    return async () => {
      const { after, ...values } = metadata.args || {};
      await client.loadConnection(
        view,
        metadata,
        {
          ...values,
          before: pagination.previousCursor,
        },
        {
          direction: 'backward',
        },
      );
    };
  }, [client, connection?.pagination, metadata, view]);

  return [
    connection?.items as unknown as ConnectionItems<NonNullable<C>>,
    loadNext,
    loadPrevious,
  ];
}
