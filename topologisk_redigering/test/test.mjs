import { jstsToGeoJson, geoJsonToJsts } from '../src/res/GeoJsonFunctions.mjs';
import GeoJSON from 'ol/format/GeoJSON.js';
import assert from 'assert'
import _ from 'lodash'
import { constants } from 'zlib';
import { unkinkPolygon } from '../src/res/unkink.mjs';

const gj = {
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


const hourglassBefore = {
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


const geoToOl = (geo) => {
  const newGeo = new GeoJSON().readFeatures(geo)
  return newGeo

}


//indata ol feature, utdata array med koordinat-arrayer
const testGetFeatureCoordinates = (features, f = 0) => {
  return features[f].getGeometry().getCoordinates()[0]
}

//indata GeoJSON, utdata array med koordinat-arrayer
const testGetGeoJsonCoordinate = (geojson, f = 0) => {
  return geojson.features[f].geometry.coordinates[0]
}
 
const coordinatesAreEquivalent = (coordinateArray1, coordinateArray2) => {
  let i = 0;
  //console.log(`${coordinateArray1}\n${coordinateArray2}`)
  while (coordinateArray2[i] && JSON.stringify(coordinateArray1[0]) != JSON.stringify(coordinateArray2[i])) {
    //console.log(coordinateArray1[0], coordinateArray2[i])
    i++;
  }
  if(!coordinateArray2[i]){
    //console.log("END OF ARRAY")
    return false
  }
  
  for(let j = 0; j < coordinateArray1.length; j++, i++){
    //console.log("WE SHOULD BE HERE")
    if(JSON.stringify(coordinateArray1[j]) != JSON.stringify(coordinateArray2[i % coordinateArray2.length])){
      //console.log(`${coordinateArray1[j]}\n${coordinateArray2[i % coordinateArray2.length]}`)
      return false
    }
  }
  return true
}

const unkinkedPolygon = unkinkPolygon(geoToOl(hourglassBefore)[0])


describe('Compare coordinates', function () {
  it('coordinates should match', function () {
    assert(coordinatesAreEquivalent(testGetFeatureCoordinates(unkinkedPolygon[0]), [[0,0],[2,0],[1,1],[0,0]]), true)
    assert(coordinatesAreEquivalent(testGetFeatureCoordinates(unkinkedPolygon[1]), [[1,1],[0,2],[2,2],[1,1]]), true)
  })
})

describe('GeoJson to OL conversion', function () {
  it('Coordinates in original geojson should be same as coordinates in ol feature', function () {
    assert.equal(_.isEqual(testGetFeatureCoordinates(geoToOl(gj)), testGetGeoJsonCoordinate(gj)), true)
  })
})

describe('GeoJson Conversion', function () {
  it('GeoJson should become a jstsobject', function () {
      assert.equal(_.isEqual(jstsToGeoJson(geoJsonToJsts(gj), [{name: "testing"}]), gj),true)
  })
})

/*
describe('Merge two polygons', function() {
  it('', function () {

  })
}) */

