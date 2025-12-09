import type { RootDefinition } from './types.ts';
import { RootKind } from './types.ts';

/**
 * Defines a root query for an entity type, capturing the response shape.
 */
export function root<Result>(type: string): RootDefinition<string, Result> {
  return Object.freeze({
    [RootKind]: true,
    type,
  }) as RootDefinition<string, Result>;
}
