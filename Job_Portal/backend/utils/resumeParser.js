// Common technical skills, frameworks, languages, tools
const COMMON_SKILLS = [
  // Programming Languages
  'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
  'typescript', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'bash', 'shell',
  
  // Frontend Frameworks
  'react', 'angular', 'vue', 'svelte', 'nextjs', 'nuxt', 'gatsby', 'ember',
  
  // Backend Frameworks
  'node', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
  'laravel', 'rails', 'asp.net', 'gin',
  
  // Databases
  'mongodb', 'postgresql', 'mysql', 'redis', 'cassandra', 'elasticsearch', 'firestore',
  'dynamodb', 'oracle', 'sqlserver', 'sqlite', 'mariadb',
  
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'docker', 'kubernetes', 'jenkins',
  'gitlab', 'github', 'bitbucket', 'terraform', 'ansible', 'cloudflare',
  
  // Tools & Technologies
  'git', 'webpack', 'babel', 'npm', 'yarn', 'graphql', 'rest', 'api', 'rest api',
  'microservices', 'linux', 'windows', 'macos', 'unix',
  
  // Mobile
  'react native', 'flutter', 'ionic', 'xcode', 'android studio', 'ios', 'android',
  
  // Testing
  'jest', 'mocha', 'jasmine', 'pytest', 'unittest', 'selenium', 'cypress',
  
  // Other
  'agile', 'scrum', 'jira', 'figma', 'photoshop', 'ai', 'machine learning', 'deep learning',
  'data science', 'nlp', 'blockchain', 'web3', 'solidity', 'ethereum',
];

// Extract skills from resume text by looking for keyword matches
export const extractSkillsFromResume = (resumeText = '') => {
  if (!resumeText || typeof resumeText !== 'string') return [];

  const lowerText = resumeText.toLowerCase();
  const foundSkills = new Set();

  COMMON_SKILLS.forEach((skill) => {
    // Create regex to find skill as whole word or phrase
    const regex = new RegExp(`\\b${skill.replace(/\+/g, '\\+')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      foundSkills.add(skill);
    }
  });

  return Array.from(foundSkills);
};

export default { extractSkillsFromResume };
