import { Draw, Snap } from 'ol/interaction'
import { Fill, Style } from 'ol/style'

export const drawPolygon = (map, setCurrentTool) => {
  if (map) {

    const snap = new Snap({source: getMapSource(map)})
    const draw = new Draw({
      source: getMapSource(map),
      type: "Polygon",
      geometryName: "Polygon",    //TODO: change to value from tool selection in menu/header.
  })
  
  map.addInteraction(draw)
  map.addInteraction(snap)
  setCurrentTool('DRAW')

  draw.addEventListener('drawend', () => {
    map.removeInteraction(snap)
    map.removeInteraction(draw)
    setCurrentTool('DRAWEND')
  })
  
}
} 

const getMapSource = (map) => {
  return map.getLayers().getArray()[1].getSource()
}

const style = new Style({
  fill: new Fill({
    color: 'rgba(130,20,40,0.3)'
  })
})

export const highlightPolygon = (map, pixel) => {
  
  if(map.getFeaturesAtPixel(pixel)[0].getGeometryName() === "Polygon"){
    console.table(map.getFeaturesAtPixel(pixel)[0])
    map.getFeaturesAtPixel(pixel)[0].setStyle(style)
  }
}
