/**
 * Enhanced LinkedIn Post Generator Logic
 * Ported & Enhanced from Job Posting service (FC Project Flow)
 * Provides multiple high-converting LinkedIn post templates:
 * - 'engaging': Viral hook, clear details, benefits, social repost call
 * - 'professional': Clean, corporate, structured format
 * - 'urgent': Fast, punchy, immediate-joiner focused
 */

export const JOB_ROLE_KEYWORDS = [
  'developer', 'engineer', 'architect', 'consultant', 'analyst', 'lead', 'manager',
  'specialist', 'designer', 'administrator', 'tester', 'qa', 'fullstack', 'full stack',
  'frontend', 'front end', 'backend', 'back end', 'devops', 'cloud', 'data scientist',
  'data engineer', 'java', 'python', 'salesforce', 'react', 'angular', 'node', 'dotnet',
  '.net', 'c#', 'golang', 'aws', 'azure', 'gcp', 'android', 'ios', 'flutter', 'ui/ux',
  'product manager', 'scrum master', 'business analyst', 'oracle', 'sap', 'zuora', 'workday',
  'snowflake', 'databricks', 'power bi', 'tableau', 'servicenow'
];

export const BAD_TITLE_STARTERS = [
  'exp', 'experience', 'salary', 'budget', 'years', 'yoe', 'duration', 'contract',
  'remote', 'notice', 'location', 'mode', 'must have', 'skills', 'core skills',
  'overview', 'about', 'role summary', 'responsibilities', 'requirements', 'we are',
  'job description', 'client', 'company'
];

export function cleanJobTitle(title: string): string {
  if (!title) return 'Software Professional';

  let cleaned = title.trim();
  // Remove leading labels
  cleaned = cleaned.replace(/^(?:job\s*title|role|position|opening|designation):\s*/i, '').trim();
  // Remove -Medium -, -Senior -, -Junior -
  cleaned = cleaned.replace(/\s*[-–—]\s*(?:Medium|Senior|Junior|Lead|Freshers?)\s*[-–—]?/gi, ' ');
  // Remove position count e.g. (4 Position), (2 Positions)
  cleaned = cleaned.replace(/\s*\(\s*\d+\s*(?:position|positions|openings?)\s*\)/gi, '');
  // Remove redundant location/type suffixes like - Remote (Contract), (Remote), - Contract
  cleaned = cleaned.replace(/\s*[-–—]\s*(?:Remote|Contract|Full[- ]time|Hybrid)(?:\s*\((?:Remote|Contract|Full[- ]time|Hybrid)\))?/gi, '');
  cleaned = cleaned.replace(/\s*\((?:Remote|Contract|Full[- ]time|Hybrid)\)/gi, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned || 'Software Professional';
}

export function extractRoleFromText(text: string): string {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return 'Software Professional';

  for (const line of lines.slice(0, 8)) {
    const lineLower = line.toLowerCase();
    if (BAD_TITLE_STARTERS.some(bad => lineLower.startsWith(bad))) continue;
    if (JOB_ROLE_KEYWORDS.some(k => lineLower.includes(k))) {
      const cleaned = cleanJobTitle(line);
      if (cleaned.length >= 3) return cleaned;
    }
  }

  // Fallback to first non-bad line
  for (const line of lines.slice(0, 3)) {
    const lineLower = line.toLowerCase();
    if (!BAD_TITLE_STARTERS.some(bad => lineLower.startsWith(bad))) {
      return cleanJobTitle(line);
    }
  }

  return cleanJobTitle(lines[0]);
}

export function extractExperienceFromText(text: string): string {
  let match = text.match(/(?:exp(?:erience)?\s*[-:]?\s*)(\d+\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?))/i);
  if (!match) {
    match = text.match(/(\d+\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?)(?:\s*of\s*experience)?)/i);
  }
  if (!match) {
    match = text.match(/(?:exp(?:erience)?\s*[-:]?\s*)(\d+\+?)/i);
  }

  if (match) {
    let val = match[1].trim();
    val = val.replace(/\s*years?|\s*yrs?/gi, '').trim();
    if (!val.endsWith('+') && !val.includes('-')) {
      val += '+';
    }
    return `${val} Years`;
  }

  return 'Not specified';
}

export function extractNoticePeriodFromText(text: string): string {
  const match = text.match(/(?:notice(?:\s*period)?)\s*[:\-–]\s*([^\n\r,;|●•]+)/i);
  if (match && match[1]) {
    const val = match[1].trim();
    if (val.length < 35) return val;
  }
  if (/immediate|join\s*immediately|0-15\s*days|15\s*days/i.test(text)) {
    return 'Immediate to 15 Days';
  }
  if (/30\s*days/i.test(text)) {
    return 'Immediate to 30 Days';
  }
  return 'Immediate to 15 Days Preferred';
}

