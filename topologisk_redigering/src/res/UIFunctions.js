import React, { useState } from "react"
import { Alert } from "@mui/material"
import { render } from "@testing-library/react";
import { style } from "@mui/system";
import AddIcon from '@mui/icons-material/AddCircle'
import reactDom from "react-dom";


export function handleAddClick(){
    console.log("add not implemented!");
    reactDom.render(
        <React.Children>
            <body style={{cursor:AddIcon}}></body>
        </React.Children>
    )  
}

export function handleDeleteClick() {
    console.log("delete not implemented!");
}

export function handleEditClick() {
    console.log("Edit not implemented");
}