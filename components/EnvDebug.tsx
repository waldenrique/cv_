import React from 'react';

export const EnvDebug: React.FC = () => {
  const envVars = {
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_STRIPE_PRICE_ID: import.meta.env.VITE_STRIPE_PRICE_ID,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE
  };

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 p-4 rounded-lg text-xs text-white max-w-sm z-50">
      <h4 className="font-bold mb-2">Environment Variables Debug:</h4>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  );
};
