import { olFeatures2GeoJsonFeatureCollection, geoJsonFeatureCollection2olFeatures,geoJsonFeature2JstsGeometry,
    jstsGeometry2GeoJsonFeature, jstsGeometries2GeoJsonFeatureCollection, geoJsonFeatureCollection2JstsGeometries,
    geoJsonFeatureCollection2FullGeoJSON, 
    fullGeoJson2GeoJsonFeatureCollection} from "../src/translation/Translators.mjs";
import test from 'tape'
import GeoJSON from "ol/format/GeoJSON.js";

const featureCollection = () => {
    return {
"type": "FeatureCollection",
"features": [{
"type":"Feature",
"geometry": {
"type": "Polygon",
"coordinates": [
    [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
    ]
]
},
"properties": null

},{
"type":"Feature",
"geometry": {
"type": "Polygon",
"coordinates": [
    [
        [1, 0],
        [1, 1],
        [2, 1],
        [2, 0],
        [1, 0]
    ]
]
},
"properties": null
},{
"type":"Feature",
"geometry": {
    "type": "Polygon",
    "coordinates": [
    [
        [0, 1],
        [0, 2],
        [2, 2],
        [2, 1],
        [0, 1]
    ]
    ]
},
"properties": null
}]
}}

const fullGeoJson = () => {
    return {
    "type": "FeatureCollection",
    "features": [{
    "type":"Feature",
    "geometry": {
    "type": "Polygon",
    "coordinates": [
        [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0]
        ]
    ]
    },
    "properties": null
    
    },{
    "type":"Feature",
    "geometry": {
    "type": "Polygon",
    "coordinates": [
        [
            [1, 0],
            [1, 1],
            [2, 1],
            [2, 0],
            [1, 0]
        ]
    ]
    },
    "properties": null
    },{
    "type":"Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [
        [
            [0, 1],
            [0, 2],
            [2, 2],
            [2, 1],
            [0, 1]
        ]
        ]
    },
    "properties": null
    }],
    "crs": {
        "type": "name",
        "properties": {
            "name": "EPSG:3006"
            }
        }
    }}

const feature = () => {
 return {
    "type":"Feature",
    "properties": null,
    "geometry": {
    "type": "Polygon",
    "coordinates": [
    [
        [0, 1],
        [0, 2],
        [2, 2],
        [2, 1],
        [0, 1]
    ]
    ]
    }
    }
} 

const olFeatureList = new GeoJSON().readFeatures(featureCollection())




test('Convert a full geoJson to a featureCollection', function(t){
    let actual = fullGeoJson2GeoJsonFeatureCollection(fullGeoJson())
    let expected = featureCollection()
    t.deepEqual(actual, expected)
    t.end()
})

test('Convert a featureCollection to a full geoJson', function(t){
    let actual = geoJsonFeatureCollection2FullGeoJSON(featureCollection())
    let expected = fullGeoJson()
    t.deepEqual(actual, expected)
    t.end()
})

test('Convert a list of OL features to a FeatureCollection', function(t) {
    let actual = olFeatures2GeoJsonFeatureCollection(olFeatureList)
    let expected = featureCollection()
    t.deepEqual(actual, expected )
    t.end()
})

