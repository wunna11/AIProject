import nlp from 'compromise';

export class ResumeParser {
  private commonTechTerms = new Set([
    'javascript', 'typescript', 'python', 'java', 'c++', 'ruby', 'php',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
    'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'git', 'ci/cd', 'agile', 'scrum',
    'html', 'css', 'sass', 'less', 'webpack', 'babel', 'rest', 'graphql',
    'linux', 'windows', 'macos', 'ios', 'android', 'swift', 'kotlin'
  ]);

  public parseResume(content: string): {
    skills: string[];
    experience: string[];
    education: string[];
  } {
    const doc = nlp(content.toLowerCase());
    const skills = new Set<string>();
    const experience: string[] = [];
    const education: string[] = [];
    
    // Extract skills
    const words = content.toLowerCase().split(/[\s,\.]+/);
    words.forEach(word => {
      if (this.commonTechTerms.has(word)) {
        skills.add(word);
      }
    });

    // Extract technical terms
    const techTerms = doc.match('#Noun').match('(cloud|stack|framework|language|database|platform|system|api|service)');
    techTerms.forEach(term => {
      skills.add(term.text().toLowerCase());
    });

    // Extract capitalized terms
    const capitalizedTerms = doc.match('#ProperNoun').not('#Person').not('#Place').not('#Organization');
    capitalizedTerms.forEach(term => {
      const text = term.text().toLowerCase();
      if (this.commonTechTerms.has(text)) {
        skills.add(text);
      }
    });

    // Extract experience
    const experienceSentences = doc.sentences()
      .if('#Value years')
      .if('experience')
      .out('array');
    
    experience.push(...experienceSentences);

    // Extract education
    const educationSentences = doc.sentences()
      .if('(degree|bachelor|master|phd|diploma)')
      .out('array');
    
    education.push(...educationSentences);

    return {
      skills: Array.from(skills),
      experience,
      education
    };
  }

  public analyzeSuitability(
    content: string, 
    requiredSkills: string[], 
    jobDescription: string
  ): {
    strengths: string[];
    gaps: string[];
    recommendation: string;
  } {
    const { skills, experience, education } = this.parseResume(content);
    const score = this.scoreResume(content, requiredSkills);
    
    const strengths: string[] = [];
    const gaps: string[] = [];
    
    // Analyze skills match
    const matchedSkills = requiredSkills.filter(skill => 
      skills.includes(skill.toLowerCase())
    );
    const missingSkills = requiredSkills.filter(skill => 
      !skills.includes(skill.toLowerCase())
    );
    
    if (matchedSkills.length > 0) {
      strengths.push(`Strong match in key skills: ${matchedSkills.join(', ')}`);
    }
    
    if (missingSkills.length > 0) {
      gaps.push(`Missing required skills: ${missingSkills.join(', ')}`);
    }
    
    // Analyze experience
    const yearsExp = experience.reduce((max, exp) => {
      const years = parseInt(exp.match(/\d+/)?.[0] || '0');
      return Math.max(max, years);
    }, 0);
    
    if (yearsExp >= 5) {
      strengths.push(`Strong industry experience with ${yearsExp} years`);
    } else if (yearsExp >= 2) {
      strengths.push(`Relevant experience with ${yearsExp} years in the field`);
    } else {
      gaps.push('Limited professional experience');
    }
    
    // Analyze education
    if (education.length > 0) {
      if (education.some(edu => edu.toLowerCase().includes('master') || edu.toLowerCase().includes('phd'))) {
        strengths.push('Advanced academic qualifications');
      } else if (education.some(edu => edu.toLowerCase().includes('bachelor'))) {
        strengths.push('Relevant academic background');
      }
    } else {
      gaps.push('No formal education details found');
    }
    
    // Generate recommendation
    let recommendation = '';
    if (score >= 7) {
      recommendation = 'Highly recommended for the position. The candidate shows strong alignment with job requirements and brings valuable experience.';
    } else if (score >= 5) {
      recommendation = 'Consider for interview. While there are some gaps, the candidate shows potential and could be a good fit with some training.';
    } else {
      recommendation = 'Not recommended for this position. The candidate\'s profile doesn\'t align well with the job requirements.';
    }
    
    return {
      strengths,
      gaps,
      recommendation
    };
  }

  public scoreResume(content: string, requiredSkills: string[]): number {
    const { skills } = this.parseResume(content);
    const normalizedContent = content.toLowerCase();
    let score = 0;

    const matchedSkills = requiredSkills.filter(skill => 
      skills.includes(skill.toLowerCase()) || 
      normalizedContent.includes(skill.toLowerCase())
    );
    
    score += (matchedSkills.length / requiredSkills.length) * 7;

    requiredSkills.forEach(skill => {
      const skillRegex = new RegExp(skill.toLowerCase(), 'gi');
      const matches = normalizedContent.match(skillRegex) || [];
      if (matches.length > 1) {
        score += 0.2;
      }
      
      if (normalizedContent.includes(`experience in ${skill.toLowerCase()}`)) {
        score += 0.3;
      }
    });

    return Math.min(Math.round(score * 10) / 10, 10);
  }
}