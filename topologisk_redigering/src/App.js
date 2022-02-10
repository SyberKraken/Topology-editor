import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import {Circle, Fill, Stroke, Style} from 'ol/style';
import { Feature } from 'ol';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import MapWrapper from './components/MapWrapper';
import VectorSource from 'ol/source/Vector';


const App = () => {

  const [coordinates, setCoordinates] = useState([]);
  const [features, setFeatures] = useState([]);
  const [testCoordinates, setTestCoordinates] = useState([]);

  const saveGEOJson = (points) => {
    console.log("saving geojson")
  }

  const drawLayer = () => {
    setFeatures(features => [...features, new Feature({geometry: new Point(coordinates[0])})])

    if (features.length >= 4) {
      console.log("saving!")
      const vectorSource = new VectorSource({features})
      const vectorLayer = new VectorLayer({source: vectorSource, style: new Style({image: new Circle({radius: 2})})})
      console.log("såsen är klar")
      
      saveGEOJson(coordinates)
      setCoordinates(coordinates => [])
    }
    console.log("Features:", features)
  }

  const writeCoordinates = (newCoordinates) => {
    
    console.log(newCoordinates)
    setCoordinates(coordinates => [...coordinates,newCoordinates])
  }

  

  useEffect(() => {
    coordinates.length !== 0? drawLayer(coordinates):
    console.log("FEATURES:", features)
  }, [coordinates])

  return <MapWrapper writeCoordinates={writeCoordinates}/>
}

export default App;