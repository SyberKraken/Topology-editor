import { IconButton } from "@mui/material"


function NavItem({icon, label}) {
  return (
    <IconButton aria-label={label}>{icon}</IconButton>
  )
}

export default NavItem