import { LineString } from 'geojson';

export type Route = {
  type: 'Feature';
  geometry: LineString;
  properties: {
    route_number: number;
    name: string;
    color: string;
  };
};
