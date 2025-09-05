

import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { CVData, WorkExperience, Education } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const cvSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "Um resumo profissional conciso e impactante de 3-4 frases."
        },
        workExperience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    description: {
                        type: Type.STRING,
                        description: "Descrição da experiência de trabalho reescrita usando verbos de ação fortes e quantificando conquistas. Formate como uma lista com marcadores usando '- ' para cada ponto."
                    }
                },
                required: ["jobTitle", "company", "startDate", "endDate", "description"]
            }
        },
        skills: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            },
            description: "Uma lista organizada das habilidades do usuário."
        }
    },
    required: ["summary", "workExperience", "skills"]
};

const fullCvSchema = {
    type: Type.OBJECT,
    properties: {
        personalDetails: {
            type: Type.OBJECT,
            properties: {
                fullName: { type: Type.STRING, description: "Nome completo do candidato." },
                jobTitle: { type: Type.STRING, description: "Cargo atual ou desejado." },
                email: { type: Type.STRING, description: "Endereço de e-mail." },
                phone: { type: Type.STRING, description: "Número de telefone." },
                address: { type: Type.STRING, description: "Endereço físico (cidade, estado)." },
                linkedin: { type: Type.STRING, description: "URL do perfil do LinkedIn." }
            },
            required: ["fullName", "email"]
        },
        summary: {
            type: Type.STRING,
            description: "Um resumo profissional conciso e impactante de 3-4 frases, reescrito a partir do conteúdo do usuário."
        },
        workExperience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    description: {
                        type: Type.STRING,
                        description: "Descrição da experiência de trabalho reescrita usando o método STAR, verbos de ação fortes e quantificando conquistas. Formate como uma string única com cada ponto começando com '- ' e separado por uma nova linha (\\n)."
                    }
                },
                required: ["jobTitle", "company", "startDate", "endDate", "description"]
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                },
                required: ["degree", "institution"]
            }
        },
        skills: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            },
            description: "Uma lista organizada das habilidades extraídas do currículo."
        }
    },
    required: ["personalDetails", "summary", "workExperience", "education", "skills"]
};


export const generateCVContent = async (cvData: CVData): Promise<Partial<CVData>> => {
    const prompt = `
    Aja como um coach de carreira profissional e redator de currículos especializado no mercado de trabalho europeu (padrão Europass).
    Sua tarefa é pegar as informações brutas do usuário e transformá-las em um Curriculum Vitae polido e profissional.
    
    Dados brutos do usuário:
    ${JSON.stringify({
        summary: cvData.summary,
        workExperience: cvData.workExperience.map(({id, ...rest}) => rest),
        skills: cvData.skills
    }, null, 2)}

    Sua tarefa é:
    1. Reescreva o 'summary' (resumo) para ser conciso, impactante e direcionado a um público profissional. Deve ser um 'elevator pitch' de 3-4 frases.
    2. Para cada item em 'workExperience', reescreva a 'description' para usar o método STAR (Situação, Tarefa, Ação, Resultado) sempre que possível. Use verbos de ação fortes e quantifique as realizações. A descrição deve ser uma string única, com cada ponto começando com '- ' e separado por uma nova linha (\\n).
    3. Para a seção 'skills', organize as habilidades fornecidas em uma lista limpa.
    4. NÃO invente novas informações. Apenas refine e reformule o conteúdo fornecido pelo usuário.
    5. Retorne o resultado como um único objeto JSON que adere estritamente ao esquema fornecido. Mantenha o idioma do conteúdo original (português).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: cvSchema
            }
        });
        
        const jsonText = response.text;
        const generatedData = JSON.parse(jsonText);
        
        // Ensure workExperience has ids back for React keys
        const formattedWorkExperience = generatedData.workExperience.map((exp: any, index: number) => ({
            ...exp,
            id: cvData.workExperience[index]?.id || Date.now().toString() + index
        }));

        return {
            ...generatedData,
            workExperience: formattedWorkExperience
        };

    } catch (error) {
        console.error("Erro ao gerar conteúdo do CV:", error);
        throw new Error("Não foi possível gerar o conteúdo do CV com a IA. Por favor, tente novamente.");
    }
};

export const transformProfilePhoto = async (base64Image: string): Promise<string> => {
    if (!base64Image.startsWith('data:image')) {
        throw new Error("Formato de imagem inválido. Esperado uma string base64 com prefixo de tipo MIME.");
    }

    const mimeType = base64Image.substring(base64Image.indexOf(":") + 1, base64Image.indexOf(";"));
    const imageData = base64Image.substring(base64Image.indexOf(",") + 1);

    const prompt = `Transforme esta imagem em uma foto de perfil profissional (headshot) para um currículo.
Características desejadas:
- Fundo: Cor sólida e neutra (branco ou cinza claro).
- Vestuário: Profissional (terno, blazer ou blusa formal).
- Iluminação: Clara e profissional.
- Foco: Rosto e ombros.
Importante: Mantenha as características faciais e a identidade da pessoa na foto original.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageData,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const candidate = response.candidates?.[0];
        
        // Log para depuração
        console.log("Gemini Image Edit Response:", JSON.stringify(response, null, 2));

        if (!candidate?.content?.parts) {
            console.error("Estrutura de resposta inválida da IA:", JSON.stringify(response, null, 2));
            throw new Error("A IA retornou uma resposta em formato inesperado. Tente novamente.");
        }

        // Encontra e retorna a parte da imagem
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const newBase64Data = part.inlineData.data;
                const newMimeType = part.inlineData.mimeType;
                return `data:${newMimeType};base64,${newBase64Data}`;
            }
        }

        // Se nenhuma imagem for encontrada, verifica se há uma resposta de texto para explicar o porquê
        const textPart = candidate.content.parts.find(p => p.text);
        if (textPart && textPart.text) {
             console.error("A IA não retornou uma imagem. Resposta de texto:", textPart.text);
             const userMessage = `A IA não retornou uma imagem. Motivo: ${textPart.text.substring(0, 120)}${textPart.text.length > 120 ? '...' : ''}`;
             throw new Error(userMessage);
        }

        throw new Error("A IA não retornou uma imagem. Por favor, tente com outra foto.");

    } catch (error: any) {
        console.error("Erro ao transformar a foto:", error);
        // Passa a mensagem de erro específica para a UI, se disponível
        throw new Error(error.message || "Não foi possível transformar a foto com a IA. Tente novamente.");
    }
};

