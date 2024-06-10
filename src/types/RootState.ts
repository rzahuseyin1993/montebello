import { AuthState } from './auth/AuthState';
import { AssetState } from './asset/AssetState';
import { RouteState } from './route/RouteState';

export type RootState = {
  auth: AuthState;
  asset: AssetState;
  route: RouteState;
};
