import { createContext, ReactNode, use } from 'react';
import type { FateClient as FateClientT } from '@nkzw/fate';

const FateContext = createContext<FateClientT | null>(null);

/**
 * Provider component that supplies a configured `FateClient` to React hooks.
 */
export function FateClient({ children, client }: { children: ReactNode; client: FateClientT }) {
  return <FateContext value={client}>{children}</FateContext>;
}

/**
 * Returns the nearest `FateClient` from context.
 */
export function useFateClient(): FateClientT {
  const context = use(FateContext);
  if (!context) {
    throw new Error(`react-fate: '<FateContext value={client}>' is missing.`);
  }
  return context;
}
