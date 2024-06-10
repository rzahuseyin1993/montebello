import { useRef, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Stack, Paper, Typography, TextField, MenuItem } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import ReactMapGL, { MapRef, Source, Layer } from 'react-map-gl';
import { LngLatBoundsLike, Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';

import Box from 'components/Box';
import { MAPBOX_ACCESS_TOKEN } from 'consts';

import { assetSelector, routeSelector } from 'selectors';

const MapViewer = () => {
  const { routes, routeCategories } = useSelector(routeSelector);
  const { assets, assetTypes, assetConditions } = useSelector(assetSelector);
  const mapRef = useRef<MapRef>(null);
  const [viewer, setViewer] = useState<{ map: Map | null }>({ map: null });
  const [isMapLoaded, setMapLoaded] = useState<boolean>(false);

  const [selectAssetType, setSelectAssetType] = useState<string>('all_assets');
  const [selectRouteCategory, setSelectRouteCategory] = useState<{
    id: string;
    name: string;
    color: string;
  }>({ id: 'all_routes', name: 'All Routes', color: '' });

  const filteredRoutes = useMemo(() => {
    if (selectRouteCategory.id === 'all_routes') {
      return routes;
    } else {
      return routes.filter(
        routeItem =>
          routeItem.properties.route_number === Number(selectRouteCategory.id),
      );
    }
  }, [routes, selectRouteCategory]);

  const assetGeoJSON = useMemo(() => {
    if (selectRouteCategory.id === 'all_routes') {
      return {
        type: 'FeatureCollection',
        features: assets.map(assetItem => {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [assetItem.longitude, assetItem.latitude],
            },
            properties: { ...assetItem },
          };
        }),
      } as any;
    } else {
      return {
        type: 'FeatureCollection',
        features: assets
          .map(assetItem => {
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [assetItem.longitude, assetItem.latitude],
              },
              properties: { ...assetItem },
            };
          })
          .filter(
            (assetItem: any) =>
              assetItem?.properties?.route_number ===
              Number(selectRouteCategory.id),
          ),
      } as any;
    }
  }, [assets, selectRouteCategory]);

  useEffect(() => {
    if (selectRouteCategory) {
      if (selectRouteCategory.id === 'all_routes') {
        const bbox = turf.bbox({
          type: 'FeatureCollection',
          features: routes,
        });
        viewer.map?.fitBounds(bbox as LngLatBoundsLike, {
          padding: 40,
        });
      } else {
        const selectRoutes = routes.filter(
          routeItem =>
            routeItem.properties.route_number ===
            Number(selectRouteCategory.id),
        );
        if (selectRoutes.length > 0) {
          const bbox = turf.bbox({
            type: 'FeatureCollection',
            features: selectRoutes,
          });
          viewer.map?.fitBounds(bbox as LngLatBoundsLike, {
            padding: 40,
          });
        }
      }
    }
  }, [selectRouteCategory]);

  useEffect(() => {
    if (isMapLoaded) {
      // viewer.map?.loadImage(
      //   'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
      //   (error, res: any) => {
      //     if (error) throw error;
      //     if (!map.hasImage('custom-marker')) {
      //       map.addImage('custom-marker', res);
      //     }
      //   },
      // );
      const bbox = turf.bbox({ type: 'FeatureCollection', features: routes });
      viewer.map?.fitBounds(bbox as LngLatBoundsLike, {
        padding: 40,
      });
    }
  }, [isMapLoaded]);

  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) {
        const map = mapRef.current.getMap();
        setViewer({ map: map });
        setMapLoaded(true);
      }
    }, 1000);
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <ReactMapGL
        ref={mapRef}
        initialViewState={{
          longitude: -118,
          latitude: 33.88,
          zoom: 8,
        }}
        style={{ width: '100%', height: '100%' }}
        // mapStyle="mapbox://styles/mapbox/streets-v12"
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        projection={{ name: 'globe' }}
        maxZoom={24}
        attributionControl={false}
        // cursor={mapCursor}
        preserveDrawingBuffer={true}
        // onResize={onMapResize}
        // onMouseMove={onHover}
        // onClick={onMapClick}
      >
        <Source
          id="route-source"
          type="geojson"
          data={{ type: 'FeatureCollection', features: filteredRoutes }}
        >
          <Layer
            id="route-layer"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 4,
            }}
          />
        </Source>
        <Source id="asset-source" type="geojson" data={assetGeoJSON}>
          <Layer
            id="asset-layer"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                12,
                6,
                20,
                12,
              ],
              'circle-color':
                selectAssetType === 'all_assets'
                  ? [
                      'case',
                      ['==', ['get', 'id'], -1], // Check if the stop_id is -1
                      'red', // Color to use if stop_id is -1
                      ['==', ['get', 'stop_id'], 9999], // Check if the id is 9999
                      'blue', // Color to use if id is 9999
                      'orange', // Default color for other ids
                    ]
                  : selectAssetType === 'compliant'
                    ? [
                        'match',
                        ['get', 'compliant'],
                        'Compliant',
                        'green',
                        'Not Compliant',
                        'red',
                        '#323232',
                      ]
                    : [
                        'match',
                        ['get', `${selectAssetType}`],
                        1,
                        '#FF0000',
                        2,
                        '#FFD700',
                        3,
                        '#F0E68C',
                        4,
                        '#90EE90',
                        5,
                        '#008000',
                        '#323232',
                      ],
            }}
          />
        </Source>
      </ReactMapGL>
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
        }}
      >
        <Paper elevation={1} sx={{ padding: '20px 10px 10px 10px' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <TextField
              label="Route Number"
              select={true}
              sx={{
                minWidth: '140px',
                '& .MuiOutlinedInput-input': {
                  padding: '12px 14px',
                },
              }}
              value={selectRouteCategory.id}
              onChange={event => {
                const newSelectRouteCategory = routeCategories.find(
                  item => item.id === event.target.value,
                );
                if (newSelectRouteCategory) {
                  setSelectRouteCategory(newSelectRouteCategory);
                }
              }}
            >
              {routeCategories.map(item => (
                <MenuItem key={`route-type-menu-${item.id}`} value={item.id}>
                  <Stack direction="row" alignItems={'center'} spacing={2}>
                    {item.id !== 'all_routes' && (
                      <div
                        style={{
                          width: '40px',
                          height: '5px',
                          backgroundColor: item.color,
                        }}
                      />
                    )}
                    <Typography>{item.name}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Asset Type"
              select={true}
              sx={{
                minWidth: '200px',
                '& .MuiOutlinedInput-input': {
                  padding: '12px 14px',
                },
              }}
              value={selectAssetType}
              onChange={event => setSelectAssetType(event.target.value)}
            >
              {assetTypes.map(assetTypeItem => (
                <MenuItem
                  key={`asset-type-menu-${assetTypeItem.id}`}
                  value={assetTypeItem.id}
                >
                  {assetTypeItem.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          width: '220px',
          maxHeight: '500px',
          overflow: 'auto',
        }}
      >
        <Paper elevation={1} sx={{ padding: '20px' }}>
          <Typography sx={{ fontWeight: 'bold' }}>Assets</Typography>

          {selectAssetType === 'all_assets' ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ ml: 2, mb: 1 }}
              >
                <CircleIcon sx={{ fontSize: '20px', color: 'red' }} />
                <Typography>Non-Completed</Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ ml: 2, mb: 1 }}
              >
                <CircleIcon sx={{ fontSize: '20px', color: 'orange' }} />
                <Typography>Surveyed</Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ ml: 2, mb: 1 }}
              >
                <CircleIcon sx={{ fontSize: '20px', color: 'blue' }} />
                <Typography>New Added</Typography>
              </Stack>
            </>
          ) : selectAssetType === 'compliant' ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ ml: 2, mb: 1 }}
              >
                <CircleIcon sx={{ fontSize: '20px', color: 'green' }} />
                <Typography>Compliant</Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ ml: 2, mb: 1 }}
              >
                <CircleIcon sx={{ fontSize: '20px', color: 'red' }} />
                <Typography>Not Compliant</Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ ml: 2, mb: 1 }}
              >
                <CircleIcon sx={{ fontSize: '20px', color: '#323232' }} />
                <Typography>None</Typography>
              </Stack>
            </>
          ) : (
            assetConditions.map(conditionItem => (
              <Stack
                key={`asset-legend-${conditionItem.id}`}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ ml: 2, mb: 1 }}
              >
                <CircleIcon
                  sx={{ fontSize: '20px', color: conditionItem.color }}
                />
                <Typography>{conditionItem.name}</Typography>
              </Stack>
            ))
          )}

          <Typography sx={{ fontWeight: 'bold' }}>Routes</Typography>
          {selectRouteCategory.id === 'all_routes' ? (
            routeCategories.map(item =>
              item.id === 'all_routes' ? null : (
                <Stack
                  key={`route-legend-${item.id}`}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ ml: 2 }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '5px',
                      backgroundColor: item.color,
                    }}
                  />
                  <Typography>{item.name}</Typography>
                </Stack>
              ),
            )
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ ml: 2 }}
            >
              <div
                style={{
                  width: '40px',
                  height: '5px',
                  backgroundColor: selectRouteCategory.color,
                }}
              />
              <Typography>{selectRouteCategory.name}</Typography>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default MapViewer;
