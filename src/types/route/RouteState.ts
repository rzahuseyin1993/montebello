import { ApiState } from 'types/ApiState';
import { Error } from 'types/Error';

import { Route } from './Route';

export type RouteState = {
  routes: Route[];
  routeCategories: { id: string; name: string; color: string }[];
  service: string | undefined;
  status: ApiState;
  error?: Error;
};
