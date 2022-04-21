import { olFeatures2GeoJsonFeatureCollection, geoJsonFeatureCollection2olFeatures,geoJsonFeature2JstsGeometry,
    jstsGeometry2GeoJsonFeature, jstsGeometries2GeoJsonFeatureCollection, geoJsonFeatureCollection2JstsGeometries,
    geoJsonFeatureCollection2FullGeoJSON, 
    fullGeoJson2GeoJsonFeatureCollection,
    geoJsonFeatureCollection2GeoJsonFeature} from "../src/translation/Translators.mjs";
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

const geometryArray = () => {
    return 
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

//TODO test for feature -> featureCollection, must implement function

test('Convert geoJson FeatureCollection to an array of jsts geometries', function(t){
    let actual = geoJsonFeatureCollection2JstsGeometries(featureCollection())
    //console.log(actual[0])
    /* Polygon {
  _shell: LinearRing {
    _points: CoordinateArraySequence {
      _dimension: 3,
      _measures: 0,
      _coordinates: [Array]
    },
    _envelope: null,
    _userData: null,
    _factory: GeometryFactory {
      _precisionModel: [PrecisionModel],
      _coordinateSequenceFactory: CoordinateArraySequenceFactory {},
      _SRID: 0
    _precisionModel: PrecisionModel { _modelType: [Type], _scale: null },
    _coordinateSequenceFactory: CoordinateArraySequenceFactory {},
    _SRID: 0
  },
  _SRID: 0
} */
    t.end()

})

test('Convert jsts geometry to a geoJson feature', function(t){
    //TODO figure out how to deal with geometries
    t.end()
})


test('Convert a list of OL features to a FeatureCollection', function(t) {
    let actual = olFeatures2GeoJsonFeatureCollection(olFeatureList)
    let expected = featureCollection()
    t.deepEqual(actual, expected )
    t.end()
})

test('Convert a FeatureCollection to a list of OL features', function(t){
    let actual = geoJsonFeatureCollection2olFeatures(featureCollection())
    let expected = olFeatureList
    t.looseEqual(actual, expected)
    t.end()
})


