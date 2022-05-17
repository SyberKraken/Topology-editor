import OverlayOp from "jsts/org/locationtech/jts/operation/overlay/OverlayOp.js"
import polygonsAreConnected from "./TopologyValidation.mjs"
import { GeometryFactory } from "jsts/org/locationtech/jts/geom.js";
import { geoJsonFeature2JstsGeometry, jstsGeometry2GeoJsonFeature } from "../translation/translators.mjs";
import { coordinatesAreEquivalent } from "./HelperFunctions.mjs";


export const checkIntersection = (jstsGeometryA, jstsGeometryB) => {
    let jstsGeometryIntersection = jstsGeometryA.intersection(jstsGeometryB)
}

//removes overlapped areas from new geometry
//takes a jsts geometry and a list of all other jsts geometries.
export const handleIntersections = (jstsNewGeometry, jstsOtherGeometries) => {
    
    jstsOtherGeometries.forEach(jstsGeometry => {
            jstsNewGeometry = OverlayOp.difference(jstsNewGeometry, jstsGeometry) 
            console.log(jstsGeometry)
            console.log("Difference: ", jstsNewGeometry)
    });
    //console.log("JSTSNEWGEOM: ", jstsNewGeometry)
    return jstsNewGeometry
}

export const addIntersectionNodes = (jstsNewGeometry, jstsOtherGeometries) => {
    let jstsNewGeometry_original = jstsNewGeometry
    try {
        jstsOtherGeometries.forEach(jstsGeometry => {   
            let jstsNewGeometryTemp = OverlayOp.difference(jstsNewGeometry, jstsGeometry) 
            let intersection = OverlayOp.intersection(jstsNewGeometry_original, jstsGeometry);
            //console.log("INTERSECTION: ", intersection)
            //console.log("JSTSNEWGEOMETRYTEMP", jstsNewGeometryTemp)
            
            //handle both if intersection is geometrycollection and just a geometry
            try {
                jstsNewGeometry = OverlayOp.union(jstsNewGeometryTemp, intersection)
          
            } catch (error) {
                console.log("detta error är 'under kontroll:'")
                console.log(error)
                intersection._geometries.forEach(intersectionGeom => {
                    jstsNewGeometryTemp = OverlayOp.union(jstsNewGeometryTemp, intersectionGeom)
                });
            }


           // console.log("-----------jstsNewGeometryTemp",jstsNewGeometryTemp)
            //console.log("-----------intersection",intersection)
                //NOTE mbe check both multi
            //jstsNewGeometry = OverlayOp.union(jstsNewGeometryTemp, intersection)

        })
        
    } catch (error) {
        console.log(error)
        return jstsNewGeometry_original
    }
   

   
    //console.log("JSTSNEWGEOM: ", jstsNewGeometry)
    return jstsNewGeometry
}

//takes a JSTSpolygon and a geoJsonFeatureCollection and returns a JSTS geomlist
//TODO: return only mergeable features. the function does not work as expected as it currently returns ALL features.
export default function getMergeableFeatures(selectedPolygon, allFeatures) { 

   


  //removes selected polygon from polygons it will be checked against
  let otherFeatures = allFeatures.features.filter(function(feature) {
    const curPolygon = geoJsonFeature2JstsGeometry(feature)
    return !coordinatesAreEquivalent(curPolygon, selectedPolygon)
    //return JSON.stringify(curPolygon) !== JSON.stringify(selectedPolygon)
  })



  //fills results with features adjecent to selectedFeature.
  const result = otherFeatures.filter(function (feature) {
    const curPolygon = geoJsonFeature2JstsGeometry(feature)
    const intersection = OverlayOp.intersection(curPolygon, selectedPolygon)
    console.log("is this true or false:", intersection)
   // console.log(intersection)
    return intersection
    
  })

  const resultCleaned = result.filter(function(poly) {
      const curPolygon = geoJsonFeature2JstsGeometry(poly)
      return polygonsAreConnected(jstsGeometry2GeoJsonFeature(curPolygon), jstsGeometry2GeoJsonFeature(selectedPolygon))
  })

  //converting to jsts geometries 
  
  const jstsFeatureList = []
  for (let index = 0; index < resultCleaned.length; index++) {
      const element = resultCleaned[index];
      jstsFeatureList.push(geoJsonFeature2JstsGeometry(element))
  } 

  return jstsFeatureList;
}


//takes jsts geometries and return the union in jstsgeometry format
export function mergeFeatures(firstGeometry, secondGeometry){

    let union = -1;
    try {
        union = OverlayOp.union(firstGeometry, secondGeometry)
    } catch (error) {
        console.log("--------error in union--------")
        console.log(error)
        console.log(firstGeometry)
        console.log(secondGeometry)
    }
    
    if (union === -1){
        return -1
    }
 


  return union
}
