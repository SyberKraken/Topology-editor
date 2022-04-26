import { olFeatures2GeoJsonFeatureCollection, geoJsonFeatureCollection2olFeatures,geoJsonFeature2JstsGeometry,
    jstsGeometry2GeoJsonFeature, jstsGeometries2GeoJsonFeatureCollection, geoJsonFeatureCollection2JstsGeometries,
    geoJsonFeatureCollection2FullGeoJSON, 
    fullGeoJson2GeoJsonFeatureCollection,
    geoJsonFeatureCollection2GeoJsonFeature} from "../src/translation/translators.mjs";
import test from 'tape'
import GeoJSON from "ol/format/GeoJSON.js";
import { getFeatureCoordinates, getOlFeatureCoordinates } from "../src/translation/getter.mjs";
import { geoJsonFeature2geoJsonFeatureCollection } from "../src/translation/translators.mjs";
import { olFeature2geoJsonFeature } from "../src/translation/translators.mjs";
import { geoJsonFeature2olFeature } from "../src/translation/translators.mjs";

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
    }
}

const featureCollectionSingleFeature = () => {
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
            }]
        }
}

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

test('Get a feature from a featureCollection', function(t){
    let actual = geoJsonFeatureCollection2GeoJsonFeature(featureCollection(), 0)
    let expected = feature()
    t.deepEqual(actual, expected)
    t.end()
})

test('Convert single feature to a FeatureCollection', function(t){
    let actual = geoJsonFeature2geoJsonFeatureCollection(feature())
    let expected = featureCollectionSingleFeature()
    t.deepEqual(actual, expected)
    t.end()
})
//TODO test for feature -> featureCollection, must implement function

test('Convert geoJson FeatureCollection to an array of jsts geometries', function(t){
    let actual = geoJsonFeatureCollection2JstsGeometries(featureCollection())
    let actual_coordinates = []
    jstsGeometries2GeoJsonFeatureCollection(actual).features.forEach(feature => {
        actual_coordinates.push(getFeatureCoordinates(feature))
    })
    let expected_coordinates = []
    featureCollection().features.forEach(feature => {
        expected_coordinates.push(getFeatureCoordinates(feature))
    })
    t.deepEqual(actual_coordinates, expected_coordinates)
    t.end()

})

test('Convert jsts geometry to a geoJson feature', function(t){
    let actual_coordinates = getFeatureCoordinates(jstsGeometry2GeoJsonFeature(geoJsonFeature2JstsGeometry(feature())))
    let expected_coordinates = getFeatureCoordinates(feature())
    t.deepEqual(actual_coordinates, expected_coordinates)
    t.end()
})


test('Convert a list of OL features to a FeatureCollection', function(t) {
    let actual = olFeatures2GeoJsonFeatureCollection(olFeatureList)
    let expected = featureCollection()
    t.deepEqual(actual, expected )
    t.end()
})

test('Convert a FeatureCollection to a list of OL features', function(t){
    let actual = [] 
    geoJsonFeatureCollection2olFeatures(featureCollection()).forEach(feature => {
        actual.push(getOlFeatureCoordinates(feature))
    })
    let expected = []
    olFeatureList.forEach(feature => {
        expected.push(getOlFeatureCoordinates(feature))
    })
    t.deepEqual(actual, expected)
    t.end()
}) 

test('Convert olFeature to geoJson feature', function(t){
    let actual = olFeature2geoJsonFeature(olFeatureList[0])
    let expected = feature()
    t.deepEqual(actual, expected)
    t.end()
})

test('Convert geoJsonFeature to olFeature', function(t){
    let actual = getOlFeatureCoordinates(geoJsonFeature2olFeature(feature()))
    let expected = getOlFeatureCoordinates(olFeatureList[0])
    t.deepEqual(actual, expected)
    t.end()
})


