import React from 'react'
import './CreateCampaigs.css'
import axios from 'axios'
import { Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const CreateCampaign = () => {

    const navigator=useNavigate();

  return (
    <div className='createCampaigns'>  <Button colorScheme='teal' variant='outline' onClick={()=>navigator("createIt")}>
    + Create Campagin
  </Button></div>
  )
}

export default CreateCampaign