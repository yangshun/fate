import type { Entity, MutationDefinition } from './types.ts';
import { MutationKind } from './types.ts';

export function mutation<T extends Entity, I, R>(
  entity: T['__typename'],
): MutationDefinition<T, I, R> {
  return {
    entity,
    [MutationKind]: true,
  };
}
