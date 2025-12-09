import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  // This fetches data from the backend when the page loads
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        // We assume backend is running on port 5000
        const { data } = await axios.get('http://localhost:5000'); 
        setMessage(data);
      } catch (error) {
        console.error("Error connecting to backend:", error);
        setMessage("Backend is offline 🔴");
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="p-10 bg-white rounded-xl shadow-xl text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">TrustyHire 🤝</h1>
        <p className="text-lg text-gray-700">System Status:</p>
        
        {/* This displays the message from the backend */}
        <p className={`mt-2 font-mono font-bold ${message.includes('running') ? 'text-green-500' : 'text-red-500'}`}>
          {message || "Loading..."}
        </p>
      </div>
    </div>
  );
}

export default App;