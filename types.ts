export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  photo: string; // Base64 encoded image
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface CVData {
  personalDetails: PersonalDetails;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
}