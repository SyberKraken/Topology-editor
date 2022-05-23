import getMergeableFeatures, { handleIntersections, mergeFeatures } from "./JSTSFunctions.mjs"
import { addIntersectionNodes } from "./JSTSFunctions.mjs"
import { geoJsonFeatureCollection2JstsGeometries, jstsGeometries2GeoJsonFeatureCollection, jstsGeometry2GeoJsonFeature } from "../translation/translators.mjs"
import { geoJsonFeature2JstsGeometry} from "../translation/translators.mjs"
import Area from "jsts/org/locationtech/jts/algorithm/Area.js"

/* 
*   Remove areas from the last drawn feature where it overlaps with other features
*   @param  {GeoJson FeatureCollection} features    all features 
*   @return {GeoJson FeatureCollection}             all features where overlapping areas have been removed
*/
export const fixOverlaps = (features) => {
    let areaOverCircLimit = 10
    let jstsCollection = geoJsonFeatureCollection2JstsGeometries(features)
    let preTrimmedNewPolygon = jstsCollection[jstsCollection.length - 1]
    let trimmed = handleIntersections(jstsCollection[jstsCollection.length - 1], jstsCollection.slice(0, jstsCollection.length - 1))
    let cleanedJstsCollection = []

    //add intersection nodes to old polygons
    jstsCollection.slice(0, jstsCollection.length - 1).forEach(function f(geom){
        let diff = (addIntersectionNodes(geom, [preTrimmedNewPolygon]))
        //removes too small polygons
        if(diff.getArea()/diff.getLength() > areaOverCircLimit){
            cleanedJstsCollection.push(diff)
        }
    })

    //if the polygon has holes, remove holes that are too small
    if (trimmed._holes) {
        if (trimmed._holes.length > 0) {  
            for (let i = 0; i < trimmed._holes.length; i++) {
                let hole = trimmed._holes[i]

                if(Area.ofRing(hole._points._coordinates)/hole.getLength() < areaOverCircLimit) {
                    trimmed.holes.splice(i, 1)
                }
            }
        }
    }
    
    if (trimmed._geometries) {
        console.log("this is a multipolygon! we love multipolygons, so we add it.")
        cleanedJstsCollection.push(trimmed)
    }

    //if the polygon has an area (meaning its NOT entirely encapsulated by another polygon), add it.
    else if(trimmed._shell._points._coordinates.length > 0) { 
        if(trimmed.getArea()/trimmed.getLength() > areaOverCircLimit){
            cleanedJstsCollection.push(trimmed)
        }
    }

    return jstsGeometries2GeoJsonFeatureCollection(cleanedJstsCollection)
}

/* 
*   Merges two polygons
*   @param  {GeoJson Feature}   firstInputPolygon   
*   @param  {GeoJson Feature}   secondInputPolygon
*/
export const handleMerge = (firstInputPolygon, secondInputPolygon, featureCollection) => {
   
    let firstPolygon = geoJsonFeature2JstsGeometry(firstInputPolygon)
    let secondPolygon = geoJsonFeature2JstsGeometry(secondInputPolygon)

    let mergables = getMergeableFeatures(firstPolygon, featureCollection)
    let status = -1
    
    status = jstsGeometry2GeoJsonFeature(mergeFeatures(firstPolygon, secondPolygon))
    return status
}
