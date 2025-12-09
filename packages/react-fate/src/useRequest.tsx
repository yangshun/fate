import { RequestResult, type Request, type RequestOptions } from '@nkzw/fate';
import { FateRoots } from '@nkzw/fate';
import { use, useDeferredValue, useEffect } from 'react';
import { useFateClient } from './context.tsx';
import { ClientRoots } from './index.tsx';

type Roots = keyof ClientRoots extends never ? FateRoots : ClientRoots;

/**
 * Declares the data a screen needs and kicks off fetching, suspending while the
 * request resolves.
 *
 * @example
 * const { posts } = useRequest({ posts: { root: PostView, type: 'Post' } as const });
 */
export function useRequest<Roots, R extends Request>(
  request: R,
  options?: RequestOptions,
): RequestResult<R> {
  const client = useFateClient();
  const promise = client.request(request, options);
  const mode = options?.mode ?? 'cache-first';

  useEffect(() => {
    if (mode === 'network-only' || mode === 'stale-while-revalidate') {
      return () => {
        client.releaseRequest(request, mode);
      };
    }
  }, [client, mode, request]);

  return use(useDeferredValue(promise));
}
