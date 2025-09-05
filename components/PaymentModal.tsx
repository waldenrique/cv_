

import React, { useState } from 'react';
import type { CVData } from '../types';
import { XIcon } from './icons/XIcon';
import { LockIcon } from './icons/LockIcon';

interface PaymentModalProps {
  cvData: CVData;
  onClose: () => void;
}

// --- DADOS DA STRIPE ---
// Chaves do Stripe vindas das variáveis de ambiente
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY; 

// ID do Preço (Price ID) do produto no Stripe.
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID;

// Disponibiliza o objeto Stripe global para o TypeScript
declare const Stripe: any;

export const PaymentModal: React.FC<PaymentModalProps> = ({ cvData, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    if (!STRIPE_PUBLISHABLE_KEY || !STRIPE_PRICE_ID) {
        setError("A integração com o pagamento não está configurada corretamente.");
        setIsProcessing(false);
        return;
    }

    try {
        // 1. Salva os dados do CV no localStorage para recuperá-los após o redirecionamento
        localStorage.setItem('cvData', JSON.stringify(cvData));

        // 2. Inicializa o Stripe com a sua chave publicável
        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

        // 3. Redireciona para a página de checkout do Stripe
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
            mode: 'payment',
            // Define as URLs para onde o usuário será redirecionado
            successUrl: `${window.location.origin}?payment=success`,
            cancelUrl: `${window.location.origin}?payment=cancel`,
        });
        
        if (error) {
            console.error("Erro do Stripe:", error);
            setError(error.message || "Ocorreu um erro ao redirecionar para o pagamento.");
            setIsProcessing(false);
        }

    } catch (err: any) {
        console.error("Erro inesperado no pagamento:", err);
        setError(err.message || "Falha ao iniciar o processo de pagamento.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full relative border border-slate-700" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Fechar">
          <XIcon className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500/20 text-indigo-400 mb-4 border border-indigo-500">
                <LockIcon className="h-6 w-6" />
            </div>
          <h3 className="text-xl font-bold text-white mb-2">Pagamento Seguro</h3>
          <p className="text-slate-400 mb-6">Para baixar o seu CV profissional, é necessário um pagamento único.</p>
          
          <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 mb-6">
              <p className="text-slate-300">Download do CV em PDF</p>
              <p className="text-4xl font-extrabold text-white my-2">5,00€</p>
              <p className="text-xs text-slate-500">Pagamento único</p>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Redirecionando...</span>
              </>
            ) : (
                "Pagar com Stripe"
            )}
          </button>
          
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          
          <p className="text-xs text-slate-500 mt-6">Pagamento seguro processado pela Stripe.</p>
        </div>
      </div>
    </div>
  );
};