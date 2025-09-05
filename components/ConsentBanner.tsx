
import React from 'react';

interface ConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  onPrivacyPolicyClick: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onAccept, onDecline, onPrivacyPolicyClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 p-4 z-40 animate-fade-in">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-300 text-center md:text-left max-w-3xl">
          Utilizamos armazenamento local para guardar os dados do seu CV enquanto o preenche. Isto é essencial para o funcionamento da aplicação.
          Consulte a nossa{' '}
          <button onClick={onPrivacyPolicyClick} className="underline hover:text-indigo-400 transition-colors">
            Política de Privacidade
          </button>
          {' '}para saber mais.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
            <button
              onClick={onDecline}
              className="w-full md:w-auto px-6 py-2 bg-transparent text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition-colors border border-slate-600"
            >
              Não Aceitar e Sair
            </button>
            <button
              onClick={onAccept}
              className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Aceitar
            </button>
        </div>
      </div>
    </div>
  );
};
