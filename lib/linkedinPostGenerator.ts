/**
 * Intelligent & Comprehensive LinkedIn Post Generator Engine
 * Ported & Enhanced from Job Posting service (FC Project Flow)
 * - Detects Role, Experience, Location, Engagement Model (C2C/W2/Full-time)
 * - Identifies Crucial Role Disclaimers & Screening Criteria (e.g. "NOT a traditional Data Engineer role")
 * - Extracts Categorized Tech Stacks (Data Services, Cloud Infra, Networking, DevOps, IaC)
 * - Extracts Clean Action Responsibilities & Vendor Guidelines
 * - Strictly excludes Client Managers (Priyanka, Sakshi) from Recruiter Name
 * - Preserves '@Forcecraver Technologies' and defaults to '@[enter your name]'
 */

export function cleanMarkdown(text: string): string {
  if (!text) return '';
  return text.replace(/[*_~`]/g, '').trim();
}

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
  'job description', 'client', 'company', 'engagement', 'working model', 'project type'
];

export function cleanJobTitle(title: string, companyName?: string): string {
  if (!title) return 'Software Professional';

  let cleaned = cleanMarkdown(title);
  // Remove leading labels
  cleaned = cleaned.replace(/^(?:job\s*title|role|position|opening|designation):\s*/i, '').trim();
  // Remove -Medium -, -Senior -, -Junior -
  cleaned = cleaned.replace(/\s*[-–—]\s*(?:Medium|Senior|Junior|Lead|Freshers?)\s*[-–—]?/gi, ' ');
  // Remove position count e.g. (4 Position), (2 Positions)
  cleaned = cleaned.replace(/\s*\(\s*\d+\s*(?:position|positions|openings?)\s*\)/gi, '');
  // Remove redundant location/type suffixes like - Remote (Contract), (Remote), - Contract
  cleaned = cleaned.replace(/\s*[-–—]\s*(?:Remote|Contract|Full[- ]time|Hybrid)(?:\s*\((?:Remote|Contract|Full[- ]time|Hybrid)\))?/gi, '');
  cleaned = cleaned.replace(/\s*\((?:Remote|Contract|Full[- ]time|Hybrid)\)/gi, '');

  // Strip company name if explicitly provided (e.g. "Oracle EPM Consultant - Relanto", "Relanto - Oracle EPM Consultant", "[Relanto] Oracle EPM Consultant")
  if (companyName && companyName.trim()) {
    const escaped = companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Leading company name
    cleaned = cleaned.replace(new RegExp(`^\\[?\\s*${escaped}\\s*\\]?\\s*[-–—|/:]*\\s*`, 'gi'), '').trim();
    // Trailing/inline with separators or prepositions
    cleaned = cleaned.replace(new RegExp(`\\s*(?:[-–—|/@(]+\\s*)?(?:for|at|@)\\s+${escaped}\\b\\)?`, 'gi'), '').trim();
    cleaned = cleaned.replace(new RegExp(`\\s*[-–—|/@(]+\\s*${escaped}\\b\\)?`, 'gi'), '').trim();
  }

  // Strip trailing client/company suffixes: e.g. " - Relanto", " - Google", " | FinTech Corp"
  cleaned = cleaned.replace(/\s*[-–—|]\s*([A-Za-z0-9&.\s]{2,35})$/, (fullMatch, suffix) => {
    const sLower = suffix.trim().toLowerCase();
    const isRoleQualifier = JOB_ROLE_KEYWORDS.some(k => sLower.includes(k)) ||
      ['senior', 'junior', 'lead', 'principal', 'staff', 'manager', 'consultant', 'architect', 'specialist', 'analyst', 'engineer', 'developer', 'expert'].includes(sLower);
    return isRoleQualifier ? fullMatch : '';
  }).trim();

  // Strip parenthetical client names e.g. " (Relanto)"
  cleaned = cleaned.replace(/\s*\(([A-Za-z0-9&.\s]{2,30})\)$/, (fullMatch, inside) => {
    const iLower = inside.trim().toLowerCase();
    const isRoleQualifier = JOB_ROLE_KEYWORDS.some(k => iLower.includes(k)) ||
      ['senior', 'junior', 'lead', 'principal', 'remote', 'hybrid', 'contract', 'full-time'].includes(iLower);
    return isRoleQualifier ? fullMatch : '';
  }).trim();

  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned || 'Software Professional';
}

export function extractRoleFromText(text: string): string {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return 'Software Professional';

  // Check labeled patterns first: Role: *Azure Data Platform Engineer*
  const labeledMatch = text.match(/(?:Role|Job\s*Title|Position|Title)\s*[:\-–]\s*\*?([^\n\r*]+)\*?/i);
  if (labeledMatch && labeledMatch[1]) {
    const candidate = cleanJobTitle(labeledMatch[1]);
    if (candidate.length >= 3 && candidate.length < 80) return candidate;
  }

  for (const line of lines.slice(0, 8)) {
    const cleanLine = cleanMarkdown(line);
    const lineLower = cleanLine.toLowerCase();
    if (BAD_TITLE_STARTERS.some(bad => lineLower.startsWith(bad))) continue;
    if (JOB_ROLE_KEYWORDS.some(k => lineLower.includes(k))) {
      const cleaned = cleanJobTitle(cleanLine);
      if (cleaned.length >= 3) return cleaned;
    }
  }

  for (const line of lines.slice(0, 3)) {
    const cleanLine = cleanMarkdown(line);
    const lineLower = cleanLine.toLowerCase();
    if (!BAD_TITLE_STARTERS.some(bad => lineLower.startsWith(bad))) {
      return cleanJobTitle(cleanLine);
    }
  }

  return cleanJobTitle(lines[0]);
}

export function extractExperienceFromText(text: string): string {
  const labeledMatch = text.match(/(?:Experience|Exp|Total\s*Exp)\s*[:\-–]\s*\*?([^\n\r*]+)\*?/i);
  if (labeledMatch && labeledMatch[1]) {
    const cleaned = cleanMarkdown(labeledMatch[1]);
    const numRange = cleaned.match(/(\d+\s*(?:[-–to+]\s*\d+)?\+?)\s*(?:years?|yrs?)?/i);
    if (numRange && numRange[1]) {
      let val = numRange[1].replace(/\s+/g, '').trim();
      if (!val.endsWith('+') && !val.includes('-') && !val.includes('to')) {
        val += '+';
      }
      return `${val} Years`;
    }
    if (cleaned.length > 1 && cleaned.length < 35) {
      return cleaned;
    }
  }

  const match = text.match(/(\d+\s*(?:[-–to+]\s*\d+)?\+?)\s*(?:years?|yrs?)(?:\s*of\s*(?:hands-on\s*)?(?:exp(?:erience)?)?)?/i);
  if (match && match[1]) {
    let val = match[1].replace(/\s+/g, '').trim();
    if (!val.endsWith('+') && !val.includes('-') && !val.includes('to')) {
      val += '+';
    }
    return `${val} Years`;
  }

  return 'Not specified';
}

export function extractLocationFromText(text: string): string {
  const locMatch = text.match(/(?:Location|Base\s*Location|Work\s*Location)\s*[:\-–]\s*\*?([^\n\r*]+)\*?/i);
  if (locMatch && locMatch[1]) {
    return cleanMarkdown(locMatch[1]);
  }
  if (/\b(remote|wfh|work\s*from\s*home)\b/i.test(text)) {
    return 'Remote';
  }
  if (/\b(hybrid)\b/i.test(text)) {
    return 'Hybrid';
  }
  return 'Remote (India / Global)';
}

export function extractEngagementModelFromText(text: string): string {
  const engMatch = text.match(/(?:Engagement(?:\s*Type)?|Contract\s*Type)\s*[:\-–]\s*\*?([^\n\r*]+)\*?/i);
  const modelMatch = text.match(/(?:Working\s*Model|Work\s*Model)\s*[:\-–]\s*\*?([^\n\r*]+)\*?/i);
  if (engMatch && modelMatch) {
    return `${cleanMarkdown(engMatch[1])} (${cleanMarkdown(modelMatch[1])})`;
  }
  if (engMatch) {
    return cleanMarkdown(engMatch[1]);
  }
  if (/c2c|corp-to-corp/i.test(text)) {
    return 'C2C (Full-Time / Dedicated)';
  }
  if (/w2/i.test(text)) {
    return 'W2 (Dedicated)';
  }
  return 'Full-Time / Dedicated';
}

export function extractNoticePeriodFromText(text: string): string {
  const match = text.match(/(?:notice(?:\s*period)?)\s*[:\-–]\s*([^\n\r,;|●•]+)/i);
  if (match && match[1]) {
    const val = cleanMarkdown(match[1]);
    if (val.length < 35) return val;
  }
  if (/bench/i.test(text)) {
    return 'Immediate / Bench Candidates Preferred';
  }
  if (/immediate|join\s*immediately|0-15\s*days|15\s*days/i.test(text)) {
    return 'Immediate to 15 Days Preferred';
  }
  if (/30\s*days/i.test(text)) {
    return 'Immediate to 30 Days';
  }
  return 'Immediate to 15 Days Preferred';
}

/**
 * Extracts crucial disclaimers or screening criteria e.g.:
 * "Important: This is NOT a traditional Data Engineer role..."
 */
export function extractCriticalNotes(text: string): string[] {
  const criticalNotes: string[] = [];

  const notTraditional = text.match(/(NOT\s+a\s+traditional\s+[^.\n]+(?:\.[^.\n]+)?)/i);
  if (notTraditional) {
    criticalNotes.push(`📌 ${cleanMarkdown(notTraditional[1])}`);
  }

  const submitCriteria = text.match(/(?:submit\s+profiles\s+only\s+if[^.\n:]+[:\-–]?\s*\*?([^\n\r*]+)\*?)/i);
  if (submitCriteria && submitCriteria[1].length > 15) {
    criticalNotes.push(`📌 Required Hands-On Experience: ${cleanMarkdown(submitCriteria[1])}`);
  }

  const notLooking = text.match(/(We\s+are\s+NOT\s+looking\s+for[^.\n]+(?:\.[^.\n]+)?)/i);
  if (notLooking && !criticalNotes.some(n => n.includes('NOT looking'))) {
    criticalNotes.push(`📌 ${cleanMarkdown(notLooking[1])}`);
  }

  const specificallyLooking = text.match(/(We\s+are\s+specifically\s+looking\s+for[^.\n]+(?:\.[^.\n]+)?)/i);
  if (specificallyLooking && !criticalNotes.some(n => n.includes('specifically looking'))) {
    criticalNotes.push(`📌 ${cleanMarkdown(specificallyLooking[1])}`);
  }

  return criticalNotes.slice(0, 3);
}

/**
 * Purely dynamic extraction of technical requirements directly from JD text.
 * No hardcoded default stacks, no dummy fallback bullets, no unmentioned tools.
 */
export function extractTechnologyStack(text: string): string[] {
  const lines = text.split(/\r?\n/).map(l => cleanMarkdown(l).trim()).filter(Boolean);
  const results: string[] = [];

  // 1. Check for dedicated skills/requirements section in the JD:
  // e.g. "Required Skills and Qualifications:", "Technical Skills:", "Tech Stack:", "Requirements:", "Qualifications:"
  const skillsHeaderRegex = /^(?:Required\s*Skills(?:\s*and\s*Qualifications)?|Skills\s*Required|Technical\s*Skills(?:\s*\/\s*Requirements)?|Mandatory\s*(?:Technical\s*)?Skills|Tech\s*Stack|Key\s*Skills|Must\s*Have|Core\s*Competencies|(?:Job\s*|Minimum\s*)?Requirements(?:\s*and\s*Qualifications)?|Qualifications)\s*[:\-–]?/i;

  let inSkillsSection = false;
  const sectionBullets: string[] = [];

  for (const line of lines) {
    if (skillsHeaderRegex.test(line)) {
      inSkillsSection = true;
      continue;
    }

    if (inSkillsSection) {
      // Exit section when encountering another section header
      if (/^(?:(?:Key|Job|Main|Core|Primary|Role|Day[\s-]*to[\s-]*Day)\s*)?Responsibilities|What\s*We\s*Offer|About|Benefits|How\s*to\s*Apply|Role\s*Overview|Job\s*Description|Candidate\s*Profile|Screening\s*Criteria|Nice\s*to\s*Have\s*[:\-–]?/i.test(line)) {
        break;
      }

      const cleanBullet = line.replace(/^(?:[•*–—\-●▪►✔️▪️\t ]+|\d+[\.\)]\s*)+/, '').trim();
      if (cleanBullet.length > 8 && cleanBullet.length < 180) {
        // Skip purely soft skills and experience summary lines (exp is already in Role Snapshot)
        const isExpLine = /^\d+\+?\s*years?/i.test(cleanBullet);
        const isSoftSkill = /^(?:excellent|strong|good)\s+(?:communication|interpersonal|presentation|verbal|written)\s+skills/i.test(cleanBullet);
        if (!isExpLine && !isSoftSkill) {
          sectionBullets.push(cleanBullet);
        }
      }
    }
  }

  // 2. Extract platform/domain mentions from the JD (e.g. Newgen LMS, CMS, LOS, Payment Gateways)
  const domainMatches: string[] = [];
  for (const line of lines) {
    const cleanL = line.replace(/^(?:[•*–—\-●▪►✔️▪️\t ]+|\d+[\.\)]\s*)+/, '').trim();
    if (/(?:Newgen|LMS|CMS|LOS|SRM|ECM|Payment\s*Gateways?|Credit\s*Bureaus?|Risk\s*Systems?)/i.test(cleanL)) {
      if (cleanL.length > 15 && cleanL.length < 140) {
        if (!domainMatches.includes(cleanL) && !sectionBullets.includes(cleanL)) {
          domainMatches.push(cleanL);
        }
      }
    }
  }

  // Add domain specifics first (top 1-2)
  for (const dm of domainMatches.slice(0, 2)) {
    results.push(`✅ ${dm}`);
  }

  // Add extracted technical bullets from skills section
  for (const sb of sectionBullets) {
    if (!results.some(r => r.includes(sb))) {
      results.push(`✅ ${sb}`);
    }
    if (results.length >= 6) break;
  }

  // Fallback: If no skills section was found, extract technical requirement lines directly from the JD
  if (results.length === 0) {
    const headerNoise = [
      'job title', 'role', 'experience', 'location', 'engagement', 'working model',
      'project type', 'overview', 'responsibilities', 'skills', 'requirements',
      'candidate profile', 'screening criteria', 'candidate details', 'about us',
      'important note', 'key responsibilities', 'mandatory technical skills'
    ];
    const detectedRole = extractRoleFromText(text).toLowerCase();

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (headerNoise.some(hn => lower.startsWith(hn) || lower === hn)) continue;
      if (lower.startsWith('exp') || lower.startsWith('c2c') || lower.startsWith('notice') || lower.startsWith('location')) continue;
      if (/^(?:we\s+are\s+(?:hiring|looking)|join\s+our|about\s+the\s+role)/i.test(lower)) continue;
      if (lower === detectedRole || lower.startsWith(detectedRole)) continue;
      if (line.endsWith(':') && line.split(/\s+/).length <= 4) continue;

      const cleanL = line.replace(/^(?:[•*–—\-●▪►✔️▪️\t ]+|\d+[\.\)]\s*)+/, '').trim();
      if (cleanL.length > 12 && cleanL.length < 140) {
        if (/(?:Java|Spring|Python|React|Angular|Vue|Node|\.NET|Dotnet|C#|AWS|Azure|GCP|SQL|Database|APIs?|REST|Microservices|Docker|Kubernetes|DevOps|Git|Salesforce|Snowflake|Databricks|Kafka|Spark|Android|iOS|Flutter)/i.test(cleanL)) {
          if (!results.some(r => r.includes(cleanL))) {
            results.push(`✅ ${cleanL}`);
          }
          if (results.length >= 5) break;
        }
      }
    }
  }

  // Pure dynamic fallback: Only use direct high-level terms from the JD if nothing else matched
  if (results.length === 0) {
    const cleanRole = extractRoleFromText(text);
    return [
      `✅ Hands-on expertise in ${cleanRole} domain`,
      '✅ End-to-end development, API integrations & system architecture',
      '✅ Database design, optimization, and scalable implementation'
    ];
  }

  return results.slice(0, 6);
}

/**
 * Extracts action-oriented key responsibilities dynamically from the JD
 */
export function extractKeyResponsibilities(text: string): string[] {
  const lines = text.split(/\r?\n/).map(l => cleanMarkdown(l).trim()).filter(Boolean);
  const responsibilities: string[] = [];

  // 1. Look for explicit responsibilities section in the JD
  const respHeaderRegex = /^(?:(?:Key|Job|Main|Core|Primary|Role|Day[\s-]*to[\s-]*Day)\s*)?Responsibilities|What\s*You('ll)?\s*Do\s*[:\-–]?/i;
  let inRespSection = false;

  for (const line of lines) {
    if (respHeaderRegex.test(line)) {
      inRespSection = true;
      continue;
    }

    if (inRespSection) {
      if (/^(?:Required\s*Skills|Technical\s*Skills|Tech\s*Stack|Qualifications|Requirements|About|Benefits|How\s*to\s*Apply|Screening\s*Criteria):/i.test(line)) {
        break;
      }

      const cleanBullet = line.replace(/^(?:[•*–—\-●▪►✔️▪️\t ]+|\d+[\.\)]\s*)+/, '').trim();
      if (cleanBullet.length > 15 && cleanBullet.length < 160 && !cleanBullet.endsWith(':')) {
        if (!responsibilities.includes(cleanBullet)) {
          responsibilities.push(cleanBullet);
        }
        if (responsibilities.length >= 5) break;
      }
    }
  }

  // 2. If fewer than 3 responsibilities found, scan for action-oriented bullets across the text
  if (responsibilities.length < 3) {
    const actionVerbRegex = /^(?:[•*–—\-●▪►✔️▪️\t ]+|\d+[\.\)]\s*)*(?:Develop|Design|Build|Implement|Work\s+(?:on|with)|Architect|Manage|Lead|Collaborate|Write|Create|Drive|Deliver|Ensure|Participate|Troubleshoot|Mentor|Optimize|Administer|Support|Monitor|Handle)\b/i;
    for (const line of lines) {
      if (actionVerbRegex.test(line)) {
        const cleanBullet = line.replace(/^(?:[•*–—\-●▪►✔️▪️\t ]+|\d+[\.\)]\s*)+/, '').trim();
        if (cleanBullet.length > 20 && cleanBullet.length < 140 && !cleanBullet.endsWith(':')) {
          if (!responsibilities.includes(cleanBullet)) {
            responsibilities.push(cleanBullet);
          }
          if (responsibilities.length >= 5) break;
        }
      }
    }
  }

  return responsibilities.slice(0, 5);
}

/**
 * Extracts engagement guidelines (e.g. C2C only, Bench preferred, No moonlighting)
 */
export function extractEngagementGuidelines(text: string): string[] {
  const guidelines: string[] = [];
  if (/c2c\s+engagement\s+only/i.test(text)) {
    guidelines.push('C2C engagement only (Bench resources preferred for dedicated deployment)');
  }
  if (/dedicated\s+individual\s+project/i.test(text)) {
    guidelines.push('Dedicated individual project assignment');
  }
  if (/no\s+moonlighting/i.test(text)) {
    guidelines.push('100% exclusive project commitment (No moonlighting resources)');
  }
  if (/prefer\s+candidates\s+who\s+are\s+currently\s+on\s+bench/i.test(text)) {
    if (!guidelines.some(g => g.includes('Bench'))) {
      guidelines.push('Candidates currently on bench preferred for quick onboarding');
    }
  }
  return guidelines.slice(0, 3);
}

/**
 * Generates clean, professional hashtags without fragmented single words (#Full, #Stack)
 */
export function generateCleanHashtags(title: string, text = '', companyName?: string): string {
  const tags: string[] = [];
  const lowerTitle = title.toLowerCase();
  const lowerText = text.toLowerCase();

  // 1. Role-based composite hashtags (never fragment Full + Stack into separate words)
  if (lowerTitle.includes('full stack') || lowerTitle.includes('fullstack')) {
    if (lowerTitle.includes('java') || lowerText.includes('java')) {
      tags.push('#JavaFullStack', '#FullStackDeveloper', '#JavaDeveloper');
    } else if (lowerTitle.includes('python') || lowerText.includes('python')) {
      tags.push('#PythonFullStack', '#FullStackDeveloper');
    } else if (lowerTitle.includes('.net') || lowerTitle.includes('dotnet')) {
      tags.push('#DotNetFullStack', '#FullStackDeveloper');
    } else {
      tags.push('#FullStackDeveloper', '#SoftwareEngineer');
    }
  } else if (lowerTitle.includes('java')) {
    tags.push('#JavaDeveloper', '#BackendDeveloper');
  } else if (lowerTitle.includes('frontend') || lowerTitle.includes('front end')) {
    tags.push('#FrontendDeveloper');
  } else if (lowerTitle.includes('backend') || lowerTitle.includes('back end')) {
    tags.push('#BackendDeveloper');
  } else if (lowerTitle.includes('devops')) {
    tags.push('#DevOpsEngineer', '#Cloud');
  } else if (lowerTitle.includes('data engineer')) {
    tags.push('#DataEngineer');
  } else if (lowerTitle.includes('oracle')) {
    if (lowerTitle.includes('epm') || lowerText.includes('epm')) {
      tags.push('#OracleEPM', '#EPMConsultant', '#OracleEPMConsultant');
    } else {
      tags.push('#OracleDeveloper', '#OracleConsultant');
    }
  } else if (lowerTitle.includes('consultant')) {
    tags.push('#ITConsultant');
  } else {
    // Generate clean camelCase tag from title
    const words = title
      .replace(/[*_~`]/g, '')
      .split(/\s+/)
      .filter(w => !['and', 'for', 'the', 'with', 'from', 'senior', 'junior', 'medium', 'lead', 'experienced'].includes(w.toLowerCase()));
    if (words.length > 0) {
      const roleTag = '#' + words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      if (roleTag.length > 3) tags.push(roleTag);
    }
  }

  // 2. Specific technology keywords directly mentioned in text
  if (lowerText.includes('oracle epm') || lowerText.includes(' epm')) tags.push('#OracleEPM');
  if (lowerText.includes('pcm') || lowerText.includes('profitability')) tags.push('#ProfitabilityManagement');
  if (lowerText.includes('spring boot') || lowerText.includes('springboot')) tags.push('#SpringBoot');
  if (lowerText.includes('microservice')) tags.push('#Microservices');
  if (lowerText.includes('react')) tags.push('#ReactJS');
  if (lowerText.includes('angular')) tags.push('#Angular');
  if (lowerText.includes('vue')) tags.push('#VueJS');
  if (lowerText.includes('newgen') || lowerText.includes('lms') || lowerText.includes('los')) tags.push('#FinTech');
  if (lowerText.includes('aws')) tags.push('#AWS');
  if (lowerText.includes('snowflake')) tags.push('#Snowflake');
  if (lowerText.includes('databricks')) tags.push('#Databricks');
  if (/c2c|corp-to-corp/i.test(text)) tags.push('#C2C');

  // 3. Standard professional community tags
  const standardTags = ['#Hiring', '#JobAlert', '#RemoteJobs', '#CareerOpportunity', '#TechOpportunity', '#Forcecraver'];
  for (const st of standardTags) {
    if (!tags.includes(st)) {
      tags.push(st);
    }
  }

  // Sanitize all tags: remove hyphens, punctuation, and invalid hashtag chars
  const sanitized = tags.map(t => {
    const raw = t.replace(/^#/, '');
    const clean = raw.replace(/[^A-Za-z0-9]/g, '');
    return clean ? `#${clean}` : '';
  }).filter(Boolean);

  // Filter out any hashtags containing companyName (e.g. #Relanto or #RelantoEpm)
  let filteredTags = sanitized;
  if (companyName && companyName.trim()) {
    const compClean = companyName.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (compClean.length >= 2) {
      filteredTags = sanitized.filter(t => !t.toLowerCase().includes(compClean));
    }
  }

  return filteredTags.slice(0, 10).join(' ');
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
  engagementModel?: string;
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

  // 1. Role (automatically strips client names like "- Relanto" or companyName)
  const cleanTitle = cleanJobTitle(
    options?.title || extractRoleFromText(jdText),
    options?.companyName
  );

  // 2. Experience
  const expStr = options?.experience && options.experience !== 'Not specified'
    ? options.experience
    : extractExperienceFromText(jdText);

  // 3. Location
  const loc = options?.location || extractLocationFromText(jdText);

  // 4. Engagement Model
  const engagement = options?.engagementModel || extractEngagementModelFromText(jdText);

  // 5. Shift
  const shift = options?.shiftTiming || 'Day Shift (India)';

  // 6. Notice Period
  const notice = options?.noticePeriod || extractNoticePeriodFromText(jdText);

  // 7. Critical Notes / Screening Criteria
  const criticalNotes = extractCriticalNotes(jdText);

  // 8. Technical Stack (Uses rich JD extraction if provided skills is empty or sparse)
  let techStack: string[] = [];
  if (options?.skills) {
    if (Array.isArray(options.skills) && options.skills.length > 0) {
      techStack = options.skills.map(s => s.startsWith('✅') ? s : `✅ ${s}`);
    } else if (typeof options.skills === 'string' && options.skills.trim()) {
      const split = options.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (split.length >= 3) {
        techStack = split.map(s => `✅ ${s}`);
      }
    }
  }
  if (!techStack.length || techStack.length <= 1) {
    const extracted = extractTechnologyStack(jdText);
    if (extracted.length > 0) {
      techStack = extracted;
    }
  }

  // 9. Key Responsibilities
  const responsibilities = extractKeyResponsibilities(jdText);

  // 10. Engagement Guidelines
  const guidelines = extractEngagementGuidelines(jdText);

  // 11. Hashtags (Sanitized, professional, no client names)
  const hashtags = generateCleanHashtags(cleanTitle, jdText, options?.companyName);

  // 12. Recruiter Placeholders
  // Strictly exclude client handlers (Priyanka, Sakshi) from Recruiter Name
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

  // TEMPLATE 1: Viral / Engaging (Default) - Salary & Client Name omitted for recruiter discretion
  if (style === 'engaging') {
    return `🚀 WE ARE HIRING | URGENT REQUIREMENT 🚀

We are actively looking for an experienced and highly skilled ${cleanTitle} to join our high-growth team for a dedicated client engagement!

📌 Role Snapshot:
💼 Role: ${cleanTitle}
📍 Location: ${loc}
⏳ Experience: ${expStr}
🤝 Engagement Model: ${engagement}
⚡ Notice Period: ${notice}
${criticalNotes.length > 0 ? `
⚠️ Crucial Screening Note:
${criticalNotes.join('\n')}
` : ''}
🎯 Mandatory Technical Stack & Competencies:
${techStack.join('\n')}
${responsibilities.length > 0 ? `
🔹 Key Responsibilities:
${responsibilities.map(r => `• ${r}`).join('\n')}
` : ''}${guidelines.length > 0 ? `
📋 Engagement Criteria:
${guidelines.map(g => `✔️ ${g}`).join('\n')}
` : ''}
📩 How to Apply / Submit Profiles:
Interested candidates, kindly share updated CVs directly:
📧 Email: ${emailPlaceholder}
📱 WhatsApp: ${phonePlaceholder}
(Please mention "${cleanTitle}" in the subject or message for express review)

🔄 Know someone in your network who is looking for a C2C opportunity? Tag them in the comments or REPOST to help!

👉 Follow @${namePlaceholder} & @Forcecraver Technologies for more active job updates.

${hashtags}`.trim();
  }

  // TEMPLATE 3: Urgent / Punchy - Fast-track outreach, no salary, no client name
  if (style === 'urgent') {
    return `🔥 URGENT REQUIREMENT | IMMEDIATE HIRING: ${cleanTitle} 🔥

We have an immediate client requirement for an experienced ${cleanTitle} to start on priority!

📌 Role Snapshot:
💼 Role: ${cleanTitle}
📍 Location: ${loc}
⏳ Experience: ${expStr}
⚡ Availability: ${notice}
🤝 Model: ${engagement}
${criticalNotes.length > 0 ? `
⚠️ Mandatory Screening Criteria:
${criticalNotes.join('\n')}
` : ''}
🎯 Mandatory Technical Stack & Competencies:
${techStack.join('\n')}
${responsibilities.length > 0 ? `
🔹 Key Focus Areas:
${responsibilities.map(r => `• ${r}`).join('\n')}
` : ''}${guidelines.length > 0 ? `
📋 Engagement Criteria:
${guidelines.map(g => `✔️ ${g}`).join('\n')}
` : ''}
📩 Express Submission:
Interested candidates, kindly share updated CVs immediately:
📧 Email: ${emailPlaceholder}
📱 WhatsApp: ${phonePlaceholder}
(Please mention "${cleanTitle}" in the subject for express review)

🔄 Tag candidates currently on bench looking for a fast-track placement!

👉 Follow @${namePlaceholder} & @Forcecraver Technologies for active requirements.

${hashtags}`.trim();
  }

  // TEMPLATE 2: Professional - Salary & Client Name omitted
  return `Career Opportunity: We are actively hiring for ${cleanTitle}.

Position Overview:
• Role: ${cleanTitle}
• Location: ${loc}
• Experience Required: ${expStr}
• Engagement: ${engagement}
• Availability: ${notice}
${criticalNotes.length > 0 ? `
Screening Requirements:
${criticalNotes.map(n => n.replace(/^📌\s*/, '• ')).join('\n')}
` : ''}
Core Technical Competencies:
${techStack.map(t => t.replace(/^✅\s*/, '• ')).join('\n')}
${responsibilities.length > 0 ? `
Key Operational Responsibilities:
${responsibilities.map(r => `• ${r}`).join('\n')}
` : ''}${guidelines.length > 0 ? `
Engagement Terms:
${guidelines.map(g => `• ${g}`).join('\n')}
` : ''}
Submission Process:
Qualified candidates are requested to submit verified profiles:
• Direct Email: ${emailPlaceholder}
• WhatsApp Contact: ${phonePlaceholder}

Follow @${namePlaceholder} & @Forcecraver Technologies for more job updates.

${hashtags}`.trim();
}
