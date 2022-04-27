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
import MultiPoint from 'ol/geom/MultiPoint';
import OL3Parser from "jsts/org/locationtech/jts/io/OL3Parser";
import { Point, LineString, LinearRing, Polygon, MultiLineString, MultiPolygon } from 'ol/geom'
import { drawPolygon } from '../res/UIFunctions.mjs';
import { createStringXY } from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition'
import { defaults as defaultControls } from 'ol/control'
//import getMergeableFeatures, { handleIntersections, mergeFeatures } from '../res/jsts';
import { fixOverlaps, handleMerge } from '../res/PolygonHandler.mjs';
import { Select, Modify } from 'ol/interaction';
import {click} from "ol/events/condition"
import {deletePolygon} from '../res/HelperFunctions.mjs'
import {defaultStyle, selectedStyle, invalidStyle} from '../res/Styles.mjs'
import { isValid, unkink }  from '../res/unkink.mjs'
import { geoJsonFeature2olFeature, geoJsonFeatureCollection2olFeatures, olFeature2geoJsonFeature, olFeatures2GeoJsonFeatureCollection } from '../translation/translators.mjs';
import { saveToDatabase } from '../res/DatabaseFunctions.mjs';



function MapWrapper() {
    const [map, setMap] = useState();
    //const [currentTool, setCurrentTool] = useState('NONE')
    //const [selectedPolygon, setSelectedPolygon] = useState()
    let clickHandlerState = 'NONE';
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
    const attributions = "Click screen to draw, dubble click polygon to remove and to merge click two adjacent polygons"

    const parser = new OL3Parser();
    parser.inject(
        Point,
        LineString,
        LinearRing,
        Polygon,
        MultiPoint,
        MultiLineString,
        MultiPolygon
    );
    
    const OUTER_SWEDEN_EXTENT = [-1200000, 4700000, 2600000, 8500000];
    const wmts_3006_resolutions = [4096.0, 2048.0, 1024.0, 512.0, 256.0, 128.0, 64.0, 32.0, 16.0, 8.0];
    const wmts_3006_matrixIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];   

    const select = new Select({condition: click, style:selectedStyle})

    const tilegrid = new WMTSTileGrid({
        tileSize: 256,
        extent: OUTER_SWEDEN_EXTENT,
        resolutions: wmts_3006_resolutions,
        matrixIds: wmts_3006_matrixIds
    });

    const swedenMapLayer = new TileLayer({
        source: new WMTS({
            attributions: attributions,
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
        style: defaultStyle
    });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    //fixes overlaps for the latest polygon added to map
    const cleanUserInput = (map) => {
        
        if(getFeatureList(map).length > 1)
        {
            let newPolygons = fixOverlaps(olFeatures2GeoJsonFeatureCollection(getFeatureList(map)))
            let featureList = geoJsonFeatureCollection2olFeatures(newPolygons) //  GeoJSON.readFeatures(geoJsonData)
            if(featureList.length > 0){
                getSource(map).clear()
                getSource(map).addFeatures(featureList) 
                //saveToDatabase(featureList)
            }else{
                console.log("cleaned input is empty")
            }
        }
    }

    const mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(2),
        projection: "EPSG:3006",
    })

    useEffect(() => {
        const initialMap = new Map({
            controls: defaultControls().extend([mousePositionControl]),
            target: mapElement.current,
            layers: [
                swedenMapLayer,
                polygonLayer
            ],
            view: new View({
                center: [609924.45, 6877630.37],
                zoom: 9,
                minZoom: 5.8,
                maxZoom: 17,

            }),
        });
        initialMap.addInteraction(select)
        initialMap.on('click', onMapClickGetPixel)
        initialMap.addInteraction(modify)
        modify.on('modifyend', handleModifyend)
        setMap(initialMap)
    }, []);


    const handleNewPoly = (evt) => {
        // when add feature check if valid
        if (!isValid(olFeature2geoJsonFeature(evt.feature))) {
            //deleteLatest()
            map.getLayers().getArray()[1].getSource().removeFeature(evt.feature)
        }
    }


    const handleModifyend = (event) => {
        let features = getFeatureList(event.target.map_)
        console.log(features.length)

        for(let i=0; i<features.length; i++)
        {
            
            console.log(isValid(olFeature2geoJsonFeature(features[i])));
            // check if unkink creates the hidden polygon
            // fill new polygons from unkink with red

            if(!isValid(olFeature2geoJsonFeature(features[i])))
            {
                try {
                    let geoJsonCollection = unkink( olFeature2geoJsonFeature(features[i]))
                    let source2 = getSource(event.target.map_)
                    source2.removeFeature(features[i])
                    //debugger
                    for (let index = 0; index < geoJsonCollection.features.length; index++) {
                        const geoJsonfeature = geoJsonCollection.features[index];
                        source2.addFeature(geoJsonFeature2olFeature(geoJsonfeature))
                    }
                    
                } catch (error) {
                    console.log(error)
                    
                }
               
                
            }
        }
        
        cleanUserInput(event.target.map_)
        // erros to cry about
            // unable to assign hole to a shell wut??
            // side location conflict
            // found non-noded intersection 
    }


    const modify = new Modify({
        source: source, 
        hitDetection: true
    })



    /* Contextual clickhandler, different actions depending on if you click on a polygon or somewhere on the map */
    const onMapClickGetPixel = (event) => {

        /* Check if clicked on an existing polygon */
        if (isPolygon(event.map, event.pixel)){

            const clickedPolygon = getPolygon(event.map, event.pixel)
            const selectedPolygon = getSelectedPolygon()
            if(clickedPolygon !== -1){
                if(selectedPolygon !== -1){
                    if(clickedPolygon.ol_uid !== selectedPolygon.ol_uid){
                        
                        let featureList = olFeatures2GeoJsonFeatureCollection(getFeatureList(event.map))
                        let newPoly = handleMerge(olFeature2geoJsonFeature(clickedPolygon), olFeature2geoJsonFeature(selectedPolygon),featureList)
                    
                        if(newPoly !== -1){
                            let OlPoly = (new GeoJSON()).readFeature(newPoly) //  GeoJSON.readFeatures(geoJsonData)
                            deletePolygon(event.map, clickedPolygon)
                            deletePolygon(event.map, selectedPolygon)
                            getSource(event.map).addFeature(OlPoly)
                                
                        }else{
                            console.log("didnt find the poly ni the list")
                        }
                    }
                }
      
                /* This done to make sure correct polygon is deleted. Otherwise the previous one is deleted because of delay. */
                //if clicked only needed if running mergable
                if (clickedPolygon.ol_uid === selectedPolygon.ol_uid) {
                    deletePolygon(event.map, select.getFeatures().getArray()[0])
                }
            }
            
        } else {
            if (clickHandlerState === 'DRAWEND') {
                console.log("Running checks because polygon is finished drawing")
                //unkink the drawn polygon HERE
                cleanUserInput(event.map)
                clickHandlerState = 'NONE'
            }
            else if (clickHandlerState === 'NONE'){
                clickHandlerState = 'DRAW'
                drawPolygon(event.map).addEventListener('drawend', (evt) => {
        
                    handleDrawend(evt, event.map)
                    clickHandlerState = 'DRAWEND'
                    event.map.getInteractions().getArray().pop()
                    event.map.getInteractions().getArray().pop()

                })
            }
            else {}
        }
    }

    const handleDrawend = (evt, map) => {
        const mapSource = map.getLayers().getArray()[1].getSource()

        // check if valid
        let valid = false
        try {
            valid = isValid(olFeature2geoJsonFeature(evt.feature))
        } catch (error) {
            console.log("isvalid error from drawendevent") 
        }
        
        if (!valid)
        {
            // if not valid unkink
            // return geoJsonFeatureCollection
            const unkinkedCollection = unkink(olFeature2geoJsonFeature(evt.feature))
            
            // check intersection and add unkinked polys to the source
            const olFeatures = geoJsonFeatureCollection2olFeatures(unkinkedCollection)
            mapSource.addFeatures(olFeatures)
            cleanUserInput(map)
            return unkinkedCollection.features.length
        }
        else 
        {
            cleanUserInput(map)
            return 1
        }
    }


    useEffect(() => {
        if (map) {
            map.getLayers().getArray()[1].getSource().addEventListener('addfeature', handleNewPoly)
        }
    }, [map])
    

    /* check if we are clicking on a polygon*/
    const isPolygon = (map, pixel) => {
        return map.getFeaturesAtPixel(pixel).length > 0 && map.getFeaturesAtPixel(pixel)[0].getGeometry().getType() === "Polygon"
    }
   
    /* get the polygon we are clicking on */
    const getPolygon = (map, pixel) => {
        let list = map.getFeaturesAtPixel(pixel)
        if (list.length === 0){return -1}
        return list[0]
    }

    /* get the polygon marked by select interaction */
    const getSelectedPolygon = () => {
        let list = select.getFeatures().getArray()
        if (list.length === 0){return -1}
        return list[0]
    }

    const getSource = (map) => {
        return map.getLayers().getArray()[1].getSource()
    }

    /* get the array of features on map */
    const getFeatureList = (map) => {
        return map.getLayers().getArray()[1].getSource().getFeatures()

    }

    return (
        <>
            {/* <Header currentTool={currentTool} setCurrentTool={setCurrentTool}/> */}
            <div style={{ height: '100vh', width: '100%' }} 
            ref={mapElement} 
            className="map-container">    
            </div>
            
        </>
    );
}

export default MapWrapper;