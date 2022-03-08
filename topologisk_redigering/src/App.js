import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import MapWrapper from './components/MapWrapper';
import Header from './components/Header';
import GeoJSON from 'ol/format/GeoJSON';

const App = () => {
  const [geoJsonData, setGeoJsonData] = useState(new GeoJSON())

  const changeGeoJsonData = (data) => {
      setGeoJsonData(data)
    }

  useEffect (() => {
      console.log(JSON.stringify(geoJsonData))
  }, [geoJsonData])

  return (
  <>
    <MapWrapper  changeGeoJsonData={changeGeoJsonData} geoJsonData={geoJsonData}/>
  </>
  )
}

export default App;