export function extractCleanSkills(description: string, detectedTitle = ''): string[] {
  const lines = description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const skills: string[] = [];

  const headerKeywords = [
    'job title', 'job type', 'experience', 'exp', 'job summary', 'key responsibilities',
    'overview', 'responsibilities', 'requirements', 'qualifications', 'about the role',
    'about us', 'summary', 'role summary', 'location', 'contract', 'core skills',
    'technical skills', 'must have', 'good to have', 'skills:', 'skills', 'primary skills'
  ];

  const cleanDetected = detectedTitle ? cleanJobTitle(detectedTitle).toLowerCase() : '';

  for (const l of lines) {
    const lLower = l.toLowerCase();
    const cleanLText = cleanJobTitle(l).toLowerCase();

    // Skip if matches detected title
    if (cleanDetected && (cleanDetected.includes(cleanLText) || cleanLText.includes(cleanDetected) || cleanLText === cleanDetected)) {
      continue;
    }
    // Skip header keywords
    if (headerKeywords.some(hk => lLower.startsWith(hk) || lLower === hk)) {
      continue;
    }
    // Skip experience lines
    if (/^exp(?:erience)?\s*[-:]?\s*\d+/i.test(l)) {
      continue;
    }
    if (l.endsWith(':') && l.split(/\s+/).length <= 4) {
      continue;
    }

    const cleanL = l.replace(/^(?:[\*\-•✅●►✔️▪️]\s*|\d+[\.\)]\s*)/, '').trim();

    if (cleanL.length > 6 && !cleanL.toLowerCase().startsWith('we are looking')) {
      skills.push(cleanL);
    }
  }

  if (!skills.length) {
    return [
      'Technical domain expertise & scalable system development',
      'Designing clean, modular architecture & high-performance solutions',
      'End-to-end implementation, unit testing, and production deployment',
      'Strong analytical, problem-solving, and cross-functional communication skills'
    ];
  }
  return skills.slice(0, 6);
}

export function generateCleanHashtags(title: string): string {
  const validTags: string[] = [];
  const cleanT = cleanJobTitle(title);
  const junkWords = ['and', 'for', 'the', 'with', 'from', 'exp', 'years', 'year', 'yrs', 'position', 'positions', 'medium', 'senior', 'junior', 'professional'];

  for (const word of cleanT.split(/\s+/)) {
    const cleanWords = word.match(/[A-Za-z0-9]+/g) || [];
    for (const w of cleanWords) {
      if (w.length > 2 && !junkWords.includes(w.toLowerCase()) && !/^\d+$/.test(w)) {
        const capitalized = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        const tag = `#${capitalized}`;
        if (!validTags.includes(tag)) {
          validTags.push(tag);
        }
      }
    }
  }

  const defaultTags = ['#Hiring', '#JobAlert', '#ImmediateJoiners', '#RemoteJobs', '#CareerOpportunity', '#TechJobs', '#Forcecraver'];
  for (const dt of defaultTags) {
    if (!validTags.includes(dt)) {
      validTags.push(dt);
    }
  }

  return validTags.slice(0, 10).join(' ');
}

export type TemplateStyle = 'engaging' | 'professional' | 'urgent';

export interface LinkedInPostOptions {
  companyName?: string;
  title?: string;
  location?: string;
  experience?: string;
  skills?: string[] | string;
  salary?: string;
  shiftTiming?: string;
  noticePeriod?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  templateStyle?: TemplateStyle;
}

