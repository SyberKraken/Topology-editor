import { Fab } from '@mui/material'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'

import React from 'react'
import PropTypes from 'prop-types'

function QuestionMark() {
  return (
    <Fab color='success' size='small'>
        <QuestionMarkIcon/>
    </Fab>
  )
}


export default QuestionMark
