import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';

// Register components
ChartJS.register(
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);
const ChartComponent = ({ eventName }) => {
  const [eventData, setEventData] = useState([]);

  
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/getEvents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': '123', // Ensure this key is correct
          },
          body: JSON.stringify({ eName: eventName }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setEventData(data.data);
        console.log('Data fetched successfully:', data.data);
      } catch (error) {
        console.error('There has been a problem with your request:', error);
      }
    };

    fetchEventData();
}, [eventName]);

  // Render your component

  // Process data
  const processData = () => {
    const dateCount = eventData.reduce((acc, event) => {
      const date = new Date(event.EventTime * 1000).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(dateCount).map(([date, count]) => ({
      date,
      count,
    }));

    return data;
  };

  const chartData = processData();

  const data = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        label: 'Number of Events',
        data: chartData.map(item => item.count),
        fill: true,
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        pointBorderColor: '#4A90E2',
        pointBackgroundColor: '#fff',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(tooltipItem) {
            return `Count: ${tooltipItem.raw}`;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          }
        },
        grid: {
          color: '#eee',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Users',
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          }
        },
        grid: {
          color: '#eee',
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>{eventName}</h1>
      <Line data={data} options={options} />
    </div>
  );
}

export default ChartComponent;