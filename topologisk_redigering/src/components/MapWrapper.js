import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';
import {Fill, Stroke, Style} from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS from 'ol/source/WMTS';
import {get as getProjection} from 'ol/proj';
import {getWidth} from 'ol/extent';

//TODO Save polygon

function MapWrapper({changeSelectedTool, selectTool}) {
    const [map, setMap] = useState();
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;
    const [draw, setDraw] = useState()

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
    
    const OUTER_SWEDEN_EXTENT = [-1200000, 4700000, 2600000, 8500000];
    const wmts_3006_resolutions = [4096.0, 2048.0, 1024.0, 512.0, 256.0, 128.0, 64.0, 32.0, 16.0, 8.0];
    const wmts_3006_matrixIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

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
            projection: "EPSG:3006"
        }),
        style: 'default',
        wrapX: true,
    })

    const source = new VectorSource({wrapX: false});
    
    const polygonLayer = new VectorLayer({
        source: source,
    });

    const drawPolygon = () => {
        setDraw(new Draw({
            source: source,
            type: "Polygon",    //TODO: change to value from tool selection in menu/header.
        }));
    }

    useEffect(() => {
        console.log({changeSelectedTool})
        if ({changeSelectedTool}.changeSelectedTool == 'Add'){
            drawPolygon()  
        }
    }, [{changeSelectedTool}.changeSelectedTool])

    useEffect(() => {
        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                swedenMapLayer,
                polygonLayer
            ],
            taget: map,
            view: new View({
                center: [609924.45, 6877630.37],
                zoom: 5.9,
                minZoom:5.8,
                maxZoom:17,
                
            }),
        });
        setMap(initialMap);
        //drawPolygon();  //TODO: move to button interaction
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