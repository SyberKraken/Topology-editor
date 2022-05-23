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
import { ModifyEvent } from 'ol/interaction/Modify';


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

    /** 
     * 
     * Remove all features from source and then readd them.
     * Used by? seems unecessary
     *
     * @param {source} source Map source
     * @param {FeatureList} features features to be added to the map source
     * 
     */ 
    const updateSource = (source, features) => {
        console.log(features)
        if(features.length > 0){
            source.clear()
            source.addFeatures(features) 
        }else{
            console.log("You are trying to update the map with an empty list of features!")
        }

    }

    //Loads geoJson data from server via url
    const source = new VectorSource({
        wrapX: false,
        loader: function(){
            let url = "http://localhost:4000/file1"
            fetch(url).then(res => res.json()).then(result => {
            result.features.forEach(feature => {
                source.addFeature(geoJsonFeature2olFeature(feature))
            })
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
    
  /**
    * Removes parts of the most recently added polygon on the map that overlap with 
    * existing polygons. On the intersection points, the new polygon has nodes added.
    * @param  {featureList} oldFeatureList open layers feature list
    * @return {featureList} same feature list as above execpt now the last polygon has overlapped edges removed
    * 
    */
    const cleanUserInput = (oldFeatureList) => {
        let featureList = []
        if(oldFeatureList.length > 1)
        {
            let newPolygons = fixOverlaps(olFeatures2GeoJsonFeatureCollection(oldFeatureList))
            featureList = geoJsonFeatureCollection2olFeatures(newPolygons) 
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

  /**
    * The user select a polygon and there was another polygon selected, merge these polygons.
    * If the user clicks the same polygon twice, delete that polygon
    * @param  {Map} Map
    * 
    */
    const selectHandler = (map) => {
        if(previousClickedPolygon != null){
            previousClickedPolygon.setStyle(defaultStyle)
            if(currentClickedPolygon !== -1){
                //merge if this click occurs directly after a click on another polygon
                if(currentClickedPolygon !== previousClickedPolygon){
                    if (mergeState >= 2) {
                        merge(map)
                        currentClickedPolygon = null
                        previousClickedPolygon = null
                        mergeState = 0
                    }
                }
                //delete if this click is on the same polygon as the last click.
                if (currentClickedPolygon === previousClickedPolygon) {
                    deletePolygon(map, currentClickedPolygon)
                    currentClickedPolygon = null
                    previousClickedPolygon = null
                }
            }
        }
        previousClickedPolygon = currentClickedPolygon
    }


  /**
    * Contextual clickhandler, different actions depending on if you click on a polygon or somewhere on the map.
    * If the users clicks on a polygon it will take care of selection. Setting the style and trying to merge
    * if there was a previously selected polygon.
    * 
    * If the user click on the map, clickHandlerState turn the drawing and and off.
    * @param  {Event} Event
    * 
    */
    const onMapClickGetPixel = (event) => {
        //Check if clicked on an existing polygon 
        if (isFeatureAtPixelAPolygon(event.map, event.pixel)){
            currentClickedPolygon = getMapFeatureAtPixel(event.map, event.pixel) 
            mergeState += 1
            currentClickedPolygon.setStyle(selectedStyle)
            selectHandler(event.map);
        } 
        else {
            mergeState = 0
            if(clickHandlerState === 'DRAWEND') {
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
            // this is very bad, all features are removed and re-added on each click
            updateSource(getMapSource(event.map), cleanUserInput(getMapFeatures(event.map)))
        }
    }



    /**
    * Merges the two most recently clicked polygons when called.
    * @param  {Map} map Openlayers map
    */
    const merge = (map) => {
        const featureList = olFeatures2GeoJsonFeatureCollection(getMapFeatures(map))
        let newPoly = handleMerge(olFeature2geoJsonFeature(currentClickedPolygon), 
                                  olFeature2geoJsonFeature(previousClickedPolygon),featureList)
    
        if(newPoly !== -1){
            let OlPoly = (new GeoJSON()).readFeature(newPoly)
            deletePolygon(map, currentClickedPolygon)
            deletePolygon(map, previousClickedPolygon)
            getMapSource(map).addFeature(OlPoly)   
        }else{
            console.log("didnt find the poly in the list")
        }
    }

  /**
    * Called after a polygon has finished drawing, checks if the new polygon is invalid
    * if it's invalid unkink it and add the new polgons to source. The old polygon however
    * is still in the source. It's removed in handleNewFeature.
    * @param  {Feature} newFeature 
    * @param {Source} source
    * 
    */
    const handleDrawend = (newFeature, source) => {

        let cleanedFeatures
        
        if (!isValid(newFeature))
        {
            //if not valid unkink: return geoJsonFeatureCollection
            const unkinkedCollection = unkink(olFeature2geoJsonFeature(newFeature))
            
            //check intersection and add unkinked polys to the source
            const olFeatures = geoJsonFeatureCollection2olFeatures(unkinkedCollection)
            source.addFeatures(olFeatures)
            cleanedFeatures = cleanUserInput(source.getFeatures())
            updateSource(source, cleanedFeatures)
        }
    }


  /**
    * Called when a node has just begun being modifyed. If the node was connected to two polygons it will 
    * merge them and save them in a global value, originalPoly for later use by handleModifyend. 
    * @param  {ModifyEvent} event
    * 
    */
    const handleModifyStart = (event) => {
        let features = event.features.getArray()
        if(features.length  > 1)
        {
            let beforeMod1 = olFeature2geoJsonFeature(features[features.length - 1])
            let beforeMod2 = olFeature2geoJsonFeature(features[features.length  - 2])

            originalPoly = turf.union(beforeMod1, beforeMod2)
        }
    }


  /**
    * Called after a node has been modifiyed. Removes all features that are connected to the
    * node that was moved from the source. Goes through the features again and checks if any are invalid
    * invalid could mean two things the user moved the polygon inside and kinked it or the user moved the 
    * node outside the outerring. We currently handle only the second case.
    * After that is fixed go though the features connected to the moved node again and add them to the map
    * and fix possible overlaps.
    *  
    * @param  {ModifyEvent} event
    * 
    */
    const handleModifyend = (event) => {
        let features = event.features.getArray()
        let source2 = getMapSource(event.target.map_)

        features.forEach((latestFeature) => {
            source2.removeFeature(latestFeature)
        })

        for (let i = 0; i<features.length; i++) {
            // node is moved outside the linestring
            if(!isValid(olFeature2geoJsonFeature(features[i])))
            {
                let newPoly = features[i - 1]

                let intersection = turf.intersect(olFeature2geoJsonFeature(newPoly), originalPoly);

                let difference = turf.difference(originalPoly, intersection);
                
                features[i-1] = geoJsonFeature2olFeature(difference)
                features[i] = geoJsonFeature2olFeature(intersection)
            }
        }

        for (let i = 0; i<features.length; i++) {
            source2.addFeature(features[i])
            cleanUserInput(getMapFeatures(event.target.map_))
        }
        // hack because overlaps are only fixed after moving a node without this.
        updateSource(getMapSource(event.target.map_), cleanUserInput(getMapFeatures(event.target.map_)))

    }


    const handleNewFeature = (event) => {
        if (!isValid(olFeature2geoJsonFeature(event.feature))) {
            removeFeatureFromMap(event.feature)
        }
    }
    

    /* This will run each time the map changes in some way.
       Used to make sure no invalid polygons are added to the map. */
    useEffect(() => {
        if (map) {
            getMapSource(map).addEventListener('addfeature', handleNewFeature)
        }
    }, [map])
    
    const removeFeatureFromMap = (feature) => {
        getMapSource(map).removeFeature(feature)
    }

    /* check if we are clicking on a polygon*/
    const isFeatureAtPixelAPolygon = (map, pixel) => {
        if(map.getFeaturesAtPixel(pixel).length > 0){
            return (map.getFeaturesAtPixel(pixel)[0].getGeometry().getType() === "Polygon" 
                 || map.getFeaturesAtPixel(pixel)[0].getGeometry().getType() === "MultiPolygon")
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