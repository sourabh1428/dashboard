// Example Loader component
const Loader = () => (
    <div className="loader">
      <style jsx>{`
        .loader {
          border: 8px solid rgba(255, 255, 255, 0.1);
          border-left-color: #4a90e2; /* Change this color as needed */
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
  
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
  
export {Loader};