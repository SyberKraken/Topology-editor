import { test } from 'tape'
import simplepolygon from 'simplepolygon'
//import _, { cloneWith } from 'lodash'
import {fixOverlaps, handleMerge} from '../src/res/PolygonHandler.mjs'
import { fixCoordinateRotation } from '../src/res/HelperFunctions.mjs'
import { assert } from 'chai'
import  { unkink } from '../src/res/unkink.mjs'
import { geoJsonFeature2JstsGeometry, geoJsonFeatureList2geoJsonFeatureCollection, geoJsonFeatureCollection2JstsGeometries } from '../src/translation/translators.mjs'
import { addIntersectionNodes } from '../src/res/jsts.mjs'
import { jstsGeometry2GeoJsonFeature } from '../src/translation/translators.mjs'
import * as translation from '../src/translation/translators.mjs'
import { handleIntersections } from '../src/res/jsts.mjs'





//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*Variables*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const gj = () => {
  return (
    {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {name: "testing"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  15.851554870605469,
                  61.56980478209987
                ],
                [
                  15.802116394042967,
                  61.55353706908234
                ],
                [
                  15.873355865478516,
                  61.54167833832986
                ],
                [
                  15.89567184448242,
                  61.55615355821311
                ],
                [
                  15.881080627441406,
                  61.56988650786631
                ],
                [
                  15.851554870605469,
                  61.56980478209987
                ]
              ]
            ]
          }
        }
      ],
      "crs": {
      "type":"name",
      "properties":{
          "name":"EPSG:3006"
          }
      }   
    }
  )
}


const hourglassBefore = () => {
  return (
    {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "properties": null,
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [0,0],
              [2,0],
              [0,2],
              [2,2],
              [0,0]
            ]
          ]
        }
      }]
    }
  )
}

const overlapPolygons = () => {
  return (
    {
      "type": "FeatureCollection",
      "features": [{
        "type":"Feature",
        "properties": null,
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
               [0, 0],
               [2, 0],
               [2, 1],
               [0, 1],
               [0, 0]
            ]
          ]
        }
      },{
        "type":"Feature",
        "properties": null,
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
               [1, 0],
               [3, 0],
               [3, 1],
               [1, 1],
               [1, 0]
            ]
          ]
        }
      }]
    }
  )
}

const polygon1 = () => {
  return (
    {
      "type":"Feature",
      "properties": null,
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
             [0, 0],
             [1, 1],
             [0, 1],
             [0, 0]
          ]
        ]
      }
    }
  )
}

const polygon1Clockwise = () => {
  return (
    {
      "type":"Feature",
      "properties": null,
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
             [0, 0],
             [0, 1],
             [1, 1],
             [0, 0]
          ]
        ]
      }
    }
  )
}


const polygon2 = () => {
  return (
    {
      "type":"Feature",
      "properties": null,
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
             [0, 0],
             [1, 0],
             [1, 1],
             [0, 0]
          ]
        ]
      }
    }
  )
}

const mergeFeatureCollection = () => {
  return (
    {
      "type": "FeatureCollection",
      "features": [polygon1(),polygon2()]
    }
  )
}

const mergedPolygonExpected = () => {
  return (
    {
      "type":"Feature",
      "properties": null,
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
             [0, 0],
             [1, 0],
             [1, 1],
             [0, 1],
             [0, 0]
          ]
        ]
      }
    }
  )
}


const unkinkedPolygon = unkink(hourglassBefore().features[0])


//[[[0,0], [1,0], [1,1], [0,1], [0,0]], [[1,0], [2,0], [2,1], [1,1], [1,0]], [[2,0], [3,0], [3,1], [2,1], [2,0]]]


const addIntersectionInner = {
  "type":"Feature",
  "properties": null,
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [1, 1],
        [1, 5],
        [3, 7],
        [5, 5],
        [5, 1],
        [1, 1]
      ]
    ]
  }
}

const addIntersectionOuter = {

  "type":"Feature",
  "properties": null,
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [0, 0],
        [0, 6],
        [6, 6],
        [6, 0],
        [0, 0]
      ]
    ]
  }
}


const addIntersectionInnerWanted = {
  "type":"Feature",
  "properties": null,
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [ 2, 6 ], [ 3, 7 ],
        [ 4, 6 ], [ 5, 5 ],
        [ 5, 1 ], [ 1, 1 ],
        [ 1, 5 ], [ 2, 6 ]
      ]
    ]
  }
}

const handleInterSectionOthers = () => {
  return (
    {
      "type": "FeatureCollection",
      "features": [{
        "type":"Feature",
        "properties": null,
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [0, 0],
              [0, 6],
              [6, 6],
              [6, 0],
              [0, 0]
            ]
          ]
        }
      }]
    }
  )
}

const topTriangle = {
  "type":"Feature",
  "properties": null,
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [ 2, 6 ], [ 3, 7 ],
        [ 4, 6 ], [2, 6]
      ]
    ]
  }
}

const topTriangleBig = {
  "type":"Feature",
  "properties": null,
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [ 200, 600 ], [ 300, 700 ],
        [ 400, 600 ], [200, 600]
      ]
    ]
  }
}

