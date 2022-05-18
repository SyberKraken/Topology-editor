import OverlayOp from "jsts/org/locationtech/jts/operation/overlay/OverlayOp.js"
import polygonsAreConnected from "./TopologyValidation.mjs"
import { GeometryFactory } from "jsts/org/locationtech/jts/geom.js";
import { geoJsonFeature2JstsGeometry, jstsGeometry2GeoJsonFeature } from "../translation/translators.mjs";
import IsValidOp from "jsts/org/locationtech/jts/operation/valid/IsValidOp.js";

//removes overlapped areas from new geometry
//takes a jsts geometry and a list of all other jsts geometries.
export const handleIntersections = (jstsNewGeometry, jstsOriginalGeometries) => {
    //Checks if the received geometry is valid
    if (IsValidOp.isValid(jstsNewGeometry)) {
        jstsOriginalGeometries.forEach(jstsGeometry => {
            //iterate original geometries and if they are valid compare with the newly added one
            if (IsValidOp.isValid(jstsGeometry)) {
                //The overlapping areas of the newly added geometry and the original one is removed and the new geometry consist of the difference
                jstsNewGeometry = OverlayOp.difference(jstsNewGeometry, jstsGeometry)
            } else {
                console.log("That was not a valid JSTS Geometry! \n", jstsGeometry)
            }   
    });
    return jstsNewGeometry
}}


//Takes a jstsGeometry and adds nodes to where it overlaps other already existing geometries
export const addIntersectionNodes = (newJstsGeometry, originalJstsGeometries) => {
    let newJstsGeometry_original = newJstsGeometry
    try {
        //iterate the original geometries and get the difference between them and the new geometry as well as where they intersect
        originalJstsGeometries.forEach(jstsGeometry => {   
            let difference = OverlayOp.difference(newJstsGeometry, jstsGeometry) 
            let intersection = OverlayOp.intersection(newJstsGeometry_original, jstsGeometry);
            
            //handle both if intersection is geometrycollection and just a geometry
            try {
                //if intersection is a single geometry, do union on intersection and difference
                newJstsGeometry = OverlayOp.union(difference, intersection)
                //TODO not sure what's happening here...
            } catch (error) {
                console.log("detta error är 'under kontroll:'")
                console.log(error)
                intersection._geometries.forEach(intersectionGeom => {
                    difference = OverlayOp.union(difference, intersectionGeom)
                });
            }
        })
        
    } catch (error) {
        console.log(error)
        return newJstsGeometry_original
    }
    return newJstsGeometry
}

//takes a JSTSpolygon and a geoJsonFeatureCollection and returns a JSTS geomlist
export default function getMergeableFeatures(selectedPolygon, allFeatures) { 

  //removes selected polygon from polygons it will be checked against
  let otherFeatures = allFeatures.features.filter(function(feature) {
    const curPolygon = geoJsonFeature2JstsGeometry(feature)
    return JSON.stringify(curPolygon) !== JSON.stringify(selectedPolygon)
  })

  //fills results with features adjecent to selectedFeature.
  const result = otherFeatures.filter(function (feature) {
    const curPolygon = geoJsonFeature2JstsGeometry(feature)
    const intersection = OverlayOp.intersection(curPolygon, selectedPolygon)
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
 
    let firstPointList = firstGeometry._shell._points._coordinates
    let secondPointList = secondGeometry._shell._points._coordinates

    let factory = new GeometryFactory();
    firstPointList.forEach(function isColiding(coord){
    let point = factory.createPoint(coord)
    
    secondPointList.forEach(function(coord2){
        //check if same cacngle 
        let point2 =  factory.createPoint(coord2)
        if(firstPointList.includes(point2)){return}
        else{let x = point._coordinates[0]}
        })
    })

  return union
}