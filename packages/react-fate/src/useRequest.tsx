import { RequestResult, type Request, type RequestOptions } from '@nkzw/fate';
import { use, useDeferredValue, useEffect } from 'react';
import { useFateClient } from './context.tsx';

export function useRequest<R extends Request>(
  request: R,
  options?: RequestOptions,
): RequestResult<R> {
  const client = useFateClient();
  const promise = client.request(request, options);
  const mode = options?.mode ?? 'cache-or-network';

  useEffect(() => {
    if (mode === 'network-only' || mode === 'cache-and-network') {
      return () => {
        client.releaseRequest(request, mode);
      };
    }
  }, [client, mode, request]);

  return use(useDeferredValue(promise));
}
