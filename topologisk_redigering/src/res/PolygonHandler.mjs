import { jstsToGeoJson } from "./GeoJsonFunctions.mjs"
import getMergeableFeatures, { handleIntersections, mergeFeatures } from "./jsts.mjs"
import { addIntersectionNodes } from "./jsts.mjs"
import { geoJsonFeatureCollection2JstsGeometries, jstsGeometries2GeoJsonFeatureCollection, jstsGeometry2GeoJsonFeature } from "../translation/translators.mjs"
import { geoJsonFeatureCollection2olFeatures, geoJsonFeature2JstsGeometry} from "../translation/translators.mjs"
import { getJstsGeometryCoordinates } from "../translation/getter.mjs"
import { coordinatesAreEquivalent } from "./HelperFunctions.mjs"


//takes ol list of features as input and trimms last drawn polygon, returns -1 if conflict in fetaures
export const fixOverlaps = (features, modifiedFeatures=1) => {
    let areaOverCircLimit = 10
    let jstsCollection = geoJsonFeatureCollection2JstsGeometries(features)
 
    let preTrimmed = jstsCollection[jstsCollection.length - 1]
    let trimmed = -1
    try {
        trimmed = handleIntersections(jstsCollection[jstsCollection.length - 1], jstsCollection.slice(0, jstsCollection.length - 1))
    } catch (error) {
        console.log(error)
        return -1
    }
    
    let cleanedJstsCollection = []
    //console.log("---1----", jstsCollection.length)
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
        //console.log("---2----", jstsCollection.length)
        
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
    
    //console.log(firstInputPolygon)
    //console.log(secondInputPolygon)
    //console.log(featureCollection)


    //convert to jsts geometries
    let firstPolygon = geoJsonFeature2JstsGeometry(firstInputPolygon)
    let secondPolygon = geoJsonFeature2JstsGeometry(secondInputPolygon)

    //console.log(firstPolygon)
    //console.log(secondPolygon)

    let mergables = getMergeableFeatures(firstPolygon, featureCollection)
    let status = -1
    
    //console.log(mergables)

    mergables.forEach(function compare(mergablePolygon){
        if(coordinatesAreEquivalent(getJstsGeometryCoordinates(secondPolygon), getJstsGeometryCoordinates(mergablePolygon))){
            try {
                status = jstsGeometry2GeoJsonFeature(mergeFeatures(firstPolygon, secondPolygon))
            } catch (error) {
               console.log("merge error on typeconversion") 
            }
        }
    })
    
    return status
    
}
