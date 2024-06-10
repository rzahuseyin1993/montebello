import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ApiState } from 'types/ApiState';
import { Route } from 'types/route/Route';
import { RouteState } from 'types/route/RouteState';
import { ROUTE_COLORS } from 'consts';

import { routeFeatures } from './mockupdata/routes';

export const initialState: RouteState = {
  routes: routeFeatures.map(feature => {
    return {
      ...feature,
      properties: {
        ...feature.properties,
        color: ROUTE_COLORS[feature.properties.route_number] ?? '#000000',
      },
    } as Route;
  }),
  routeCategories: [
    { id: 'all_routes', name: 'All Routes', color: '' },
    { id: '10', name: '10', color: '#529bd2' },
    { id: '20', name: '20', color: '#285630' },
    { id: '30', name: '30', color: '#d83738' },
    { id: '40', name: '40', color: '#a02f71' },
    { id: '50', name: '50', color: '#82a34e' },
    { id: '60', name: '60', color: '#4c327a' },
    { id: '70', name: '70', color: '#32587c' },
    { id: '90', name: '90', color: '#9e8a40' },
  ],
  service: undefined,
  status: ApiState.idle,
  error: undefined,
};

export const routeSlice = createSlice({
  name: 'Asset',
  initialState,
  reducers: {
    setRoutes: (state, action: PayloadAction<Route[]>) => {
      state.routes = action.payload;
    },
  },
  //   extraReducers: builder => {

  //   },
});

export const { setRoutes } = routeSlice.actions;
