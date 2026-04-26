import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('spectr_auth_token', token);
            // Optionally fetch user profile here if needed
            navigate('/');
        } else {
            navigate('/?error=auth_failed');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFFF] mb-4"></div>
            <p className="text-white/60 font-medium tracking-widest uppercase text-xs">Authenticating...</p>
        </div>
    );
}
