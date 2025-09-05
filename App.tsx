

import React, { useState, useEffect } from 'react';
import type { CVData } from './types';
import { CVForm } from './components/CVForm';
import { CVPreview } from './components/CVPreview';
import { generateCVContent, parseAndEnhanceCV } from './services/geminiService';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { ConsentBanner } from './components/ConsentBanner';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ConsentDeclined } from './components/ConsentDeclined';

const initialCVData: CVData = {
  personalDetails: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    photo: '',
  },
  summary: '',
  workExperience: [
    {
      id: '1',
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  education: [
    {
      id: '1',
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
    },
  ],
  skills: [],
};

// Carrega o estado inicial do localStorage ou usa o estado inicial padrão
const loadState = (): CVData => {
  try {
    const serializedState = localStorage.getItem('cvData');
    if (serializedState === null) {
      return initialCVData;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Erro ao carregar o estado do localStorage:", err);
    return initialCVData;
  }
};

const App: React.FC = () => {
  const [cvData, setCvData] = useState<CVData>(loadState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consentDeclined, setConsentDeclined] = useState(false);
  const [triggerDownload, setTriggerDownload] = useState(false);

  // Efeito para verificar o consentimento e o status do pagamento na montagem
  useEffect(() => {
    const consentGiven = localStorage.getItem('cv-ia-consent');
    if (!consentGiven) {
      setShowConsent(true);
    }
    
    // Verifica se a URL contém o status de sucesso do pagamento
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setTriggerDownload(true);
      // Limpa os parâmetros da URL para evitar acionar o download novamente
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Efeito para salvar o estado no localStorage sempre que cvData mudar
  useEffect(() => {
    try {
      const serializedState = JSON.stringify(cvData);
      localStorage.setItem('cvData', serializedState);
    } catch (err) {
      console.error("Erro ao salvar o estado no localStorage:", err);
    }
  }, [cvData]);


  const handleAcceptConsent = () => {
    localStorage.setItem('cv-ia-consent', 'true');
    setShowConsent(false);
  };
  
  const handleDeclineConsent = () => {
    setConsentDeclined(true);
    setShowConsent(false);
  };

  const handleDataChange = (newData: CVData) => {
    setCvData(newData);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const enhancedData = await generateCVContent(cvData);
      setCvData(prevData => ({
        ...prevData,
        summary: enhancedData.summary || prevData.summary,
        workExperience: enhancedData.workExperience || prevData.workExperience,
        skills: enhancedData.skills || prevData.skills,
      }));
    } catch (e: any) {
      setError(e.message || "Ocorreu um erro desconhecido.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleParseCV = async (cvText: string) => {
    if (!cvText.trim()) {
        setError("Por favor, cole o texto do seu CV.");
        return;
    }
    setIsParsingCv(true);
    setError(null);
    try {
        const parsedData = await parseAndEnhanceCV(cvText);
        setCvData(prevData => ({
            personalDetails: {
                ...prevData.personalDetails,
                ...parsedData.personalDetails,
                photo: prevData.personalDetails.photo,
            },
            summary: parsedData.summary || prevData.summary,
            workExperience: parsedData.workExperience?.length ? parsedData.workExperience : prevData.workExperience,
            education: parsedData.education?.length ? parsedData.education : prevData.education,
            skills: parsedData.skills?.length ? parsedData.skills : prevData.skills,
        }));
    } catch (e: any) {
        setError(e.message || "Erro ao analisar o CV.");
    } finally {
        setIsParsingCv(false);
    }
  };
  
  const onDownloadHandled = () => {
    setTriggerDownload(false);
  }
  
  if (consentDeclined) {
      return <ConsentDeclined />;
  }

  return (
    <div className="flex flex-col h-screen font-sans">
       <header className="bg-slate-800/50 border-b border-slate-700 p-4 shadow-md z-10">
        <div className="container mx-auto flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
            Gerador de CV IA
          </h1>
        </div>
      </header>
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <section className="overflow-y-auto">
            <CVForm 
                cvData={cvData} 
                onDataChange={handleDataChange} 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating}
                onParseCV={handleParseCV}
                isParsingCv={isParsingCv}
                onError={setError}
            />
        </section>
        <section className="overflow-y-auto hidden lg:block bg-slate-900">
            <CVPreview cvData={cvData} triggerDownload={triggerDownload} onDownloadHandled={onDownloadHandled} />
        </section>
      </main>

      {error && (
        <div className="fixed bottom-24 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in max-w-sm">
          <p className="font-bold">Ocorreu um erro</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1 right-2 text-white font-bold text-xl hover:text-red-200 transition-colors">&times;</button>
        </div>
      )}
      
      <Footer onPrivacyPolicyClick={() => setShowPrivacyPolicy(true)} />

      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      
      {showConsent && <ConsentBanner onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} onPrivacyPolicyClick={() => setShowPrivacyPolicy(true)} />}

    </div>
  );
};

export default App;