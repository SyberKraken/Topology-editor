
export const deletePolygon = (map, polygon) => {
    if (map) {
        //console.log(polygon)
        let layers = map.getLayers().getArray()[1].getSource()
        layers.removeFeature(polygon)                      
    } 
  }

const isClockwise = (polygon) => {
  const coordinates = polygon.geometry.coordinates[0]
  let sum = 0 
  for (let i = 0; i + 1 < coordinates.length; i++) {
    sum += (coordinates[i+1][0]-coordinates[i][0])*(coordinates[i+1][1]+coordinates[i][1])
  }

  console.log("SUM:", sum)

  return sum > 0
}

export const fixCoordinateRotation = (polygon) => {
  if (isClockwise(polygon)) {
    let coordinates = polygon.geometry.coordinates[0]
    polygon.geometry.coordinates[0] = coordinates.reverse()
  }
  return polygon
  
}
  
/*   const getFeatureList = (map) => {
    return map.getLayers().getArray()[1].getSource().getFeatures()
  } */