export function generateLinkedInPost(
  jdText: string,
  options?: LinkedInPostOptions
): string {
  const style = options?.templateStyle || 'engaging';

  // 1. Role Detection
  const cleanTitle = options?.title
    ? cleanJobTitle(options.title)
    : extractRoleFromText(jdText);

  // 2. Experience Extraction
  const expStr = options?.experience && options.experience !== 'Not specified'
    ? options.experience
    : extractExperienceFromText(jdText);

  // 3. Location Detection
  let loc = options?.location || '';
  if (!loc) {
    if (/\b(remote|wfh|work\s*from\s*home)\b/i.test(jdText)) {
      loc = 'Remote (India / Global)';
    } else if (/\b(hybrid)\b/i.test(jdText)) {
      loc = 'Hybrid';
    } else {
      loc = 'Remote';
    }
  }

  // 4. Shift / Work mode
  const shift = options?.shiftTiming || 'Day Shift (India)';

  // 5. Salary / Budget
  const salary = options?.salary || 'Competitive / Best in Industry';

  // 6. Notice Period
  const notice = options?.noticePeriod || extractNoticePeriodFromText(jdText);

  // 7. Skills Extraction
  let skillsList: string[] = [];
  if (options?.skills) {
    if (Array.isArray(options.skills)) {
      skillsList = options.skills;
    } else {
      skillsList = options.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (!skillsList.length) {
    skillsList = extractCleanSkills(jdText, cleanTitle);
  }
  const cleanSkills = skillsList.slice(0, 6);

  // 8. Hashtags
  const hashtags = generateCleanHashtags(cleanTitle);

  // 9. Recruiter Placeholders
  // Requirement: "@Forcecraver Technologies yeh wala @ rehne do and @Rahul Sharma yha pe [enter your name] daal do"
  // Note: Priyanka and Sakshi handle clients, NOT talent acquisition. Never use them as recruiterName.
  const isExcludedRecruiter = (name?: string) => {
    if (!name) return true;
    const lower = name.trim().toLowerCase();
    return (
      lower === '' ||
      lower.includes('priyanka') ||
      lower.includes('sakshi') ||
      lower.includes('[enter your name]')
    );
  };

  const namePlaceholder =
    options?.recruiterName?.trim() && !isExcludedRecruiter(options.recruiterName)
      ? options.recruiterName.trim()
      : '[enter your name]';

  const emailPlaceholder = options?.recruiterEmail?.trim()
    ? options.recruiterEmail.trim()
    : '[enter your email]';

  const phonePlaceholder = options?.recruiterPhone?.trim()
    ? options.recruiterPhone.trim()
    : '[enter your phone]';

  // TEMPLATE 1: Engaging / Viral (Default)
  if (style === 'engaging') {
    const skillsFormatted = cleanSkills.map(s => `✅ ${s}`).join('\n');

    return `🚀 WE ARE HIRING | URGENT REQUIREMENT 🚀

We are actively looking for an ambitious and skilled ${cleanTitle} to join our high-growth team!

📌 Role Snapshot:
💼 Role: ${cleanTitle}
📍 Location: ${loc}
⏳ Experience: ${expStr}
⏰ Shift Timing: ${shift}
⚡ Notice Period: ${notice}
💰 Compensation: ${salary}

🎯 Key Responsibilities & Skillset:
${skillsFormatted}

🌟 Why You Should Apply:
🔹 Opportunity to work on high-impact, modern client projects
🔹 Dynamic, positive, and collaborative culture
🔹 Career acceleration with long-term stability

📩 Interested candidates, kindly share your updated resume:
📧 Email: ${emailPlaceholder}
📱 WhatsApp: ${phonePlaceholder}
(Mention "${cleanTitle}" in the subject or message for express review)

🔄 Know someone in your network who is looking for a job? Tag them in the comments or REPOST to help!

👉 Follow @${namePlaceholder} & @Forcecraver Technologies for more active job updates.

${hashtags}`.trim();
  }

  // TEMPLATE 2: Clean & Professional
  if (style === 'professional') {
    const skillsFormatted = cleanSkills.map(s => `• ${s}`).join('\n');

    return `Career Opportunity: We are looking for a qualified ${cleanTitle}.

Opportunity Overview:
• Position: ${cleanTitle}
• Location: ${loc}
• Experience Required: ${expStr}
• Schedule: ${shift}
• Availability: ${notice}
• Remuneration: ${salary}

Core Competencies Required:
${skillsFormatted}

Application Procedure:
Qualified and prospective candidates are invited to forward their profiles:
• Direct Email: ${emailPlaceholder}
• WhatsApp Contact: ${phonePlaceholder}

Follow @${namePlaceholder} & @Forcecraver Technologies for more job updates.

${hashtags}`.trim();
  }

  // TEMPLATE 3: Urgent & Punchy
  const skillsFormatted = cleanSkills.map(s => `✔️ ${s}`).join('\n');
  return `🔥 URGENT HIRING: ${cleanTitle} 🔥

We are looking for immediate joiners for the following active role:

💼 Role: ${cleanTitle}
📍 Location: ${loc}
⏳ Experience: ${expStr}
⚡ Notice Period: ${notice}
⏰ Shift: ${shift}

Required Stack:
${skillsFormatted}

📩 Quick Connect:
Share your CV on WhatsApp at ${phonePlaceholder} or email ${emailPlaceholder}.

Follow @${namePlaceholder} & @Forcecraver Technologies for more active job updates!

${hashtags}`.trim();
}
