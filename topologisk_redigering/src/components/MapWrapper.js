import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import {Fill, Stroke, Style} from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import WMTSSource from "ol/source/WMTS";
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS from 'ol/source/WMTS';
import {get as getProjection} from 'ol/proj';
import {getTopLeft, getWidth} from 'ol/extent';
//import {get as getProjection} from "ol/proj"


//TODO Save polygon
//TODO Put vector layer into map. sammanfoga kod från app och wrapper på ett smart sätt 

function MapWrapper( ) {
    const [map, setMap] = useState();
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;
    const [draw, setDraw] = useState()

    const source = new VectorSource({wrapX: false});

    const wSource = new WMTSSource({
        //url: 'https://api.lantmateriet.se/open/topowebb-ccby/v1/wmts/token/voU1dN3au7UlPoc3oluV65EfEEIa/',
        url: "https://api.lantmateriet.se/open/topowebb-ccby/v1/wmts/token/Id3mSjTmArivr1cffRxobYDTU0Ma/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0",
        layer: "testName",
        format: 'image/png',
        matrixSet: '3006',
        //tileGrid: tilegrid,
        version: '1.0.0',
        style: 'default',
        crossOrigin: 'anonymous',
        projection: "EPSG:3006"
    });
    
    const vector = new VectorLayer({
        source: source,
      });

    const drawPolygon = () => {
        setDraw(new Draw({
            source: source,
            type: "Polygon",
        }));
    }

    const styles = [
        new Style({
            stroke: new Stroke({
              color: 'red',
              width: 1,
            }),
            fill: new Fill({
              color: 'rgba(125, 255, 255, 0.5)',
            }),
          }),
    ]

    const handleMapClick = (e) => {
    }

    /*const updateMap = (newFeature) => {
        const vectorSource = new VectorSource({projection: 'EPSG:4326'})
        vectorSource.addFeature(newFeature)
        const vectorLayer = new VectorLayer({source: vectorSource, style: styles, name: "Tag"})
        map.getLayerGroup().getLayers()
        map.addLayer(vectorLayer)
    }*/



    useEffect(() => {

        const projection = getProjection('EPSG:3857');
        const projectionExtent = projection.getExtent();
        const size = getWidth(projectionExtent) / 256;
        const resolutions = new Array(19);
        const matrixIds = new Array(19);
        for (let z = 0; z < 19; ++z) {
          // generate resolutions and matrixIds arrays for this WMTS
          resolutions[z] = size / Math.pow(2, z);
          matrixIds[z] = z;
        }
        
        const OUTER_SWEDEN_EXTENT = [-1200000, 4700000, 2600000, 8500000];
        const wmts_3006_resolutions = [4096.0, 2048.0, 1024.0, 512.0, 256.0, 128.0, 64.0, 32.0, 16.0, 8.0];
        const wmts_3006_matrixIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        const tilegrid = new WMTSTileGrid({
            tileSize: 256,
            extent: OUTER_SWEDEN_EXTENT,
            resolutions: wmts_3006_resolutions,
            matrixIds: wmts_3006_matrixIds
        });

        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                /* new TileLayer({ 
                    source: new OSM(),
                }), */
          /*       new TileLayer({ 
                    
                    opacity: 0.7,
                    source: new WMTS({
                        attributions:
                        'Tiles © <a href="https://mrdata.usgs.gov/geology/state/"' +
                        ' target="_blank">USGS</a>',
                        url: 'https://mrdata.usgs.gov/mapcache/wmts',
                        layer: 'sgmc2',
                        matrixSet: 'GoogleMapsCompatible',
                        format: 'image/png',
                        projection: projection,
                        tileGrid: new WMTSTileGrid({
                        origin: getTopLeft(projectionExtent),
                        resolutions: resolutions,
                        matrixIds: matrixIds,
                    }),
                    style: 'default',
                    wrapX: true,
                    })
                }), */
                new TileLayer({ 
                    //opacity: 0.7,
                    source: new WMTS({
                        url: "https://api.lantmateriet.se/open/topowebb-ccby/v1/wmts/token/5401f50c-568c-3459-a49f-69426e4ed1c6/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=topowebb&STYLE=default&FORMAT=image/png",
                        //url: 'https://api.lantmateriet.se/open/topowebb-ccby/v1/wmts/token/5401f50c-568c-3459-a49f-69426e4ed1c6/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=topowebb&STYLE=default&TILEMATRIXSET=3006&TILEMATRIX=9&TILEROW=862&TILECOL=887&FORMAT=image/png',
                        layer: "testName",
                        format: 'image/png',
                        matrixSet: '3006',
                        tileGrid: tilegrid,
                        version: '1.0.0',
                        style: 'default',
                        crossOrigin: 'anonymous',
                        projection: "EPSG:3006"
                    }),
                    style: 'default',
                    wrapX: true,
                }),
                vector
            ],
            taget: map,
            view: new View({
                center: [609924.45, 6877630.37],
                zoom: 6,
            }),
        });
        initialMap.on('click', handleMapClick)
        setMap(initialMap);
        drawPolygon();  //TODO: move to button interaction

    }, []);

    useEffect(() => {
        if (map) {
             map.addInteraction(draw) 
            }
        }, [draw])

    return (
        <div style={{height:'100vh',width:'100%'}} ref={mapElement} className="map-container" />
    );
}

export default MapWrapper;

//   5401f50c-568c-3459-a49f-69426e4ed1c6