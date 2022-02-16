import { IconButton, Tooltip } from "@mui/material"


function NavItem(props) {
  const {icon, label, onClick, ...rest} = props
  return (
    <Tooltip title={label}>
      <IconButton onClick={onClick}>{icon}</IconButton>
    </Tooltip>
  )
}



export default NavItem