export const parseAndEnhanceCV = async (cvText: string): Promise<Partial<CVData>> => {
    const prompt = `
    Aja como um analista de RH e redator de currículos altamente qualificado. Sua tarefa é analisar o texto de um currículo fornecido, extrair as informações relevantes, aprimorar o conteúdo e estruturá-lo em um formato JSON específico.

    Texto do currículo do usuário:
    ---
    ${cvText}
    ---

    Siga estas instruções rigorosamente:
    1.  **Extraia os Detalhes Pessoais**: Encontre e extraia o nome completo, cargo desejado/atual, e-mail, telefone, endereço e URL do perfil do LinkedIn. Se alguma informação não estiver presente, deixe o campo como uma string vazia.
    2.  **Reescreva o Resumo**: Encontre a seção de resumo/perfil profissional. Reescreva-a para ser um "elevator pitch" conciso e impactante de 3 a 4 frases, focado em conquistas e valor.
    3.  **Extraia e Melhore a Experiência Profissional**: Identifique todas as experiências de trabalho. Para cada uma:
        *   Extraia o cargo, nome da empresa, data de início e data de término.
        *   Reescreva a descrição das responsabilidades e conquistas. Use o método STAR (Situação, Tarefa, Ação, Resultado), utilize verbos de ação fortes e quantifique os resultados sempre que possível. Formate a descrição como uma string única, com cada ponto começando com '- ' e separado por uma nova linha (\\n).
    4.  **Extraia a Formação Acadêmica**: Identifique todas as entradas de formação. Extraia o grau/curso, a instituição de ensino, data de início e data de término.
    5.  **Extraia e Organize as Habilidades**: Identifique a lista de habilidades e organize-as em um array de strings.
    6.  **Idioma e Formato**: Mantenha o idioma original do currículo (português). Retorne o resultado como um único objeto JSON que adere estritamente ao esquema fornecido. NÃO invente informações que não possam ser inferidas do texto.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: fullCvSchema
            }
        });

        const jsonText = response.text;
        const parsedData = JSON.parse(jsonText);

        // Add unique IDs for React keys
        const workExperienceWithIds: WorkExperience[] = parsedData.workExperience?.map((exp: Omit<WorkExperience, 'id'>) => ({
            ...exp,
            id: Date.now().toString() + Math.random(),
        })) || [];

        const educationWithIds: Education[] = parsedData.education?.map((edu: Omit<Education, 'id'>) => ({
            ...edu,
            id: Date.now().toString() + Math.random(),
        })) || [];

        return {
            ...parsedData,
            workExperience: workExperienceWithIds,
            education: educationWithIds,
        };

    } catch (error) {
        console.error("Erro ao analisar o CV:", error);
        throw new Error("Não foi possível analisar o CV com a IA. Verifique o texto e tente novamente.");
    }
};