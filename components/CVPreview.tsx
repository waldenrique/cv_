import React from 'react';
import type { CVData } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { UserIcon } from './icons/UserIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { LinkIcon } from './icons/LinkIcon';
import { PaymentModal } from './PaymentModal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Disponibiliza o objeto Stripe global para o TypeScript
declare const Stripe: any;

interface CVPreviewProps {
  cvData: CVData;
  triggerDownload: boolean;
  onDownloadHandled: () => void;
}

const ContactInfoItem: React.FC<{ icon: React.ReactNode; text: string; link?: string }> = ({ icon, text, link }) => {
  if (!text) return null;
  const content = (
    <div className="flex items-center gap-2 text-sm text-slate-700 group">
      <span className="text-indigo-700">{icon}</span>
      <span className="group-hover:underline break-all">{text}</span>
    </div>
  );
  
  if (link) {
    return <a href={link} target="_blank" rel="noopener noreferrer">{content}</a>
  }
  return content;
};

export const CVPreview: React.FC<CVPreviewProps> = ({ cvData, triggerDownload, onDownloadHandled }) => {
  const cvPreviewRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);

  // Efeito para acionar o download quando a propriedade triggerDownload for verdadeira
  React.useEffect(() => {
    if (triggerDownload) {
      startDownload();
      onDownloadHandled(); // Informa ao componente pai que o download foi tratado
    }
  }, [triggerDownload]);


  const startDownload = async () => {
    const element = cvPreviewRef.current;
    if (!element) {
        alert("Não foi possível encontrar o conteúdo do CV para baixar.");
        return;
    }
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(element, {
            scale: 3, // Higher scale for better quality
            useCORS: true,
            backgroundColor: '#ffffff',
            windowHeight: element.scrollHeight,
            scrollY: -window.scrollY,
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        const imgHeight = pdfWidth / ratio;

        let heightLeft = imgHeight;
        let position = 0;
        let pageCount = 1;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = -pdfHeight * pageCount;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
            pageCount++;
        }
        
        const fullName = cvData.personalDetails.fullName.trim();
        const filename = fullName ? `${fullName.replace(/\s+/g, '_')}_cv.pdf` : 'cv.pdf';
        
        pdf.save(filename);

    } catch (error) {
        console.error("Erro ao gerar o PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleDownloadClick = () => {
    setShowPaymentModal(true);
  };

  const formatDescription = (description: string) => {
    return description.split('\n').filter(line => line.trim() !== '').map((line, i) => (
      <li key={i} className="text-slate-600 leading-snug">{line.replace(/^- /, '')}</li>
    ));
  }

  const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
      <h3 className="text-base font-bold text-indigo-800 border-b-2 border-indigo-200 pb-1 mb-3 uppercase tracking-wider">
          {children}
      </h3>
  );

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 bg-slate-900 h-full overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 text-center sm:text-left">Pré-visualização do CV</h2>
          <button 
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isDownloading ? 'Baixando...' : <><DownloadIcon /> <span>Baixar PDF</span></>}
          </button>
        </div>

        <div className="w-full max-w-[210mm] mx-auto">
          <div ref={cvPreviewRef} className="bg-white shadow-2xl p-6 md:p-8 w-full text-sm font-sans text-slate-800 md:aspect-[210/297]">
              <header className="flex flex-col md:flex-row items-center gap-4 md:gap-8 border-b-2 border-slate-300 pb-6 mb-6">
                  <div className="flex-shrink-0">
                      {cvData.personalDetails.photo ? (
                          <div 
                            style={{backgroundImage: `url(${cvData.personalDetails.photo})`}}
                            aria-label="Foto do Perfil"
                            className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-cover bg-center border-4 border-slate-200"
                          />
                      ) : (
                          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 border-4 border-slate-200">
                              <UserIcon />
                          </div>
                      )}
                  </div>
                  <div className="text-center md:text-left">
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{cvData.personalDetails.fullName || 'Seu Nome'}</h1>
                      <p className="text-lg md:text-xl text-indigo-700 font-semibold mt-1">{cvData.personalDetails.jobTitle || 'Seu Cargo'}</p>
                  </div>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                  {/* Left Column */}
                  <aside className="col-span-1 md:col-span-4 space-y-6">
                      <div>
                          <SectionTitle>Contato</SectionTitle>
                          <div className="space-y-2">
                            <ContactInfoItem icon={<EnvelopeIcon />} text={cvData.personalDetails.email} link={`mailto:${cvData.personalDetails.email}`} />
                            <ContactInfoItem icon={<PhoneIcon />} text={cvData.personalDetails.phone} link={`tel:${cvData.personalDetails.phone}`} />
                            <ContactInfoItem icon={<MapPinIcon />} text={cvData.personalDetails.address} />
                            <ContactInfoItem icon={<LinkIcon />} text="LinkedIn" link={cvData.personalDetails.linkedin} />
                          </div>
                      </div>
                      <div>
                          <SectionTitle>Habilidades</SectionTitle>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                              {cvData.skills.map((skill, index) => <li key={index}>{skill}</li>)}
                          </ul>
                      </div>
                  </aside>
                  
                  {/* Right Column */}
                  <main className="col-span-1 md:col-span-8 space-y-6">
                      <section>
                          <SectionTitle>Resumo</SectionTitle>
                          <p className="text-slate-600 leading-relaxed">{cvData.summary || 'Seu resumo profissional aparecerá aqui.'}</p>
                      </section>
                      
                      <section>
                          <SectionTitle>Experiência</SectionTitle>
                          <div className="space-y-4">
                              {cvData.workExperience.map(exp => (
                                  <div key={exp.id}>
                                      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                                          <h4 className="font-bold text-base text-slate-800">{exp.jobTitle || 'Cargo'}</h4>
                                          <p className="text-xs font-medium text-slate-500 mt-1 sm:mt-0">{exp.startDate} - {exp.endDate}</p>
                                      </div>
                                      <p className="font-semibold text-indigo-700 mb-1">{exp.company || 'Empresa'}</p>
                                      <ul className="pl-4 list-disc space-y-1">{formatDescription(exp.description)}</ul>
                                  </div>
                              ))}
                          </div>
                      </section>
                      
                      <section>
                          <SectionTitle>Formação</SectionTitle>
                          <div className="space-y-4">
                              {cvData.education.map(edu => (
                                  <div key={edu.id}>
                                      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                                          <h4 className="font-bold text-base text-slate-800">{edu.degree || 'Curso'}</h4>
                                          <p className="text-xs font-medium text-slate-500 mt-1 sm:mt-0">{edu.startDate} - {edu.endDate}</p>
                                      </div>
                                      <p className="font-semibold text-indigo-700">{edu.institution || 'Instituição'}</p>

                                  </div>
                              ))}
                          </div>
                      </section>
                  </main>
              </div>
          </div>
        </div>
      </div>
      {showPaymentModal && <PaymentModal cvData={cvData} onClose={() => setShowPaymentModal(false)} />}
    </>
  );
};
