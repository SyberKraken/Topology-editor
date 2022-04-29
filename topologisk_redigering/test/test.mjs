import { test } from 'tape'
import simplepolygon from 'simplepolygon'
import _ from 'lodash'
import {fixOverlaps, handleMerge} from '../src/res/PolygonHandler.mjs'
import { fixCoordinateRotation } from '../src/res/HelperFunctions.mjs'
import { assert } from 'chai'
import  { unkink } from '../src/res/unkink.mjs'




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
 
