import AddIcon from '@mui/icons-material/AddCircle'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Container } from '@mui/material'
import { useState } from 'react'
import NavItem from './NavItem'

function Header({ selectTool }) {

  const [currentTool, setCurrentTool] = useState("Default")
  selectTool(currentTool)

    return <Container maxWidth="sm">
    <nav>
      <NavItem icon={<AddIcon fontSize={currentTool==="Add" ? "large" : "small"} color={currentTool==="Add" ? "success" : ""}/>} label={"Add"} 
               onClick={() => {setCurrentTool("Add")}}/>
      <NavItem icon={<DeleteOutlineIcon fontSize={currentTool==="Delete" ? "large" : "small"} color={currentTool==="Delete" ? "success" : ""}/>} label={"Delete"}
               onClick={() => {setCurrentTool("Delete")}}/>
      <NavItem icon={<ModeEditIcon fontSize={currentTool==="Edit" ? "large" : "small"} color={currentTool==="Edit" ? "success" : ""}/>} label={"Edit"} 
               onClick={() => {setCurrentTool("Edit")}}/>
      <NavItem icon={<UploadFileIcon fontSize={currentTool==="Import" ? "large" : "small"} color={currentTool==="Import" ? "success" : ""}/>}
               label={"Import File"} onClick={() => {setCurrentTool("Import")}}/>
    </nav>
  </Container>
}

export default Header;
