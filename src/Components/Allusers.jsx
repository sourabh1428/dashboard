import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@chakra-ui/react'

async function getAllUsers() {
  try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
         'x-api-key': `123`
      }});
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const users = await response.json();
      console.log(users);
      return users;
  } catch (error) {
      console.error("Error fetching users:", error);
  }
}

const Allusers = () => {
    const [data, setData] = useState([]);
    const navigate=useNavigate();


    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await getAllUsers();
          setData(result);
          console.log(result);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
        }
      };
  
      fetchData();
    }, []);
  
    function handleClick(e){
        console.log(e);
        navigate(`/User/${e.ID}`);
    }


    return (
      <div>
        {data.length > 0 ? (
          data.map((e, index) => <h2 onClick={()=>handleClick(e)} key={index}>{e.name}</h2>)
        ) : (
          <Spinner size='xl' />
        )}
      </div>
    );
}

export default Allusers