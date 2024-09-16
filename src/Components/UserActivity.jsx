// src/UserActivity.js
import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';
import './UserActivity.css';
import { Spinner } from '@chakra-ui/react'
import axios from 'axios'
async function getUserEvents(MMID) {
  try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/userEvents?MMID=${MMID}`, {
          headers: {
              'x-api-key': `123`
          }});
      console.log(response.data);
      return response.data;
  } catch (error) {
      console.log(error);
  }
}
const UserActivity = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function run() {
      try {
        const d = await getUserEvents(id);
        setData(d);
        console.log(d + " data refreshed");
      } catch (e) {
        setError("NO USER FOUND");
        console.error(e.message);
      }
    }
    run();
  }, [id]);
// src/helpers.js
 const epochToGMT = (epochTime) => {
    const date = new Date(epochTime * 1000); // Convert epoch to milliseconds
    return date.toUTCString(); // Convert to GMT (UTC) string
  };
  
  return (
    <div className="user-activity-container">
      {error && <h1 className="error-message">{error}</h1>}
      <ul className="event-list">
        {data && data.length > 0 && data.map((e, index) => (
          <li key={index}>
            <span className="event-name">{e.eventName}</span>
            <span className="event-time">{epochToGMT(e.eventTime)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserActivity;