const overlappingCollection = () => {
  return (
    {
      "type": "FeatureCollection",
      "features": [
        {
          "type":"Feature",
          "properties": null,
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [ 1000, 1000 ], [ 1000, 1001 ],
                [ 1001, 1001 ], [ 1001, 1000 ],
                [ 1000, 1000 ]
              ]
            ]
          }
        },
        {
        "type":"Feature",
        "properties": null,
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [0, 0],
              [0, 600],
              [600, 600],
              [600, 0],
              [0, 0]
            ]
          ]
        }
      },  {
        "type":"Feature",
        "properties": null,
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [ 200, 600 ], [ 300, 700 ],
              [ 400, 600 ], [ 500, 500 ],
              [ 500, 100 ], [ 100, 100 ],
              [ 100, 500 ], [ 200, 600]
            ]
          ]
        }
      }]
    }
  )
}


const houseBig = {
  "type":"Feature",
  "properties": null,
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [ 200, 600 ], [ 300, 700 ],
        [ 400, 600 ], [ 500, 500 ],
        [ 500, 100 ], [ 100, 100 ],
        [ 100, 500 ], [ 200, 600 ]
      ]
    ]
  }
}

const bigBoxWithExtraNodes = {
  "type":"Feature",
  "properties": null,
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [0, 0],
        [0, 600],
        [200, 600],
        [400, 600],
        [600, 600],
        [600, 0],
        [0, 0]
      ]
    ]
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*Functions*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//indata ol feature, utdata array med koordinat-arrayer
const testGetFeatureCoordinates = (features, f = 0) => {
  return features[f].getGeometry().getCoordinates()[0]
}

//indata GeoJSON, utdata array med koordinat-arrayer
const testGetGeoJsonCoordinate = (geojson, f = 0) => {
  return geojson.features[f].geometry.coordinates[0]
}

const testGetGeoJsonSingleFeatureCoordinate = (geojson) => {
  return geojson.geometry.coordinates[0]
}
 
const coordinatesAreEquivalent = (coordinateArray1, coordinateArray2) => {
  let i = 0;
  while (coordinateArray2[i] && JSON.stringify(coordinateArray1[0]) != JSON.stringify(coordinateArray2[i])) {
    i++;
  }
  if(!coordinateArray2[i]){
    return false
  }
  for(let j = 0; j < coordinateArray1.length; j++, i++){
    if(JSON.stringify(coordinateArray1[j]) != JSON.stringify(coordinateArray2[i % coordinateArray2.length])){
      return false
    }
  }
  return true
}


const testAddIntersectionNodes = (geoJsonInner, geoJsonOuter) =>{

  const inner = geoJsonFeature2JstsGeometry(geoJsonInner)
  const outer= geoJsonFeature2JstsGeometry(geoJsonOuter)
  
  const geoJsonInnerNew = addIntersectionNodes(inner, [outer])
  
  return jstsGeometry2GeoJsonFeature(geoJsonInnerNew)
}

const testHandleIntersection = (jstsNew, jstsOther) => {
  const newGeo = geoJsonFeature2JstsGeometry(jstsNew)
  const oldList = geoJsonFeatureCollection2JstsGeometries(jstsOther)

  const newGeoResult = handleIntersections(newGeo, oldList)

  return jstsGeometry2GeoJsonFeature(newGeoResult)

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*Tests*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*Testing coordinates after unkinked */
test('Should rotate coordinates correctly', function(t) {
  const actualCoordinates = testGetGeoJsonSingleFeatureCoordinate(fixCoordinateRotation(polygon1Clockwise()))
  const expectedCoordinates = testGetGeoJsonSingleFeatureCoordinate(polygon1())
  t.assert(coordinatesAreEquivalent(actualCoordinates, expectedCoordinates))
  t.end()
})

test('Should return matching coordinates',function(t) {
  let unkinked1 = unkinkedPolygon.features[0]
  let unkinked2 = unkinkedPolygon.features[1]

  t.assert(coordinatesAreEquivalent(testGetGeoJsonSingleFeatureCoordinate(unkinked1), [[0,0],[2,0],[1,1],[0,0]]))
  t.assert(coordinatesAreEquivalent(testGetGeoJsonSingleFeatureCoordinate(unkinked2), [[1,1],[2,2],[0,2],[1,1]]))
  t.end()
})

test('Merge two polygons', function(t){
  const mergedPolygonActual = fixCoordinateRotation(handleMerge(polygon1(),polygon2(), mergeFeatureCollection()))
  t.assert(coordinatesAreEquivalent(testGetGeoJsonSingleFeatureCoordinate(mergedPolygonActual), testGetGeoJsonSingleFeatureCoordinate(mergedPolygonExpected())))
  t.end()
})
 

test('addInterSection adds new nodes', function(t){
  const test = testAddIntersectionNodes(addIntersectionInner, addIntersectionOuter)
  t.assert(coordinatesAreEquivalent(test.geometry.coordinates[0], addIntersectionInnerWanted.geometry.coordinates[0]))
  t.end()
})

test('handleInterSection', function(t){
  const test = testHandleIntersection(addIntersectionInner, handleInterSectionOthers())
  t.assert(coordinatesAreEquivalent(test.geometry.coordinates[0], topTriangle.geometry.coordinates[0]))
  //console.log(test)
  t.end()
})


test('fixoverlaps removes overlapping areas AND adds needed nodes on intersection points AND removes features that are too small', function(t){
  const test = fixOverlaps(overlappingCollection())
  console.log(test.features[0].geometry.coordinates[0])
  console.log(bigBoxWithExtraNodes.geometry.coordinates[0])
  t.assert(coordinatesAreEquivalent(test.features[test.features.length-1].geometry.coordinates[0], topTriangleBig.geometry.coordinates[0]))
  t.assert(coordinatesAreEquivalent(test.features[0].geometry.coordinates[0], bigBoxWithExtraNodes.geometry.coordinates[0]))
  t.end()
})