import pkg_unkink from '../src/res/unkink.js'
const { unkinkPolygon } = pkg_unkink

import pkg_geojsonfunctions from '../src/res/GeoJsonFunctions.js'
const { jstsToGeoJson, geoJsonToJsts } = pkg_geojsonfunctions

import GeoJSON from 'ol/format/GeoJSON.js'
import assert from 'assert'
import _ from 'lodash'

import pkg_fixOverlaps from '../src/res/PolygonHandler.js'
const {fixOverlaps} = pkg_fixOverlaps