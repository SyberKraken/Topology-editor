import { Draw, Snap } from 'ol/interaction'
import React from 'react'



 function DrawPolygon(props) {


  const drawing = () => { 
    new Draw({
    source: props.source,
    type:"Polygon",
  })}
   
  return (
    <button onClick={drawing}>
      Draw Polygon
    </button>
  )
}

export default DrawPolygon 