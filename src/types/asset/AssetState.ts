import { ApiState } from 'types/ApiState';
import { Error } from 'types/Error';
import { Asset } from './Asset';

export type AssetState = {
  assets: Asset[];
  assetTypes: { id: string; name: string }[];
  assetConditions: { id: string; name: string; color: string }[];
  service: string | undefined;
  status: ApiState;
  error?: Error;
};
