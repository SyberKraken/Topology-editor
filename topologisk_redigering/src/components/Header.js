import AddIcon from '@mui/icons-material/AddCircle'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Container } from '@mui/material'
import { useState } from 'react'
import NavItem from './NavItem'
import SelectType from './SelectType';

function Header({ selectTool }) {

  const [currentTool, setCurrentTool] = useState("")
  selectTool(currentTool)

  function setStatus(tool) {
    if (tool === currentTool){
      setCurrentTool("None")
    }else {
      setCurrentTool(tool)
    }
  }

    return (
    <>
      <nav>
        <NavItem icon={<AddIcon fontSize={currentTool==="Add" ? "large" : "small"} color={currentTool==="Add" ? "success" : ""}/>} label={"Add"} 
                onClick={() => {setStatus("Add")}}/>
        <NavItem icon={<DeleteOutlineIcon fontSize={currentTool==="Delete" ? "large" : "small"} color={currentTool==="Delete" ? "success" : ""}/>} label={"Delete"}
                onClick={() => {setStatus("Delete")}}/>
        <NavItem icon={<ModeEditIcon fontSize={currentTool==="Edit" ? "large" : "small"} color={currentTool==="Edit" ? "success" : ""}/>} label={"Edit"} 
                onClick={() => {setStatus("Edit")}}/>
        <NavItem icon={<UploadFileIcon fontSize={currentTool==="Import" ? "large" : "small"} color={currentTool==="Import" ? "success" : ""}/>}
                label={"Import File"} onClick={() => {setStatus("Import")}}/>
      </nav>
    </>)
}

export default Header;
