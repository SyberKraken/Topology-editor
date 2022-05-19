import { handleIntersections, mergeFeatures } from "./JSTSFunctions.mjs"
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

    let featureMinimumAreaLimit = 10
    let jstsCollection = geoJsonFeatureCollection2JstsGeometries(features)
    let latestDrawnFeature = jstsCollection[jstsCollection.length - 1]
    let trimmed = handleIntersections(jstsCollection[jstsCollection.length - 1], jstsCollection.slice(0, jstsCollection.length - 1))
    let cleanedJstsCollection = []
    
    //nodes are added where the latest drawn feature intersects already existing features and returns an array with the finished geometries
    cleanedJstsCollection = addNodesAtIntersection(jstsCollection, latestDrawnFeature, featureMinimumAreaLimit)
    
    //Fixes overlap of singular polygon over multipolygon
    if (trimmed._geometries) {
        console.log("this is a multipolygon! we love multipolygons, so we add it.")
        cleanedJstsCollection.push(trimmed)
    }
    //if the polygon has holes, remove holes that are too small
    else if (trimmed._holes) {
        if (trimmed._holes.length > 0) {  
            for (let i = 0; i < trimmed._holes.length; i++) {
                let hole = trimmed._holes[i]
                if(Area.ofRing(hole._points._coordinates)/hole.getLength() < featureMinimumAreaLimit) {
                    trimmed.holes.splice(i, 1)
                }
            }
        }
    }

    //if the polygon has an area (meaning its NOT entirely encapsulated by another polygon), add it.
    if(trimmed._shell._points._coordinates.length > 0) { 
        if(trimmed.getArea()/trimmed.getLength() > featureMinimumAreaLimit){
            cleanedJstsCollection.push(trimmed)
        }
    }

    return jstsGeometries2GeoJsonFeatureCollection(cleanedJstsCollection)
}

/* 
*   Add nodes where newly drawn feature intersect already existing features
*   @param  {JSTS geometryCollection}   geometries          A list of jsts geometries   
*   @param  {JSTS geometry}             preTrimmedPolygon   The geometry of the latest drawn feature
*   @param  {Number}                    areaOverCircLimit   the smallest area a feature is allowed to have
*   @return {Array}                                         an Array containting geometries where nodes have been added to intersections
*/
const addNodesAtIntersection = (geometries, preTrimmedPolygon, areaOverCircLimit) => {
    let storageArray = []
    geometries.slice(0, geometries.length - 1).forEach(function f(geometry){
        let difference = (addIntersectionNodes(geometry, [preTrimmedPolygon]))
        //removes too small polygons
        if(difference.getArea()/difference.getLength() > areaOverCircLimit){
            storageArray.push(difference)
        }
    })

    return storageArray
}


/* 
*   Merges two polygons
*   @param  {GeoJson Feature}   firstInputPolygon   
*   @param  {GeoJson Feature}   secondInputPolygon
*/
export const handleMerge = (firstInputPolygon, secondInputPolygon) => {
    
    //convert to jsts geometries
    let firstPolygon = geoJsonFeature2JstsGeometry(firstInputPolygon)
    let secondPolygon = geoJsonFeature2JstsGeometry(secondInputPolygon)

    let status = -1
    
    //TODO: if sats för multipolygoner eller något

    status = jstsGeometry2GeoJsonFeature(mergeFeatures(firstPolygon, secondPolygon))
    return status
}
