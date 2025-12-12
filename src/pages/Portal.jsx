import React, { useEffect } from 'react';

const Portal = () => {
    useEffect(() => {
        window.location.href = 'https://billing.stripe.com/p/login/cNi3cx6QI2521CL51s5ZC00';
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary mb-4"></div>
            <p className="text-text-secondary">Redirecting to Customer Portal...</p>
        </div>
    );
};

export default Portal;
