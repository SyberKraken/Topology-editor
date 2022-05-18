import getMergeableFeatures, { handleIntersections, mergeFeatures } from "./JSTSFunctions.mjs"
import { addIntersectionNodes } from "./JSTSFunctions.mjs"
import { geoJsonFeatureCollection2JstsGeometries, jstsGeometries2GeoJsonFeatureCollection, jstsGeometry2GeoJsonFeature } from "../translation/translators.mjs"
import { geoJsonFeature2JstsGeometry} from "../translation/translators.mjs"
import { getJstsGeometryCoordinates } from "../translation/getter.mjs"
import { coordinatesAreEquivalent } from "./HelperFunctions.mjs"
import Area from "jsts/org/locationtech/jts/algorithm/Area.js"

//takes geoJsonFeatureCollection as input and removes areas from the last drawn polygon where it overlaps with other polygons.
export const fixOverlaps = (features) => {
   
    let smallestPolygonAreaLimit = 10      //?NAME?Defines the smallest area a polygon need to have. If smaller it counts as error and is removed
    let jstsGeometries = geoJsonFeatureCollection2JstsGeometries(features)
    let newPolygon = jstsGeometries[jstsGeometries.length - 1]
    let originalPolygons = jstsGeometries.slice(0, jstsGeometries.length - 1)
    let trimmedPolygon = handleIntersections(newPolygon, originalPolygons)
    let cleanedJstsGeometries = []

    //add nodes to a old polygon where it intersects a new polygon
    originalPolygons.forEach(function f(geometry){
        let difference = (addIntersectionNodes(geometry, [newPolygon]))
        //if polygon is to small it is asumed to be an error and therefore removed
        if(difference.getArea()/difference.getLength() > smallestPolygonAreaLimit){
            cleanedJstsGeometries.push(difference)
        }
    })

    //If the polygon contain holes they are iterated and the ones that are small enough to be considered errors are removed
    if (trimmedPolygon._holes) {
        if (trimmedPolygon._holes.length > 0) {
            for (let i = 0; i < trimmedPolygon._holes.length; i++) {
                let hole = trimmedPolygon._holes[i]
                //console.log("HOLE HERE, size is: ", Area.ofRing(hole._points._coordinates))
                if(Area.ofRing(hole._points._coordinates)/hole.getLength() < smallestPolygonAreaLimit) {
                    //console.log("HOLE REMOVED")
                    trimmedPolygon.holes.splice(i, 1)
                }
            }
        }
    }

    //If the trimmed polygon contain several geometries, then it is now a multipolygon and we want to split it into individual polygons
    //If a geometry is smaller than the limit, it is removed.
    if (trimmedPolygon._geometries) {
        trimmedPolygon._geometries.forEach(function multiPolygonToPolygons(geometry){
            if(geometry.getArea()/geometry.getLength() > smallestPolygonAreaLimit){
                cleanedJstsGeometries.push(geometry)
            }
        }) 
    }
    //If the trimmed polygon is already a singel individual polygon, and it has an area (meaning it is NOT entirely encapsulated by another polygon)
    //then it is added to cleanedJstsGeometries
    else if(trimmedPolygon._shell._points._coordinates.length > 0) { 
        if(trimmedPolygon.getArea()/trimmedPolygon.getLength() > smallestPolygonAreaLimit){
            cleanedJstsGeometries.push(trimmedPolygon)
        }
    }
   
    //The cleaned geometry/geometries are returned as a geojson featureCollection
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
