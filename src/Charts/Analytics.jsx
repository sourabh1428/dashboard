import React from 'react';
import ChartComponent from './ChartComponent';

const Analytics = () => {
  const eventNames = ["Add to cart", "Product Purchase", "viewedPage"];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
   
    }}>
      {eventNames.map((name, index) => (
        <div key={index} style={{
          width: '33%', 
          height: '30%', 

          backgroundColor: 'red', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          
          boxSizing: 'border-box',
          textAlign: 'center'
        }}>
          <ChartComponent eventName={name} />
        </div>
      ))}
    </div>
  );
};

export default Analytics;
