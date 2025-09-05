
import React from 'react';
import { XIcon } from './icons/XIcon';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  const lastUpdatedDate = new Date().toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-100 text-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-slate-300 sticky top-0 bg-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Política de Privacidade</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" aria-label="Fechar">
            <XIcon />
          </button>
        </header>
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          <p className="font-semibold">Última atualização: {lastUpdatedDate}</p>

          <h3 className="font-bold text-lg pt-2">1. Introdução</h3>
          <p>Bem-vindo ao Gerador de CV IA. Respeitamos a sua privacidade e estamos empenhados em proteger os seus dados pessoais. Esta política de privacidade informará como cuidamos dos seus dados pessoais quando utiliza a nossa aplicação e informa sobre os seus direitos de privacidade e como a lei o protege.</p>

          <h3 className="font-bold text-lg pt-2">2. Dados que Coletamos</h3>
          <p>Coletamos e processamos os dados que você nos fornece diretamente através dos formulários da nossa aplicação. Isso inclui:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Detalhes Pessoais:</strong> Nome, cargo, e-mail, telefone, endereço, link do LinkedIn e foto.</li>
            <li><strong>Informações Profissionais:</strong> Resumo profissional, histórico de experiência de trabalho, formação académica e habilidades.</li>
            <li><strong>Dados de Pagamento:</strong> Não armazenamos os detalhes do seu cartão de crédito. Os pagamentos são processados de forma segura pelo nosso parceiro Stripe, que possui certificação PCI Nível 1. Apenas recebemos uma confirmação de pagamento.</li>
          </ul>

          <h3 className="font-bold text-lg pt-2">3. Como Usamos os Seus Dados</h3>
          <p>Usamos as informações que coletamos para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fornecer, operar e manter os nossos serviços.</li>
            <li>Gerar o seu Curriculum Vitae (CV) personalizado.</li>
            <li>Processar a sua transação para o download do CV.</li>
            <li>Comunicar consigo, inclusive para suporte ao cliente.</li>
            <li>Melhorar e personalizar os nossos serviços, utilizando os dados de forma anónima para treinar os nossos modelos de IA. Nenhum dado pessoal identificável é usado para treino sem consentimento explícito.</li>
          </ul>

          <h3 className="font-bold text-lg pt-2">4. Partilha de Dados</h3>
          <p>Não vendemos, alugamos ou partilhamos os seus dados pessoais com terceiros para fins de marketing. Os seus dados são partilhados com os seguintes processadores de dados para fornecer o serviço:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Google Gemini API:</strong> As informações do seu CV (exceto foto e detalhes de contato pessoal) são enviadas para a API do Google Gemini para aprimorar o texto.</li>
            <li><strong>Stripe:</strong> Para processamento de pagamentos.</li>
          </ul>

          <h3 className="font-bold text-lg pt-2">5. Segurança dos Dados</h3>
          <p>Implementamos medidas de segurança para evitar que os seus dados pessoais sejam acidentalmente perdidos, usados ou acedidos de forma não autorizada. O acesso aos seus dados é limitado aos funcionários e parceiros que têm uma necessidade comercial de os conhecer.</p>

          <h3 className="font-bold text-lg pt-2">6. Retenção de Dados</h3>
          <p>Os dados do seu CV são mantidos nos nossos sistemas apenas durante o tempo necessário para gerar e permitir o download do seu documento. Após fechar a sessão, os dados são permanentemente eliminados para proteger a sua privacidade.</p>
          
          <h3 className="font-bold text-lg pt-2">7. Os Seus Direitos Legais</h3>
          <p>De acordo com o Regulamento Geral sobre a Proteção de Dados (GDPR), você tem direitos em relação aos seus dados pessoais, incluindo o direito de solicitar acesso, correção, eliminação ou restrição do processamento dos seus dados.</p>

          <h3 className="font-bold text-lg pt-2">8. Contacto</h3>
          <p>Se tiver alguma questão sobre esta política de privacidade, por favor contacte-nos através de waldenriquept@gmail.com.</p>
        </div>
      </div>
    </div>
  );
};
