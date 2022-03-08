import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS from 'ol/source/WMTS';
import { get as getProjection } from 'ol/proj';
import { getWidth } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import MultiPoint from 'ol/geom/MultiPoint';
import  { drawPolygon } from './DrawPolygon';
import { featuresToGeoJSON } from './GeoJsonHandler';
import { saveToDatabase, GeoJsonObjToFeatureList, loadPolyFromDB } from './DatabaseHandler';
import { deleteLatest } from './DeletePolygon'
import {zoomToLastPolygon} from './ZoomToPolygon'



function MapWrapper({geoJsonData}) {
    const [map, setMap] = useState();
    const [currentTool, setCurrentTool] = useState('NONE')
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;

   
    const projection = getProjection('EPSG:3857');
    const projectionExtent = projection.getExtent();
    const size = getWidth(projectionExtent) / 256;
    const resolutions = new Array(19);
    const matrixIds = new Array(19);
    for (let z = 0; z < 19; ++z) {
        //generate resolutions and matrixIds arrays for this WMTS
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
    }
    

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const OUTER_SWEDEN_EXTENT = [-1200000, 4700000, 2600000, 8500000];
    const wmts_3006_resolutions = [4096.0, 2048.0, 1024.0, 512.0, 256.0, 128.0, 64.0, 32.0, 16.0, 8.0];
    const wmts_3006_matrixIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];   

    const styles = [
        new Style({
          stroke: new Stroke({
            color: 'light-blue',
            width: 3,
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)',
          }),
        }),
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({
              color: 'orange',
            }),
          }),
          
          geometry: function (feature) {
            // return the coordinates of the first ring of the polygon
            const coordinates = feature.getGeometry().getCoordinates()[0];
            return new MultiPoint(coordinates);
          },
        }),
         new Style({
            fill: new Fill({
                color:'rgba(255,255,0,0.1'
            })
              
        }) 
      ];

      const tilegrid = new WMTSTileGrid({
        tileSize: 256,
        extent: OUTER_SWEDEN_EXTENT,
        resolutions: wmts_3006_resolutions,
        matrixIds: wmts_3006_matrixIds
    });

    const swedenMapLayer = new TileLayer({
        source: new WMTS({
            url: "https://api.lantmateriet.se/open/topowebb-ccby/v1/wmts/token/5401f50c-568c-3459-a49f-69426e4ed1c6/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=topowebb&STYLE=default&FORMAT=image/png",
            layer: "swedenMapLayer",
            format: 'image/png',
            matrixSet: '3006',
            tileGrid: tilegrid,
            version: '1.0.0',
            style: 'default',
            crossOrigin: 'anonymous',
            projection: "EPSG:3006",
            useSpatialIndex: 'false',
        }),
        style: 'default',
        wrapX: true,
    })

    const source = new VectorSource({
        wrapX: false,
        url: "http://localhost:4000/file1",
        format: new GeoJSON({ projection: "EPSG:3006" }),

    });

    const polygonLayer = new VectorLayer({
        source: source,
        style: styles
    });

   
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        console.log(swedenMapLayer)

            const initialMap = new Map({
                target: mapElement.current,
                layers: [
                    swedenMapLayer, 
                    polygonLayer
                ],
                view: new View({
                    center: [609924.45, 6877630.37],
                    zoom: 5.9,
                    minZoom: 5.8,
                    maxZoom: 17,

                }),
            })     
            setMap(initialMap)

    },[])

    const onMapClickHandler = () => {
        if (currentTool === "NONE"){
            console.log("whooop")
            setCurrentTool('DRAW')
            drawPolygon(map)
            
        }
        else {}
    }

    useEffect (() => {
        console.log(currentTool)
    }, [currentTool])

    const getFeatureList = () => {
        return map.getLayers().getArray()[1].getSource().getFeatures()
    }

    //move to geojson functions
    

    //unsure how setSource would work in diff file
    const loadGeoJsonData = () => {
        console.log(JSON.stringify(geoJsonData))
        //const featureList = GeoJsonObjToFeatureList(geoJsonData)
        const source = new VectorSource({
            wrapX: false,
            features: GeoJsonObjToFeatureList(geoJsonData)
        });
        //console.log(map.getLayers().getArray()[1])
        map.getLayers().getArray()[1].setSource(source)
    }
    
    
/*     useEffect(() => {

        if (currentTool === 'Add'){
            drawPolygon(map)
        } 
        if (currentTool === 'Zoom'){
            zoomToLastPolygon(map) 
        }
        else if (currentTool === 'Import'){
            loadPolyFromDB()
        }
        else if(currentTool === 'Etc'){
            //featuresToGeo()
        }
        else if (currentTool === 'Save') {
            saveToDatabase(getFeatureList())
        }
        else if (currentTool === 'Delete') {
            deleteLatest(map)
        }
        else if (currentTool === 'AppVariableImport') {
            loadGeoJsonData()
        }
          
    }, [currentTool]) */

    return (
        <>
            
            <div style={{ height: '100vh', width: '100%' }} 
            ref={mapElement} 
            className="map-container"
            onClick={onMapClickHandler}
            >                
            </div>
        </>
    );
}

export default MapWrapper;