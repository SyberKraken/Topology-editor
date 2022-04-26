import { jstsToGeoJson } from "./GeoJsonFunctions.js"
import getMergeableFeatures, { handleIntersections, mergeFeatures } from "./jsts.js"
import OL3Parser from "jsts/org/locationtech/jts/io/OL3Parser.js"
import {  Point, LineString, LinearRing, Polygon, MultiLineString, MultiPolygon } from 'ol/geom.js'
import { Overlay } from "ol"
import OverlayOp from "jsts/org/locationtech/jts/operation/overlay/OverlayOp.js"

import { geoJsonFeatureCollection2JstsGeometries, jstsGeometries2GeoJsonFeatureCollection } from "../translation/translators.mjs"

const featuresToJstsGeometryCollection = (features) => {

    //console.log("FEATURES_TO_JSTS",features)

    const parser = new OL3Parser();
    parser.inject(
        Point,
        LineString,
        LinearRing,
        Polygon,
        MultiLineString,
        MultiPolygon
    );

    let jstsCollection = []
    features.forEach(function temp(feature) {
        let x = parser.read(feature.getGeometry())
        jstsCollection.push(x)
    })

    return jstsCollection
} 

//takes geoJson FeatureCollection as input and trimms last drawn polygon, 
//returns -1 if conflict in features else returns geoJsonFeatureCollection
export const fixOverlaps = (featureCollection) => {

    let jstsCollection = geoJsonFeatureCollection2JstsGeometries(featureCollection)//featuresToJstsGeometryCollection(features)
    
        let preTrimmed = jstsCollection[jstsCollection.length - 1]
        let trimmed = -1
        try {
             trimmed = handleIntersections(jstsCollection[jstsCollection.length - 1], jstsCollection.slice(0, jstsCollection.length - 1))

        } catch (error) {
            console.log(error)
            return -1
        }
       
        let cleanedJstsCollection = []//jstsCollection.slice(0, jstsCollection.length - 1)

        //add intersection nodes to old polygons
        jstsCollection.slice(0, jstsCollection.length - 1).forEach(function f(geom){
            let diff = (addIntersectionNodes(geom, [preTrimmed]))
            cleanedJstsCollection.push(diff)

        })
        try {
            if (trimmed._geometries) {
                trimmed._geometries.forEach(function multiPolygonToPolygons(geom){
                    cleanedJstsCollection.push(geom)
                }) 
            }
    
            //if the polygon has an area (meaning its NOT entirely encapsulated by another polygon), add it.
            else if(trimmed._shell._points._coordinates.length > 0) { 
                cleanedJstsCollection.push(trimmed)
            }
    
           
            return jstsGeometries2GeoJsonFeatureCollection(cleanedJstsCollection)
            
        } catch (error) {
            console.log(error)
            //TODO error gives reading points on trimmed._geometriesz
        }
        return -1
        
    
}

//Takes jsts geometries and ol map and returns geojson geometry
export const handleMerge = (firstPolygon, secondPolygon, map) => {
    let mergables = getMergeableFeatures(firstPolygon, map.getLayers().getArray()[1].getSource().getFeatures())

    let status = -1
    mergables.forEach(function compare(mergablePolygon){
        //console.log(JSON.stringify(secondPolygon))
        //console.log(JSON.stringify(mergablePolygon))
        if(JSON.stringify(secondPolygon) === JSON.stringify(mergablePolygon)){
            try {
                status = jstsToGeoJson([mergeFeatures(firstPolygon, secondPolygon)]).features[0]
            } catch (error) {
               console.log("merge error on typeconversion") 
            }
        }
    })
    //console.log("STATUS: ",status)
    return status
    
}