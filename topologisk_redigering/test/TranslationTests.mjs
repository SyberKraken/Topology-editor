import GeoJSON from "ol/format/GeoJSON.js";
import assert from "assert";

const GeoJSON_ = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
            "name":"test"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                15.303955078125,
                59.812375447205625
              ],
              [
                15.159759521484375,
                59.74532608213611
              ],
              [
                15.368499755859375,
                59.6954703349364
              ],
              [
                15.4522705078125,
                59.78439698789725
              ],
              [
                15.46669006347656,
                59.857574901121204
              ],
              [
                15.288848876953125,
                59.874121178813404
              ],
              [
                15.303955078125,
                59.812375447205625
              ]
            ]
          ]
        }
      }
    ]
  }

const readGeoJSONtoOL = (new GeoJSON()).readFeatures(GeoJSON_)
const writeGeoJSONfromOL = (new GeoJSON()).writeFeatures(readGeoJSONtoOL)

/* describe('Keep Properties after conversion', function () {
    it('JSON should contain same properties that ')
}) */

//console.log(readGeoJSONtoOL[0].getProperties())
//console.log(writeGeoJSONfromOL)