import { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Updated to use the new Verification flow
            const { data } = await axios.post('http://localhost:5000/api/users/register', {
                name,
                email,
                password,
            });

            setMessage(data.message); // Should say "Please check your email"
            console.log(data);
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || 'Registration Failed'));
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Register</h2>
            {message && <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}
            
            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input 
                        type="email" 
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input 
                        type="password" 
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700 transition duration-200">
                    Register Account
                </button>
            </form>
        </div>
    );
};

export default Register;