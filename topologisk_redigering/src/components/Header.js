import AddIcon from '@mui/icons-material/AddCircle'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Container } from '@mui/material'
import { useState } from 'react'
import {handleAddClick, handleDeleteClick, handleEditClick, handleImportClick} from '../res/UIFunctions'
import NavItem from './NavItem'

function Header(props) {

  const [currentTool, setCurrentTool] = useState("Default")


    return <Container maxWidth="sm">
    <nav>
      <NavItem icon={<AddIcon fontSize={currentTool==="Add" ? "large" : "small"} color={currentTool==="Add" ? "success" : ""}/>} label={"Add"} 
               onClick={() => {handleAddClick(); setCurrentTool("Add")}}/>
      <NavItem icon={<DeleteOutlineIcon fontSize={currentTool==="Delete" ? "large" : "small"} color={currentTool==="Delete" ? "success" : ""}/>} label={"Delete"}
               onClick={() => {handleDeleteClick(); setCurrentTool("Delete")}}/>
      <NavItem icon={<ModeEditIcon fontSize={currentTool==="Edit" ? "large" : "small"} color={currentTool==="Edit" ? "success" : ""}/>} label={"Edit"} 
               onClick={() => {handleEditClick(); setCurrentTool("Edit")}}/>
      <NavItem icon={<UploadFileIcon fontSize={currentTool==="Import" ? "large" : "small"} color={currentTool==="Import" ? "success" : ""}/>}
               label={"Import File"} onClick={() => {handleImportClick(); setCurrentTool("Import")}}/>
    </nav>
  </Container>
}

export default Header;
