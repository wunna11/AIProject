import React, { useState } from 'react';
import { Plus, X, CheckCircle } from 'lucide-react';
import type { JobRequirement } from '../types';

interface JobRequirementsProps {
  onRequirementsChange: (requirements: JobRequirement) => void;
}

export const JobRequirements: React.FC<JobRequirementsProps> = ({ onRequirementsChange }) => {
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'incomplete' | 'processing' | 'complete'>('incomplete');

  const addSkill = () => {
    if (skill.trim()) {
      setSkills([...skills, skill.trim()]);
      setSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      onRequirementsChange({
        title,
        requiredSkills: skills,
        description,
        status: 'complete'
      });
      setStatus('complete');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">Job Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Required Skills</label>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((s, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {s}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="ml-1 inline-flex items-center"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Job Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={status === 'processing'}
        >
          Save Requirements
        </button>
        
        {status === 'processing' && (
          <span className="text-blue-600 flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        )}
        
        {status === 'complete' && (
          <span className="text-green-600 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Requirements Saved
          </span>
        )}
      </div>
    </form>
  );
};