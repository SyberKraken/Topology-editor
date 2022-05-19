import React, { useState, useEffect, useRef } from 'react';
import { Feature, Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS from 'ol/source/WMTS';
import { get as getProjection } from 'ol/proj';
import { getWidth } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import { saveToDatabase } from '../resources/DatabaseFunctions.mjs';
import { drawPolygon } from '../resources/UIFunctions.mjs';
import { createStringXY } from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition'
import { defaults as defaultControls } from 'ol/control'
import { fixOverlaps, handleMerge } from '../resources/PolygonHandler.mjs';
import { Modify } from 'ol/interaction';
import {deletePolygon} from '../resources/HelperFunctions.mjs'
import {defaultStyle, selectedStyle } from '../resources/Styles.mjs'
import { isValid, unkink }  from '../resources/unkink.mjs'
import { geoJsonFeature2olFeature, geoJsonFeatureCollection2olFeatures, olFeature2geoJsonFeature, olFeatures2GeoJsonFeatureCollection } from '../translation/translators.mjs';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import { Button } from '@mui/material';
import { Polygon, MultiPolygon } from 'ol/geom';
import { DoubleClickZoom } from 'ol/interaction';
import * as turf from "@turf/turf"


/*
MapWrapper contains the on screen map and runs functionality according to user interaction.
The user draws polygons by placing their nodes on the map with left click. 
Polygons are removed when double clicked.
Polygon borders can be modified by dragging an edge or node.
Polygons can be merged by clicking on two polygons in succession, if they are adjececent by more than a single coordinate.
*/

function MapWrapper() {
    //Common data used for most operations
    const [map, setMap] = useState();
    let mergeState = 0
    let originalPoly = ""
    let clickHandlerState = 'NONE';
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;
    let currentClickedPolygon = null
    let previousClickedPolygon = null

    //data used for later creating a tilegrid, which stops the map from trying to render data outside of the map's borders.
    const projection = getProjection('EPSG:3857');
    const projectionExtent = projection.getExtent();
    const size = getWidth(projectionExtent) / 256;
    const resolutions = new Array(19);
    const matrixIds = new Array(19);
    for (let z = 0; z < 19; ++z) {
        //generate resolutions and matrixIds arrays for this WMTS
        resolutions[z] =size / Math.pow(2, z);
        matrixIds[z] = z;
    } 

// -------------------------------------------Create map-------------------------------------------------
    
    const attributions = "Click screen to draw, double click polygon to remove and to merge click two adjacent polygons"
    
    //Tilegrid
    const OUTER_SWEDEN_EXTENT = [-1200000, 4700000, 2600000, 8500000];
    const wmts_3006_resolutions = [4096.0, 2048.0, 1024.0, 512.0, 256.0, 128.0, 64.0, 32.0, 16.0, 8.0];
    const wmts_3006_matrixIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];   

    const tilegrid = new WMTSTileGrid({
        tileSize: 256,
        extent: OUTER_SWEDEN_EXTENT,
        resolutions: wmts_3006_resolutions,
        matrixIds: wmts_3006_matrixIds
    });

    //Loads map of sweden from Lantmäteriest, with the created tilegrid.
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

    const splittingMultipolygons = (Data) => {
        let splitMulti = []

        Data.features.forEach(feature => {
            if (feature.geometry.coordinates.length > 1){
                feature.geometry.coordinates.forEach(coordinateArr => {
                    splitMulti.push(new Feature(new Polygon(coordinateArr)))
                })
            }
            else{
                splitMulti.push(new Feature(new Polygon(feature.geometry.coordinates[0])))
            }
        })

        return splitMulti
    }

    const updateSource = (source, features) => {
        console.log(features)
        if(features.length > 0){
            source.clear()
            source.addFeatures(features) 
        }else{
            console.log("You are trying to update the map with an empty list of features!")
        }

    }


    const cleanInputData = (inputData, source) => {
        //TODO: remove this function and splittingMultiPolygons or explain how it can be used to changed to split multipolygon when this is wanted behavior ^^ vv
        const polygons = splittingMultipolygons(inputData)
        polygons.forEach( polygon => {
            source.addFeature(polygon) //handleDrawEnd assumes the new polygon already exists in the source.
            handleDrawend( polygon, source )
            //handleModifyend() ? 
        })

    }

    //Loads geoJson data from server via url
    const source = new VectorSource({
        wrapX: false,
        loader: function(){
            let url = "http://localhost:4000/file1"
            fetch(url).then(res => res.json()).then(result => {
            result.features.forEach(feature => {
                
                source.addFeature(geoJsonFeature2olFeature(feature))
                
                /* if (feature.geometry.coordinates.length > 1){
                    let splitMulti = []
                    feature.geometry.coordinates.forEach(coordinateArr => {
                        splitMulti.push(new Feature(new Polygon(coordinateArr)))
                    })
                    source.addFeatures(splitMulti)
                }
                else{
                    source.addFeature(new Feature(new Polygon(feature.geometry.coordinates[0])))
                } */
            })
    
            //cleanInputData(result, source)   
        })
    }

});

//------------------------------ Map Actions ---------------------------------------

    const polygonLayer = new VectorLayer({
        source: source,
        style: defaultStyle
    });

    const modify = new Modify({
        source: source, 
        hitDetection: true
    })
    
    /*  
    Removes parts of the most recently added polygon on the map that overlap with 
        existing polygons. on the intersection points, the new polygon has nodes added.
    */
    const cleanUserInput = (oldFeatureList, modifiedFeatures=1) => {
        let featureList = []
        if(oldFeatureList.length > 1)
        {
            //console.log("features before fixoverlaps:")
            //console.log(getMapFeatures(map))
            //console.log(olFeatures2GeoJsonFeatureCollection(getMapFeatures(map)))
            let newPolygons = fixOverlaps(olFeatures2GeoJsonFeatureCollection(oldFeatureList), modifiedFeatures)
            //TODO: mcProblem happens here, we think. V V V
            console.log("features after fixoverlaps")
            console.log(newPolygons)
            featureList = geoJsonFeatureCollection2olFeatures(newPolygons) 
                
            //TODO: check flatcoordinates for the multipolygon in the console log below.
           
        }
        return featureList
    }

    const mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(2),
        projection: "EPSG:3006",
    })

    /* sets initial values and interactions for the Openlayers Map.*/
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
        initialMap.on('click', onMapClickGetPixel) // can I get closest pixel from here?
        initialMap.addInteraction(modify)
        modify.on('modifyend', handleModifyend)
        modify.on('modifystart', handleModifyStart)

        // remove DoubleClickZoom interaction from the map
        initialMap.getInteractions().getArray().forEach(function(interaction) {
            if (interaction instanceof DoubleClickZoom) {
                initialMap.removeInteraction(interaction);
                console.log(DoubleClickZoom.name)
            }
        }
        )

        setMap(initialMap)
    }, []);


     
    //Contextual clickhandler, different actions depending on if you click on a polygon or somewhere on the map 
    const onMapClickGetPixel = (event) => {
        //Check if clicked on an existing polygon 
        if (isFeatureAtPixelAPolygon(event.map, event.pixel)){
            currentClickedPolygon = getMapFeatureAtPixel(event.map, event.pixel) 
            mergeState += 1
            currentClickedPolygon.setStyle(selectedStyle)
            if(previousClickedPolygon != null){
                previousClickedPolygon.setStyle(defaultStyle)
                if(currentClickedPolygon !== -1){
                    //merge if this click occurs directly after a click on another polygon
                    if(currentClickedPolygon !== previousClickedPolygon){
                        if (mergeState >= 2) {
                            merge(event.map)
                            currentClickedPolygon = null
                            previousClickedPolygon = null
                            mergeState = 0
                        }
                    }
                    //delete if this click is on the same polygon as the last click.
                    if (currentClickedPolygon === previousClickedPolygon) {
                        deletePolygon(event.map, currentClickedPolygon)
                        currentClickedPolygon = null
                        previousClickedPolygon = null
                    }
                }
            }
            previousClickedPolygon = currentClickedPolygon
        } 
        else {
            mergeState = 0
            if(clickHandlerState === 'DRAWEND') {
                //TODO: MAYBE unkink the drawn polygon HERE
                //let cleaned = cleanUserInput(getFeatureList(event.map))
                //updateSource(getSource(event.map), cleaned)
                clickHandlerState = 'NONE'
            }
            else if(clickHandlerState === 'NONE'){
                clickHandlerState = 'DRAW'
                drawPolygon(event.map).addEventListener('drawend', (evt) => {
                    handleDrawend(evt.feature, getMapSource(event.map))
                    clickHandlerState = 'DRAWEND'
                    event.map.getInteractions().getArray().pop()
                    event.map.getInteractions().getArray().pop()
                }) 
                
            }
            updateSource(getMapSource(event.map), cleanUserInput(getMapFeatures(event.map)))
        }
    }
    //merges the two most recently clicked polygons when called
    const merge = (map) => {
        const featureList = olFeatures2GeoJsonFeatureCollection(getMapFeatures(map))
        let newPoly = handleMerge(olFeature2geoJsonFeature(currentClickedPolygon), olFeature2geoJsonFeature(previousClickedPolygon),featureList)
    
        if(newPoly !== -1){
            let OlPoly = (new GeoJSON()).readFeature(newPoly)
            deletePolygon(map, currentClickedPolygon)
            deletePolygon(map, previousClickedPolygon)
            getMapSource(map).addFeature(OlPoly)   
        }else{
            console.log("didnt find the poly in the list")
        }
    }

    //interprets newly drawn polygon and modifies it to not break topology rules.
    const handleDrawend = (newFeature, source) => {
        
        // check if valid
        let valid = false
        try {
            valid = isValid(olFeature2geoJsonFeature(newFeature))
        } catch (error) {
            console.log("isvalid error from drawendevent") 
        }

        let cleanedFeatures
        
        if (!valid)
        {
            //if not valid unkink: return geoJsonFeatureCollection
            const unkinkedCollection = unkink(olFeature2geoJsonFeature(newFeature))
            
            //check intersection and add unkinked polys to the source
            const olFeatures = geoJsonFeatureCollection2olFeatures(unkinkedCollection)
            source.addFeatures(olFeatures)
            cleanedFeatures = cleanUserInput(source.getFeatures())
            updateSource(source, cleanedFeatures)

            return unkinkedCollection.features.length
        }
        else 
        {
            //cleanedFeatures = cleanUserInput(source.getFeatures())
            //updateSource(source, cleanedFeatures)

            return 1
        }


    }


    const handleModifyStart = (event) => {
        let features = event.features.getArray()
        if(features.length  > 1)
        {
            let beforeMod1 = olFeature2geoJsonFeature(features[features.length - 1])
            let beforeMod2 = olFeature2geoJsonFeature(features[features.length  - 2])

            originalPoly = turf.union(beforeMod1, beforeMod2)
        }
    }

    const handleModifyend = (event) => {
        let features = event.features.getArray()
        let source2 = getMapSource(event.target.map_)

        features.forEach((latestFeature) => {
            source2.removeFeature(latestFeature)
        })

        for (let i = 0; i<features.length; i++) {
            if(!isValid(olFeature2geoJsonFeature(features[i])))
            {
                features[i] = originalPoly
                let newPoly = features[i - 1]
                features.splice(i-1)
                features.splice(i)

                let intersection = turf.intersect(olFeature2geoJsonFeature(newPoly), originalPoly);

                let difference = turf.difference(originalPoly, intersection);
                
                source2.addFeature(geoJsonFeature2olFeature(difference))
                source2.addFeature(geoJsonFeature2olFeature(intersection))
            }
        }

        for (let i = 0; i<features.length; i++) {
            console.log(features[i])
            source2.addFeature(features[i])
            cleanUserInput(event.target.map_)
        }
        updateSource(getMapSource(event.target.map_), cleanUserInput(getMapFeatures(event.target.map_)))

    }


    const removeFromMapIfInvalid = (event) => {
        if (!isValid(olFeature2geoJsonFeature(event.feature))) {
            removeFeatureFromMap(event.feature)
        }
    }
    

    /* This will run each time the map changes in some way.
       Used to make sure no invalid polygons are added to the map. */
    useEffect(() => {
        if (map) {
            getMapSource(map).addEventListener('addfeature', removeFromMapIfInvalid)
        }
    }, [map])
    
    const removeFeatureFromMap = (feature) => {
        getMapSource(map).removeFeature(feature)
    }

    /* check if we are clicking on a polygon*/
    const isFeatureAtPixelAPolygon = (map, pixel) => {
        if(map.getFeaturesAtPixel(pixel).length > 0){
            return (map.getFeaturesAtPixel(pixel)[0].getGeometry().getType() === "Polygon" || map.getFeaturesAtPixel(pixel)[0].getGeometry().getType() === "MultiPolygon")
        }
        return false 
    }

    /* get the polygon we are clicking on */
    const getMapFeatureAtPixel = (map, pixel) => {
        let list = map.getFeaturesAtPixel(pixel)
        if (list.length === 0){return -1}
        return list[0]
    }

    /* get mapsource */
    const getMapSource = (map) => {
        return map.getLayers().getArray()[1].getSource()
    }

    /* get the array of features on map */
    const getMapFeatures = (map) => {
        return map.getLayers().getArray()[1].getSource().getFeatures()
    }

    const saveFeatureCollection = () => {
        saveToDatabase(olFeatures2GeoJsonFeatureCollection(getMapFeatures(map)))
    }


    return (
        <>
            <div style={{ height: '95vh', width: '100%' }}
            ref={mapElement}
            className="map-container">    
                <nav> 
                    <Button value="Import File" color="success" size='large'><UploadFileIcon/></Button>
                    <Button value="Save" color="success" size='large' onClick={saveFeatureCollection}><SaveIcon/></Button>
                </nav>
            </div>
        </>
    );
}

export default MapWrapper;