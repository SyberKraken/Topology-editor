import { jstsToGeoJson } from "./GeoJsonFunctions.js"
import getMergeableFeatures, { handleIntersections, mergeFeatures } from "./jsts.js"
import OL3Parser from "jsts/org/locationtech/jts/io/OL3Parser.js"
import {  Point, LineString, LinearRing, Polygon, MultiLineString, MultiPolygon } from 'ol/geom.js'
import { Overlay } from "ol"
import OverlayOp from "jsts/org/locationtech/jts/operation/overlay/OverlayOp.js"
import { addIntersectionNodes } from "./jsts.js"
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

//takes ol list of features as input and trimms last drawn polygon, returns -1 if conflict in fetaures
export const fixOverlaps = (features) => {
    let areaOverCircLimit = 10
    let jstsCollection = featuresToJstsGeometryCollection(features)

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

        //add intersection nodes to old polygons
        jstsCollection.slice(0, jstsCollection.length - 1).forEach(function f(geom){
            let diff = -1
            try {
                console.log(geom)
                diff = (addIntersectionNodes(geom, [preTrimmed]))
            
            } catch (error) {
                diff = geom
            }
            if(diff.getArea()/diff.getLength() > areaOverCircLimit){
                cleanedJstsCollection.push(diff)
            }
            

        })
       
        
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
    
           
            return jstsToGeoJson(cleanedJstsCollection)
            
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