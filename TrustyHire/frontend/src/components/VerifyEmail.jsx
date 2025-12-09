import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                await axios.post('http://localhost:5000/api/users/verify', { token });
                setStatus('✅ Email Verified Successfully!');
            } catch (error) {
                setStatus('❌ Verification Failed or Expired.');
            }
        };
        verifyAccount();
    }, [token]);

    return (
        <div className="text-center mt-20">
            <h1 className="text-2xl font-bold">{status}</h1>
            <Link to="/" className="text-blue-600 mt-4 underline">Go to Login</Link>
        </div>
    );
};

export default VerifyEmail;