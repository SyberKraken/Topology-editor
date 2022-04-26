import { jstsToGeoJson } from "./GeoJsonFunctions.mjs"
import getMergeableFeatures, { handleIntersections, mergeFeatures } from "./jsts.mjs"
import OL3Parser from "jsts/org/locationtech/jts/io/OL3Parser.js"
import {  Point, LineString, LinearRing, Polygon, MultiLineString, MultiPolygon } from 'ol/geom.js'
import { Overlay } from "ol"
import OverlayOp from "jsts/org/locationtech/jts/operation/overlay/OverlayOp.js"
import { addIntersectionNodes } from "./jsts.mjs"
import { geoJsonFeatureCollection2JstsGeometries, jstsGeometries2GeoJsonFeatureCollection } from "../translation/translators.mjs"
import { slice } from "lodash"
import { geoJsonFeatureCollection2olFeatures, geoJsonFeature2JstsGeometry} from "../translation/translators.mjs"
//takes ol list of features as input and trimms last drawn polygon, returns -1 if conflict in fetaures
export const fixOverlaps = (features) => {
    let areaOverCircLimit = 10
    let jstsCollection = geoJsonFeatureCollection2JstsGeometries(features)
 
    console.log("---0----", jstsCollection.length)
    
    //TODO: OL3parser => uppdelat i olika översättningar
        let preTrimmed = jstsCollection[jstsCollection.length - 1]
        let trimmed = -1
        try {
             trimmed = handleIntersections(jstsCollection[jstsCollection.length - 1], jstsCollection.slice(0, jstsCollection.length - 1))

        } catch (error) {
            console.log(error)
            return -1
        }
       
        let cleanedJstsCollection = []//jstsCollection.slice(0, jstsCollection.length - 1)
        console.log("---1----", jstsCollection.length)
        //add intersection nodes to old polygons
        jstsCollection.slice(0, jstsCollection.length - 1).forEach(function f(geom){
            let diff = -1
            try {
                diff = (addIntersectionNodes(geom, [preTrimmed]))
            
            } catch (error) {
                //return original polygon
                console.log(error)
                diff = geom
            }
            //removes to small polygons
            if(diff.getArea()/diff.getLength() > areaOverCircLimit){
                cleanedJstsCollection.push(diff)
            }
            

        })
        console.log("---2----", jstsCollection.length)
       
        
        try {
            if (trimmed._geometries) {
                trimmed._geometries.forEach(function multiPolygonToPolygons(geom){
                
                    if(geom.getArea()/geom.getLength() > areaOverCircLimit){
                        cleanedJstsCollection.push(geom)
                    }
                }) 
            }
    
            //if the polygon has an area (meaning its NOT entirely encapsulated by another polygon), add it.
            else if(trimmed._shell._points._coordinates.length > 0) { 

                if(trimmed.getArea()/trimmed.getLength() > areaOverCircLimit){
                    cleanedJstsCollection.push(trimmed)
                }
            }
    
           
            return jstsGeometries2GeoJsonFeatureCollection(cleanedJstsCollection)
            
        } catch (error) {
            console.log(error)
            //TODO error gives reading points on trimmed._geometriesz
        }
        return -1
        
    
}

//Takes geojsonFeatures and a featureCollection and returns geojson geometry
export const handleMerge = (firstInputPolygon, secondInputPolygon, featureCollection) => {

    //convert to ol Feature List
    let olFeatures = geoJsonFeatureCollection2olFeatures(featureCollection)

    //convert to jsts geometries
    let firstPolygon = geoJsonFeature2JstsGeometry(firstInputPolygon)
    let secondPolygon = geoJsonFeature2JstsGeometry(secondInputPolygon)

    let mergables = getMergeableFeatures(firstPolygon, olFeatures)

    let status = -1
    mergables.forEach(function compare(mergablePolygon){
        if(JSON.stringify(secondPolygon) === JSON.stringify(mergablePolygon)){
            try {
                status = jstsToGeoJson([mergeFeatures(firstPolygon, secondPolygon)]).features[0]
            } catch (error) {
               console.log("merge error on typeconversion") 
            }
        }
    })
    
    return status
    
}
