import { createConnectionProcedureFactory } from '@nkzw/fate/server';
import type { AppContext } from './context.ts';
import { procedure } from './init.ts';

export const createConnectionProcedure =
  createConnectionProcedureFactory<AppContext>(procedure);
