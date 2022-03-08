import { Draw, Snap } from 'ol/interaction'
import React from 'react'




  export const drawPolygon = (map) => {
    if (map) {

      console.log("hellow")
      const snap = new Snap({source: getMapSource(map)})
      const draw = new Draw({
        source: getMapSource(map),
        type: "Polygon",
        geometryName: "Polygon",    //TODO: change to value from tool selection in menu/header.
    })
    
    map.addInteraction(draw)
    map.addInteraction(snap)

    draw.addEventListener('drawend', () => {
      map.removeInteraction(snap)
      map.removeInteraction(draw)
      console.log('bye bye evenlistener')
    })
    
    console.log('bye bye')
  }
} 

const getMapSource = (map) => {
  
  return map.getLayers().getArray()[1].getSource()
}



  