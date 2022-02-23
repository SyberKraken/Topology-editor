import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import MapWrapper from './components/MapWrapper';
import Header from './components/Header';


const App = () => {
  const [selectedTool, setSelectedTool] = useState('')

  const changeSelectedTool = (tool) => {
    setSelectedTool(tool)
    //console.log(selectedTool)
  }

  return (
  <>
    <Header selectTool={changeSelectedTool}/>
    <MapWrapper changeSelectedTool={selectedTool} />
  </>
  )
}

export default App;