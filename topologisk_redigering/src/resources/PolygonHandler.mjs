import getMergeableFeatures, { handleIntersections, mergeFeatures } from "./JSTSFunctions.mjs"
import { addIntersectionNodes } from "./JSTSFunctions.mjs"
import { geoJsonFeatureCollection2JstsGeometries, jstsGeometries2GeoJsonFeatureCollection, jstsGeometry2GeoJsonFeature } from "../translation/translators.mjs"
import { geoJsonFeature2JstsGeometry} from "../translation/translators.mjs"
import { getJstsGeometryCoordinates } from "../translation/getter.mjs"
import { coordinatesAreEquivalent } from "./HelperFunctions.mjs"
import Area from "jsts/org/locationtech/jts/algorithm/Area.js"

//takes geoJsonFeatureCollection as input and removes the areas where the latest drawn polygon overlap the already existing ones.
export const fixOverlaps = (features) => {
   
    let smallestPolygonAreaLimit = 10      //?NAME?Defines the smallest area a polygon need to have. If smaller it counts as error and is removed
    let jstsGeometries = geoJsonFeatureCollection2JstsGeometries(features)
    let newPolygon = jstsGeometries[jstsGeometries.length - 1] //latest drawn polygon
    let originalPolygons = jstsGeometries.slice(0, jstsGeometries.length - 1)
    let trimmedPolygon = handleIntersections(newPolygon, originalPolygons) //latest polygon without overlapping areas
    let cleanedJstsGeometries = []

    //add nodes to an old polygon where it intersects a new polygon
    originalPolygons.forEach(function f(geometry){
        let difference = (addIntersectionNodes(geometry, [newPolygon]))
        //if a polygon is to small it is asumed to be an error and therefore removed
        if(difference.getArea()/difference.getLength() > smallestPolygonAreaLimit){
            cleanedJstsGeometries.push(difference)
        }
    })

    //check if the trimmed polygon contain any holes
    if (trimmedPolygon._holes) {
        if (trimmedPolygon._holes.length > 0) {
            //iterate all holes and remove those that are smaller than limit
            for (let i = 0; i < trimmedPolygon._holes.length; i++) {
                let hole = trimmedPolygon._holes[i]
                if(Area.ofRing(hole._points._coordinates)/hole.getLength() < smallestPolygonAreaLimit) {
                    trimmedPolygon.holes.splice(i, 1)
                }
            }
        }
    }

    //check if trimmed polygon contain several geometries (meaning it is a MultiPolygon)
    if (trimmedPolygon._geometries) {
        //iterate geometries and add each individual geometry to array (convert multipolygon to multiple individual polygons)
        trimmedPolygon._geometries.forEach(function multiPolygonToPolygons(geometry){
            //remove geometry if area is smaller than limit
            if(geometry.getArea()/geometry.getLength() > smallestPolygonAreaLimit){
                cleanedJstsGeometries.push(geometry)
            }
        }) 
    }
    //trimmed polygon has single geometry. Check if area exist (meaning it is not fully encapsulated by another geometry)
    else if(trimmedPolygon._shell._points._coordinates.length > 0) { 
        //if polygon is smaller than limit it is removed
        if(trimmedPolygon.getArea()/trimmedPolygon.getLength() > smallestPolygonAreaLimit){
            cleanedJstsGeometries.push(trimmedPolygon)
        }
    }
   
    //The cleaned geometry/geometries are converted to a featureCollection and returned
    return jstsGeometries2GeoJsonFeatureCollection(cleanedJstsGeometries)
}


//Takes geojsonFeatures and a featureCollection and returns geojson geometry
export const handleMerge = (firstInputPolygon, secondInputPolygon, featureCollection) => {

    //convert to jsts geometries
    let firstPolygon = geoJsonFeature2JstsGeometry(firstInputPolygon)
    let secondPolygon = geoJsonFeature2JstsGeometry(secondInputPolygon)

    let mergables = getMergeableFeatures(firstPolygon, featureCollection)
    let status = -1
    
    mergables.forEach(function compare(mergablePolygon){
        if(coordinatesAreEquivalent(getJstsGeometryCoordinates(secondPolygon), getJstsGeometryCoordinates(mergablePolygon))){
            try {
                status = jstsGeometry2GeoJsonFeature(mergeFeatures(firstPolygon, secondPolygon))
            } catch (error) {
               console.log("merge error on typeconversion") 
               console.log(error)
            }
        }
    })
    return status
}
