

import React, { useState } from 'react';
import type { CVData, WorkExperience, Education } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';
import { transformProfilePhoto } from '../services/geminiService';

interface CVFormProps {
  cvData: CVData;
  onDataChange: (data: CVData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onParseCV: (cvText: string) => void;
  isParsingCv: boolean;
  onError: (message: string) => void;
}

export const CVForm: React.FC<CVFormProps> = ({ cvData, onDataChange, onGenerate, isGenerating, onParseCV, isParsingCv, onError }) => {
  const [skillsInput, setSkillsInput] = useState(cvData.skills.join(', '));
  const [isTransformingPhoto, setIsTransformingPhoto] = useState(false);
  const [oldCvText, setOldCvText] = useState('');

  React.useEffect(() => {
    const cleanedSkillsFromInput = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const skillsFromParent = cvData.skills;
    if (JSON.stringify(cleanedSkillsFromInput) !== JSON.stringify(skillsFromParent)) {
      setSkillsInput(skillsFromParent.join(', '));
    }
  }, [cvData.skills]);
  
  const handleChange = <K extends keyof CVData>(
    section: K,
    value: CVData[K]
  ) => {
    onDataChange({ ...cvData, [section]: value });
  };

  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('personalDetails', {
      ...cvData.personalDetails,
      [e.target.name]: e.target.value,
    });
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange('personalDetails', {
          ...cvData.personalDetails,
          photo: event.target?.result as string,
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleTransformPhoto = async () => {
    if (!cvData.personalDetails.photo) {
      onError("Por favor, carregue uma foto primeiro.");
      return;
    }
    setIsTransformingPhoto(true);
    try {
      const professionalPhoto = await transformProfilePhoto(cvData.personalDetails.photo);
      handleChange('personalDetails', {
        ...cvData.personalDetails,
        photo: professionalPhoto,
      });
    } catch (e: any) {
      onError(e.message || "Ocorreu um erro ao transformar a foto.");
    } finally {
      setIsTransformingPhoto(false);
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange('summary', e.target.value);
  };
  
  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const currentInputValue = e.target.value;
      setSkillsInput(currentInputValue);
      handleChange('skills', currentInputValue.split(',').map(s => s.trim()).filter(Boolean));
  }

  // Work Experience Handlers
  const handleWorkExperienceChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newWorkExperience = cvData.workExperience.map((exp) =>
      exp.id === id ? { ...exp, [e.target.name]: e.target.value } : exp
    );
    handleChange('workExperience', newWorkExperience);
  };

  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    handleChange('workExperience', [...cvData.workExperience, newExperience]);
  };

  const removeWorkExperience = (id: string) => {
    handleChange(
      'workExperience',
      cvData.workExperience.filter((exp) => exp.id !== id)
    );
  };
  
  // Education Handlers
  const handleEducationChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const newEducation = cvData.education.map((edu) =>
      edu.id === id ? { ...edu, [e.target.name]: e.target.value } : edu
    );
    handleChange('education', newEducation);
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
    };
    handleChange('education', [...cvData.education, newEducation]);
  };

  const removeEducation = (id: string) => {
    handleChange(
      'education',
      cvData.education.filter((edu) => edu.id !== id)
    );
  };

  const inputStyles = "w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
  
  return (
    <div className="p-8 space-y-8 bg-slate-800 shadow-lg rounded-2xl overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-slate-100">Preencha seus dados</h2>

      {/* CV Parser Section */}
       <details className="bg-slate-900/50 rounded-lg border border-slate-700 transition-all duration-300 open:shadow-lg open:border-indigo-500/50">
        <summary className="p-4 font-semibold cursor-pointer text-slate-300 list-none flex justify-between items-center">
            Comece rápido: cole seu CV antigo aqui
            <span className="text-indigo-400 text-sm transition-transform duration-300 transform details-marker ml-2">▼</span>
        </summary>
        <div className="p-4 border-t border-slate-700 space-y-3">
            <p className="text-sm text-slate-400">Cole o conteúdo do seu currículo atual (de um PDF ou Word) na caixa abaixo e nossa IA irá preencher os campos e sugerir melhorias.</p>
            <textarea
                value={oldCvText}
                onChange={(e) => setOldCvText(e.target.value)}
                placeholder="Cole o texto do seu currículo aqui..."
                rows={8}
                className={inputStyles}
            />
            <button
                onClick={() => onParseCV(oldCvText)}
                disabled={isParsingCv}
                className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isParsingCv ? (
                     <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analisando...</span>
                    </>
                ) : (
                    'Analisar e Preencher'
                )}
            </button>
        </div>
    </details>

      {/* Personal Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-600 pb-2">Detalhes Pessoais</h3>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="fullName" placeholder="Nome Completo" value={cvData.personalDetails.fullName} onChange={handlePersonalDetailsChange} className={inputStyles} />
            <input type="text" name="jobTitle" placeholder="Cargo Desejado" value={cvData.personalDetails.jobTitle} onChange={handlePersonalDetailsChange} className={inputStyles} />
            <input type="email" name="email" placeholder="Email" value={cvData.personalDetails.email} onChange={handlePersonalDetailsChange} className={inputStyles} />
            <input type="tel" name="phone" placeholder="Telefone" value={cvData.personalDetails.phone} onChange={handlePersonalDetailsChange} className={inputStyles} />
            <input type="text" name="address" placeholder="Endereço" value={cvData.personalDetails.address} onChange={handlePersonalDetailsChange} className={`${inputStyles} md:col-span-2`} />
            <input type="text" name="linkedin" placeholder="Perfil do LinkedIn (URL)" value={cvData.personalDetails.linkedin} onChange={handlePersonalDetailsChange} className={`${inputStyles} md:col-span-2`} />
          </div>
          <div className="flex-shrink-0">
            <div className="relative group">
              <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="w-28 h-36 rounded-lg border-2 border-dashed border-slate-500 group-hover:border-indigo-500 transition-colors flex items-center justify-center bg-slate-700 overflow-hidden">
                      {cvData.personalDetails.photo ? (
                          <img src={cvData.personalDetails.photo} alt="Foto do Perfil" className="w-full h-full object-cover" />
                      ) : (
                          <div className="text-center text-slate-500 group-hover:text-indigo-400">
                             <UserIcon />
                              <span className="text-xs mt-1 block">Foto 3x4</span>
                          </div>
                      )}
                  </div>
              </label>
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              {cvData.personalDetails.photo && !isTransformingPhoto && (
                  <button
                      onClick={handleTransformPhoto}
                      className="absolute bottom-1 right-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all duration-200 opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90"
                      title="Transformar em foto profissional com IA"
                      aria-label="Transformar em foto profissional com IA"
                  >
                      <SparklesIcon className="w-4 h-4" />
                  </button>
              )}
              {isTransformingPhoto && (
                  <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center rounded-lg text-center p-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-300 mt-2">Ajustando...</span>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-600 pb-2">Resumo Profissional</h3>
        <textarea name="summary" placeholder="Fale um pouco sobre você, seus objetivos e o que você busca profissionalmente." value={cvData.summary} onChange={handleSummaryChange} rows={5} className={inputStyles}></textarea>
      </div>

      {/* Work Experience */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-600 pb-2">
            <h3 className="text-lg font-semibold text-slate-300">Experiência Profissional</h3>
            <button onClick={addWorkExperience} className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"><PlusIcon /></button>
        </div>
        {cvData.workExperience.map((exp) => (
            <div key={exp.id} className="p-4 border border-slate-700 rounded-lg space-y-3 bg-slate-900/50 relative">
                <button onClick={() => removeWorkExperience(exp.id)} className="absolute top-2 right-2 p-1 rounded-full text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"><TrashIcon /></button>
                <input type="text" name="jobTitle" placeholder="Cargo" value={exp.jobTitle} onChange={(e) => handleWorkExperienceChange(exp.id, e)} className={inputStyles} />
                <input type="text" name="company" placeholder="Empresa" value={exp.company} onChange={(e) => handleWorkExperienceChange(exp.id, e)} className={inputStyles} />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="startDate" placeholder="Data de Início" value={exp.startDate} onChange={(e) => handleWorkExperienceChange(exp.id, e)} className={inputStyles} />
                    <input type="text" name="endDate" placeholder="Data de Término" value={exp.endDate} onChange={(e) => handleWorkExperienceChange(exp.id, e)} className={inputStyles} />
                </div>
                <textarea name="description" placeholder="Descreva suas responsabilidades e conquistas. Use uma nova linha para cada ponto." value={exp.description} onChange={(e) => handleWorkExperienceChange(exp.id, e)} rows={4} className={inputStyles}></textarea>
            </div>
        ))}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-600 pb-2">
            <h3 className="text-lg font-semibold text-slate-300">Formação Acadêmica</h3>
            <button onClick={addEducation} className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"><PlusIcon /></button>
        </div>
        {cvData.education.map((edu) => (
            <div key={edu.id} className="p-4 border border-slate-700 rounded-lg space-y-3 bg-slate-900/50 relative">
                 <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 p-1 rounded-full text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"><TrashIcon /></button>
                 <input type="text" name="degree" placeholder="Curso/Grau" value={edu.degree} onChange={(e) => handleEducationChange(edu.id, e)} className={inputStyles} />
                <input type="text" name="institution" placeholder="Instituição de Ensino" value={edu.institution} onChange={(e) => handleEducationChange(edu.id, e)} className={inputStyles} />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="startDate" placeholder="Data de Início" value={edu.startDate} onChange={(e) => handleEducationChange(edu.id, e)} className={inputStyles} />
                    <input type="text" name="endDate" placeholder="Data de Término" value={edu.endDate} onChange={(e) => handleEducationChange(edu.id, e)} className={inputStyles} />
                </div>
            </div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-600 pb-2">Habilidades</h3>
        <textarea name="skills" placeholder="Liste suas habilidades, separadas por vírgula (ex: React, TypeScript, Liderança)" value={skillsInput} onChange={handleSkillsChange} rows={3} className={inputStyles}></textarea>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
            <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Melhorando...</span>
            </>
        ) : (
            <>
                <SparklesIcon className="w-6 h-6" />
                <span>Melhorar CV com IA</span>
            </>
        )}
      </button>

    </div>
  );
};
