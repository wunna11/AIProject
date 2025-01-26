import React, { useState } from 'react';
import { ResumeUploader } from './components/ResumeUploader';
import { JobRequirements } from './components/JobRequirements';
import { ResumeParser } from './utils/resumeParser';
import type { JobRequirement, Resume } from './types';
import { FileText, Briefcase, Award, BookOpen, Code, GraduationCap, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';

function App() {
  const [jobRequirements, setJobRequirements] = useState<JobRequirement | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const parser = new ResumeParser();

  const handleResumeUpload = (content: string) => {
    if (!jobRequirements) {
      alert('Please set job requirements first');
      return;
    }

    const { skills, experience, education } = parser.parseResume(content);
    const score = parser.scoreResume(content, jobRequirements.requiredSkills);
    const suitabilityAnalysis = parser.analyzeSuitability(
      content, 
      jobRequirements.requiredSkills,
      jobRequirements.description
    );

    const resume: Resume = {
      id: Date.now().toString(),
      content,
      score,
      skills,
      experience: experience,
      education: education,
      jobTitle: jobRequirements.title,
      uploadStatus: 'complete',
      suitabilityAnalysis
    };

    setResumes([...resumes, resume]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            AI Resume Parser
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center">
                <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold">Job Requirements</h2>
              </div>
              <JobRequirements onRequirementsChange={setJobRequirements} />
            </div>

            <div>
              <div className="mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold">Upload Resumes</h2>
              </div>
              <ResumeUploader onUpload={handleResumeUpload} />
            </div>
          </div>

          {resumes.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex items-center">
                <Award className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold">Analysis Results</h2>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
                {resumes
                  .sort((a, b) => b.score - a.score)
                  .map((resume) => (
                    <div key={resume.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Resume for {resume.jobTitle}
                        </h3>
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-semibold
                          ${resume.score >= 7 
                            ? 'bg-green-100 text-green-800' 
                            : resume.score >= 4 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }
                        `}>
                          Score: {resume.score}/10
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="flex items-center mb-2">
                            <ThumbsUp className="w-5 h-5 mr-2 text-green-600" />
                            <h4 className="font-semibold text-green-700">Strengths</h4>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {resume.suitabilityAnalysis.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-700">Areas for Improvement</h4>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {resume.suitabilityAnalysis.gaps.map((gap, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center mb-2">
                          <Award className="w-5 h-5 mr-2 text-blue-600" />
                          <h4 className="font-semibold text-blue-700">AI Recommendation</h4>
                        </div>
                        <p className="text-sm text-gray-700">{resume.suitabilityAnalysis.recommendation}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <Code className="w-5 h-5 mr-2 text-blue-600" />
                            <h4 className="font-semibold">Skills</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {resume.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center mb-2">
                            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                            <h4 className="font-semibold">Experience</h4>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {resume.experience?.map((exp, index) => (
                              <li key={index} className="list-disc ml-4">{exp}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="flex items-center mb-2">
                            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                            <h4 className="font-semibold">Education</h4>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {resume.education?.map((edu, index) => (
                              <li key={index} className="list-disc ml-4">{edu}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;