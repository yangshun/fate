import type { RootDefinition, TypeName } from './types.ts';
import { RootKind } from './types.ts';

/**
 * Defines a root query for an entity type, capturing the response shape.
 */
export function clientRoot<Result, Type extends TypeName>(
  type: Type,
): RootDefinition<Type, Result> {
  return Object.freeze({
    [RootKind]: true,
    type,
  }) as RootDefinition<Type, Result>;
}
