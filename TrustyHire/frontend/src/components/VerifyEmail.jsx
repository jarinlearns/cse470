import { useEffect, useState, useRef } from 'react'; // 1. Import useRef
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('Verifying...');
    const hasRun = useRef(false); // 2. Create a flag to track execution

    useEffect(() => {
        // 3. Check if we already ran this function
        if (hasRun.current) return; 
        hasRun.current = true; // Mark as run immediately

        const verifyAccount = async () => {
            try {
                await axios.post('http://localhost:5000/api/users/verify', { token });
                setStatus('✅ Email Verified Successfully!');
            } catch (error) {
                // Optional: If the error says "Invalid token", it might mean it's already verified.
                // We can be smarter here, but for now, let's just show the error.
                setStatus('❌ Verification Failed or Expired.');
                console.error(error);
            }
        };
        verifyAccount();
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                <h1 className={`text-2xl font-bold mb-4 ${status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {status}
                </h1>
                
                {status.includes('✅') && (
                    <p className="text-gray-600 mb-6">
                        Thank you for verifying your email. You can now access your account.
                    </p>
                )}

                <Link 
                    to="/login"  // CHANGE THIS from "/" to "/login"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                    Go to Login
                </Link>
            </div>
        </div>
    );
};

export default VerifyEmail;