const toPrismaArgs = (
  args: Record<string, unknown>,
): Record<string, unknown> => {
  const prismaArgs: Record<string, unknown> = {};

  if (typeof args.first === 'number') {
    prismaArgs.take = args.first + 1;
  }

  if (args.after !== undefined) {
    prismaArgs.cursor = { id: args.after };
    prismaArgs.skip = 1;
  }

  return prismaArgs;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const scopedArgsForPath = (
  args: Record<string, unknown> | undefined,
  path: string,
): Record<string, unknown> | undefined => {
  if (!args) {
    return undefined;
  }

  const segments = path.split('.');
  let current: unknown = args;

  for (const segment of segments) {
    if (!isRecord(current)) {
      return undefined;
    }
    current = current[segment];
  }

  return isRecord(current) ? current : undefined;
};

export function prismaSelect(
  paths: Array<string>,
  args?: Record<string, unknown>,
): Record<string, unknown> {
  const allPaths = [...new Set([...paths, 'id'])];
  const select: Record<string, unknown> = {};

  for (const path of allPaths) {
    const segments = path.split('.');
    let current = select;
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}.${segment}` : segment;

      if (index === segments.length - 1) {
        if (segment === 'cursor') {
          return;
        }

        current[segment] = true;
        return;
      }

      const existing = current[segment];
      const relation =
        existing &&
        typeof existing === 'object' &&
        existing !== null &&
        'select' in existing
          ? (existing as Record<string, unknown> & {
              select: Record<string, unknown>;
            })
          : ({ select: {} } as Record<string, unknown> & {
              select: Record<string, unknown>;
            });

      const scopedArgs = scopedArgsForPath(args, currentPath);
      if (scopedArgs) {
        Object.assign(relation, toPrismaArgs(scopedArgs));
      }

      current[segment] = relation;
      current = relation.select;
    });
  }

  return select;
}
