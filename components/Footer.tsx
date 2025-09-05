
import React from 'react';

interface FooterProps {
  onPrivacyPolicyClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPrivacyPolicyClick }) => {
  return (
    <footer className="bg-slate-800/50 border-t border-slate-700 p-4">
      <div className="container mx-auto text-center text-slate-400 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Gerador de CV IA. Todos os direitos reservados.
        </p>
        <button onClick={onPrivacyPolicyClick} className="underline hover:text-indigo-400 transition-colors mt-1">
          Política de Privacidade
        </button>
      </div>
    </footer>
  );
};
