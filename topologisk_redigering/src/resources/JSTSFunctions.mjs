import OverlayOp from "jsts/org/locationtech/jts/operation/overlay/OverlayOp.js"
import IsValidOp from "jsts/org/locationtech/jts/operation/valid/IsValidOp.js";
import { geoJsonFeature2JstsGeometry, jstsGeometry2GeoJsonFeature } from "../translation/translators.mjs";
import { coordinatesAreEquivalent } from "./HelperFunctions.mjs";

/*
*
* Removes overlapped areas from a jsts geometry
*
* @param {jsts geometry} jstsNewGeometry - the jsts geometry whose overlapping areas will be removed from
* @param {jsts geometrie collection} jstsOriginalGeometries - all other jsts geometries
*
* @return {jsts geometry} jstsNewGeometry - geometry with overlapping areas removed
*
*/
export const handleIntersections = (jstsNewGeometry, jstsOriginalGeometries) => {
    //Checks if the received geometry is valid
    if (IsValidOp.isValid(jstsNewGeometry)) {
        jstsOriginalGeometries.forEach(jstsGeometry => {
            //Iterate original geometries and if they are valid compare them with the newly added one
            if (IsValidOp.isValid(jstsGeometry)) {
                //The overlapping areas of the newly added geometry and the original one is removed and the new geometry consists of the difference
                jstsNewGeometry = OverlayOp.difference(jstsNewGeometry, jstsGeometry)
            } else {
                console.log("This is not a valid geometry and can not be used for comparing overlap\n", jstsGeometry)
            }   
    });
    return jstsNewGeometry
}}

/*
*
* Adds nodes to a jsts geometry where it touches other jsts geometries
*
* @param {jsts geometry} jstsNewGeometry - the most recent jsts geometry
* @param {jsts geometry} jstsOriginalGeometries - all other jsts geometries
*
* @return {jsts geometry} jstsNewGeometry - jsts geometry with new nodes
*
*/
export const addIntersectionNodes = (jstsNewGeoemtry, jstsOriginalGeometries) => {
    let jstsNewGeoemtry_original = jstsNewGeoemtry
    try {
        //iterate the original geometries and get the difference between them and the new geometry as well as where they intersect
        jstsOriginalGeometries.forEach(jstsGeometry => {   
            let difference = OverlayOp.difference(jstsNewGeoemtry, jstsGeometry) 
            let intersection = OverlayOp.intersection(jstsNewGeoemtry_original, jstsGeometry); //OverlayOp.intersection may return either a geometryCollection or a single geometry
            
            //handle both if intersection is geometrycollection and just a geometry
            try {
                //if intersection is a single geometry, do union on intersection and difference (creating nodes at intersection)
                jstsNewGeoemtry = OverlayOp.union(difference, intersection)
            } catch (error) {
                //console.log("can't find union with GeometryCollection. It's ok if this error happens!")
                //console.log(error)
            }
        })
    //if something goes wrong, returns the original jsts geometry without new nodes.     
    } catch (error) {
        console.log(error)
        return jstsNewGeoemtry_original
    }
    return jstsNewGeoemtry
}


/*
*
* merges two geometries into one
*
* @param {jsts geometry} firstGeometry
* @param {jsts geometry} secondGeometry
*
* @return {jsts featurecollection} union
*
*/
export function mergeFeatures(firstGeometry, secondGeometry){
    let union = -1;

    try {
        union = OverlayOp.union(firstGeometry, secondGeometry)
    } catch (error) {
        console.log("error! union could not be found for: ", firstGeometry, " and ", secondGeometry)
        console.log("Error message: ", error)
        return -1
    }

  return union
}