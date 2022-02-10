import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import MapWrapper from './components/MapWrapper';
import Header from './components/Header';


const App = () => {
  return (
  <>
    <Header />
    <MapWrapper/>
  </>
  )
}

export default App;