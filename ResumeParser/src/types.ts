export interface Resume {
  id: string;
  content: string;
  score: number;
  skills: string[];
  jobTitle: string;
  experience?: string[];
  education?: string[];
  uploadStatus: 'uploading' | 'analyzing' | 'complete' | 'error';
  errorMessage?: string;
  suitabilityAnalysis: {
    strengths: string[];
    gaps: string[];
    recommendation: string;
  };
}

export interface JobRequirement {
  title: string;
  requiredSkills: string[];
  description: string;
  status: 'incomplete' | 'processing' | 'complete';
}