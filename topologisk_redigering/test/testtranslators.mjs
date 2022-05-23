import { olFeatures2GeoJsonFeatureCollection, geoJsonFeatureCollection2olFeatures,geoJsonFeature2JstsGeometry,
        jstsGeometry2GeoJsonFeature, jstsGeometries2GeoJsonFeatureCollection, geoJsonFeatureCollection2JstsGeometries,
        geoJsonFeatureCollection2FullGeoJSON, fullGeoJson2GeoJsonFeatureCollection, geoJsonFeatureCollection2GeoJsonFeature} from "../src/translation/translators.mjs";
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
            "properties": {
                "name":"A"
            }

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
            "properties": {
                "name":"B"
            }
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
            "properties": {
                "name":"C"
            }
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
            "properties": {
                "name":"A"
            }
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
    "properties": {
        "name":"A"
    }
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
    "properties": {
        "name":"B"
    }
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
    "properties": {
        "name":"C"
    }    
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
        "properties": {
            "name":"A"
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
    featureCollection().features.forEach(feature => {
        expected.push(feature.geometry.coordinates)
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
    let expected = feature().geometry.coordinates
    t.deepEqual(actual, expected)
    t.end()
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const propertiesFeature = () => {
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
           "properties": {
               "name": "This is a beautiful name"
           }
   
       }
   } 


const propertiesFeatureCollection = () => {
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
            "properties": {
                "name":"Cinderella"
            }

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
            "properties": {
                "name":"this is an ok name"
            }
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
            "properties": {
                "name": "This is an ugly name"
            }
            }]
    }
}

const multiPolygon = () => {
    return {
            "type":"Feature",
            "geometry": {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0],
                    [0, 0]
                ],
                [
                    [1, 0],
                    [1, 1],
                    [2, 1],
                    [2, 0],
                    [1, 0]
                ],
                [
                    [0, 1],
                    [0, 2],
                    [2, 2],
                    [2, 1],
                    [0, 1]
                ]
            ]
            },
            "properties": {
                "name":"This is a MultiPolygon"
            }
        }
    }

test('Check if properties remain the same after jsts <-> geojson conversion', function(t){
    const propertiesExpected = propertiesFeature().properties
    const propertiesActual = jstsGeometry2GeoJsonFeature(geoJsonFeature2JstsGeometry(propertiesFeature())).properties
    t.deepEqual(propertiesActual, propertiesExpected)
    t.end()

})

test('Check if properties remain the same after jsts <-> geojson collection conversion', function(t){
    const propertiesExpected1 = propertiesFeatureCollection().features[0].properties
    const propertiesExpected2 = propertiesFeatureCollection().features[1].properties
    const propertiesExpected3 = propertiesFeatureCollection().features[2].properties
    const afterConversion = jstsGeometries2GeoJsonFeatureCollection(geoJsonFeatureCollection2JstsGeometries(propertiesFeatureCollection()))
    const propertiesActual1 = afterConversion.features[0].properties
    const propertiesActual2 = afterConversion.features[1].properties
    const propertiesActual3 = afterConversion.features[2].properties

    t.deepEqual(propertiesActual1, propertiesExpected1)
    t.deepEqual(propertiesActual2, propertiesExpected2)
    t.deepEqual(propertiesActual3, propertiesExpected3)
    t.end()

})


test('Check if geojson --> jsts conversion with multipolygons work', function(t){
    const propertiesExpected = multiPolygon().properties
    const coordinatesExpected = multiPolygon().geometry.coordinates
    const jsts = geoJsonFeature2JstsGeometry(multiPolygon())
    const geoAfterConversion = jstsGeometry2GeoJsonFeature(jsts)
    const jstsCoordinates = jsts._geometries.coordinates
    const geoAfterCoordinates = geoAfterConversion.geometry.coordinates[0]
    const geoAfterProperties = geoAfterConversion.properties

    t.deepEqual(jstsCoordinates, coordinatesExpected)
    t.deepEqual(geoAfterCoordinates, coordinatesExpected)
    console.log("------------------------------------------")
    t.deepEqual(geoAfterProperties,propertiesExpected)
    t.end()
})


