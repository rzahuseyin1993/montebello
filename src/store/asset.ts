import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ApiState } from 'types/ApiState';
import { Asset } from 'types/asset/Asset';
import { AssetState } from 'types/asset/AssetState';

import { assets } from './mockupdata/assets';

export const initialState: AssetState = {
  assets: assets.map((assetItem, index) => {
    return {
      ...assetItem,
      id: index,
    };
  }),
  assetTypes: [
    { id: 'all_assets', name: 'All Assets' },
    { id: 'compliant', name: 'Compliant' },
    { id: 'shelter_rating', name: 'Shelter Rating' },
    { id: 'bench_rating', name: 'Bench Rating' },
    { id: 'trash_can_rating', name: 'Trash Can Rating' },
  ],
  assetConditions: [
    { id: 'excellent', name: 'Excellent', color: '#008000' },
    { id: 'good', name: 'Good', color: '#90ee90' },
    { id: 'fair', name: 'Fair', color: '#f0e68c' },
    { id: 'poor', name: 'Poor', color: '#ffd700' },
    { id: 'hazardous', name: 'Hazardous', color: '#ff0000' },
    { id: 'none', name: 'None', color: '#323232' },
  ],
  service: undefined,
  status: ApiState.idle,
  error: undefined,
};

export const assetSlice = createSlice({
  name: 'Asset',
  initialState,
  reducers: {
    setAssets: (state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload;
    },
  },
  // extraReducers: builder => {

  // }
});

export const { setAssets } = assetSlice.actions;
