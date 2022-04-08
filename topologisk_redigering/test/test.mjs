import { jstsToGeoJson, geoJsonToJsts } from '../src/res/GeoJsonFunctions.mjs';
import GeoJSON from 'ol/format/GeoJSON.js';
import assert from 'assert'
import _ from 'lodash'

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

const OLGeo = new GeoJSON().readFeatures(gj)


//indata ol feature, utdata array med koordinat-arrayer
const testGetFeatureCoordinates = (features) => {
  return features[0].getGeometry().getCoordinates()[0]
}

//indata GeoJSON, utdata array med koordinat-arrayer
const testGetGeoJsonCoordinate = (geojson) => {
  return geojson.features[0].geometry.coordinates[0]
}
 
const coordinatesAreEquivalent = (coordinateArray1, coordinateArray2) => {
  let i = 0;
  while (coordinateArray2[i] && coordinateArray1[0] != coordinateArray2[i]) {
    i++;
  }
  if(!coordinateArray2[i]){
    return false
  }
  
  for(j = 0; j < 3; j++, i++){
    if(coordinateArray1[j] != coordinateArray2[i % coordinateArray2.length]){
      return false
    }/*  else {
      i++
    } */
  }
  return true
}


//describe('')

describe('GeoJson to OL conversion', function () {
  it('Coordinates in original geojson should be same as coordinates in ol feature', function () {
    assert.equal(_.isEqual(testGetFeatureCoordinates(OLGeo), testGetGeoJsonCoordinate(gj)), true)
  })
})

describe('GeoJson Conversion', function () {
  it('GeoJson should become a jstsobject', function () {
     // _.isEqual(jstsToGeoJson(geoJsonToJsts(gj)), gj).should.equal(true)
      assert.equal(_.isEqual(jstsToGeoJson(geoJsonToJsts(gj), [{name: "testing"}]), gj),true)
  })
})

/*
describe('Merge two polygons', function() {
  it('', function () {

  })
}) */

