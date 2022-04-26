import OverlayOp from "jsts/org/locationtech/jts/operation/overlay/OverlayOp.js"
import OL3Parser from "jsts/org/locationtech/jts/io/OL3Parser.js";
import { Point, LineString, LinearRing, Polygon, MultiLineString, MultiPolygon } from 'ol/geom.js'
import polygonsAreConnected from "./TopologyValidation.js"
import { geoJsonToJsts, jstsToGeoJson } from './GeoJsonFunctions.js';
import {default as jstsPoint} from "jsts/org/locationtech/jts/geom/Point";
import { CoordinateXY } from "jsts/org/locationtech/jts/geom";
import { GeometryFactory } from "jsts/org/locationtech/jts/geom";
import { LineStringExtracter } from "jsts/org/locationtech/jts/geom/util";
import GeoJSON from 'ol/format/GeoJSON';
import { olToJsts, unkinkPolygon } from "./unkink.js";


export const checkIntersection = (jstsGeometryA, jstsGeometryB) => {
    let jstsGeometryIntersection = jstsGeometryA.intersection(jstsGeometryB)
}

//removes overlapped areas from new geometry
//takes a jsts geometry and a list of all other jsts geometries.
export const handleIntersections = (jstsNewGeometry, jstsOtherGeometries) => {
    
    jstsOtherGeometries.forEach(jstsGeometry => {
        try {
            jstsNewGeometry = OverlayOp.difference(jstsNewGeometry, jstsGeometry) 
        }
        catch(err)
        {
            jstsNewGeometry = jstsToGeoJson([jstsNewGeometry])
            let olpoly = new GeoJSON().readFeatures(jstsNewGeometry)
            olpoly = unkinkPolygon(olpoly[0])
            try {
                jstsNewGeometry = mergeFeatures(olToJsts(olpoly[0][0]), olToJsts(olpoly[1][0]))
            } catch (error) {
                console.log(error)
            }
            
            jstsNewGeometry = OverlayOp.difference(jstsNewGeometry, jstsGeometry)
        }
    });


    //console.log("JSTSNEWGEOM: ", jstsNewGeometry)
    return jstsNewGeometry
}

export const addIntersectionNodes = (jstsNewGeometry, jstsOtherGeometries) => {
    let jstsNewGeometry_original = jstsNewGeometry
    try {
        jstsOtherGeometries.forEach(jstsGeometry => {
            jstsNewGeometry = OverlayOp.difference(jstsNewGeometry, jstsGeometry) 
            let intersection = OverlayOp.intersection(jstsNewGeometry_original, jstsGeometry);
            jstsNewGeometry = OverlayOp.union(jstsNewGeometry, intersection)
        
    })
        
    } catch (error) {
        console.log(error)
        return jstsNewGeometry
    }
   

   
    //console.log("JSTSNEWGEOM: ", jstsNewGeometry)
    return jstsNewGeometry
}

//takes a JSTSpolygon and a list of Openlayers features and returns a JSTS featurelist
export default function getMergeableFeatures(selectedPolygon, allFeatures) { //= map.getLayers().getArray()[1].getSource().getFeatures()) => {

  const parser = new OL3Parser();
  parser.inject(
      Point,
      LineString,
      LinearRing,
      Polygon,
      MultiLineString,
      MultiPolygon
  );

  //removes selected polygon from polygons it will be checked against
  let otherFeatures = allFeatures.filter(function(poly) {
      const curPolygon = parser.read(poly.getGeometry())

      return JSON.stringify(curPolygon) !== JSON.stringify(selectedPolygon)
  })

  //fills results with features adjecent to selectedFeature.
  const result = otherFeatures.filter(function (poly) {
      
      const curPolygon = parser.read(poly.getGeometry())
      //debugger
      const intersection = OverlayOp.intersection(curPolygon, selectedPolygon)
      //console.log("the intersection is: ", intersection)
      //debugger
      return intersection
/*         const curPolygon = parser.read(poly.getGeometry())
      let bufferParameters = new BufferParameters();
      bufferParameters.setEndCapStyle(BufferParameters.CAP_ROUND);
      bufferParameters.setJoinStyle(BufferParameters.JOIN_MITRE);
      let buffered = BufferOp.bufferOp(selectedPolygon,.0001, bufferParameters);
      buffered.setUserData(selectedPolygon.getUserData());
      const intersection = OverlayOp.intersection(selectedPolygon, curPolygon)
      console.log("the intersection is: ", intersection)
      console.log(intersection.isEmpty() === false)
      return intersection.isEmpty() ==getSele= false */

  })

  const resultCleaned = result.filter(function(poly) {
      const curPolygon = parser.read(poly.getGeometry())
      let x = jstsToGeoJson([curPolygon]).features[0]
      //debugger
      return polygonsAreConnected(jstsToGeoJson([curPolygon]).features[0], jstsToGeoJson([selectedPolygon]).features[0])
  })

  //result is an array of OL features, we need jsts geometries
  //converting to jsts geometries 
  let jstsFeatureList = []
 
  for (let index = 0; index < resultCleaned.length; index++) {
      const element = resultCleaned[index];
      jstsFeatureList.push(parser.read(element.getGeometry()))
  }
  

  console.log("finished mergeable with: ", jstsFeatureList)
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
  //let bufferParameters = new BufferParameters();
  //bufferParameters.setEndCapStyle(BufferParameters.CAP_ROUND);
  //bufferParameters.setJoinStyle(BufferParameters.JOIN_MITRE);

  //let unionBuffer = BufferOp.bufferOp(union, -0.1, bufferParameters)
  //debugger
  let firstPointList = firstGeometry._shell._points._coordinates
  let secondPointList = secondGeometry._shell._points._coordinates
 // let lineList = LineStringExtracter.getLines(firstGeometry)
//
 // console.log("before filter things",lineList)
 let factory = new GeometryFactory;
 // //debugger
  firstPointList.forEach(function isColiding(coord){
  let point = factory.createPoint(coord)
 
  secondPointList.forEach(function(coord2){
      //check if same cacngle 
      let point2 =  factory.createPoint(coord2)
      
      if(firstPointList.includes(point2)){return}
      else{
          
          let x = point._coordinates[0]
      }
  })


    //lineList.array.forEach(function coliding2(line){
    //    let intersection = OverlayOp.intersection(point, line);
    //    console.log(intersection)
    //    console.log(line)
    //   if(intersection){
    //        
    //   }
//
    //})
  })

  return union
}
