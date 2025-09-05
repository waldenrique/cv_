
import React from 'react';

export const ConsentDeclined: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-200 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-400 mb-4">Acesso Negado</h1>
        <p className="text-lg text-slate-300">
          O seu consentimento é necessário para utilizar esta aplicação.
        </p>
        <p className="text-slate-400 mt-2">
          Por favor, recarregue a página se desejar rever os termos e dar o seu consentimento.
        </p>
      </div>
    </div>
  );
};
