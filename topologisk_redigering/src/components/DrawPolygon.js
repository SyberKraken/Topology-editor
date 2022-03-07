import { Draw, Snap } from 'ol/interaction'


export const drawPolygon = (map) => {
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
  });

  
} 

const getMapSource = (x) => {
  return x.getLayers().getArray()[1].getSource()
}