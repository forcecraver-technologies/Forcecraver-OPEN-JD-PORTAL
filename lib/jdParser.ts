/**
 * Enhanced deterministic, rule-based parser for raw pasted Job Descriptions.
 * Extracts key fields using regex heuristics without any AI or external services.
 */

export interface ParsedJDFields {
  companyName?: string;
  contactPerson?: string;
  jobTitle?: string;
  location?: string;
  experience?: string;
  salaryBudget?: string;
  skills?: string;
  uan?: string;
  notes?: string;
  shiftTiming?: string;
  jobDescription: string;
}

const KNOWN_CITIES = [
  'Ahmedabad', 'Bengaluru', 'Bangalore', 'Pune', 'Mumbai', 'Hyderabad',
  'Chennai', 'Delhi', 'Noida', 'Gurugram', 'Gurgaon', 'Kolkata', 'Surat',
  'Vadodara', 'Jaipur', 'Indore', 'Chandigarh', 'Kochi'
];

const COMMON_TECH_SKILLS = [
  // Salesforce & CRM Ecosystem
  'Salesforce', 'Apex', 'Lightning Web Components', 'LWC', 'Service Cloud',
  'Sales Cloud', 'Education Cloud', 'Experience Cloud', 'Marketing Cloud',
  'Health Cloud', 'Financial Services Cloud', 'Commerce Cloud', 'SOQL', 'SOSL',
  'Salesforce Platform Developer', 'Visualforce', 'Aura Components',
  'ServiceNow', 'SAP', 'Workday', 'HubSpot', 'Zoho CRM',

  // Data & Cloud
  'Snowflake', 'dbt', 'Dagster', 'dlt', 'Fivetran', 'Airflow', 'Databricks',
  'Apache Spark', 'Spark', 'Kafka', 'ETL/ELT', 'ETL', 'ELT', 'Data Modeling',
  'Data Modelling', 'Data Warehousing', 'Data Engineering', 'BigQuery',
  'Redshift', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra',
  'DynamoDB', 'Elasticsearch', 'Power BI', 'Tableau',

  // Cloud Platforms & Infrastructure
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
  'CI/CD', 'Linux', 'Git',

  // Backend & Languages
  'Java', 'Spring Boot', 'Hibernate', 'JPA', 'Microservices', 'Python', 'Django', 'FastAPI',
  'Flask', 'Node.js', 'Express', 'TypeScript', 'JavaScript', 'C++', 'C#',
  '.NET', 'Dotnet', '.NET Core', 'PHP', 'Ruby', 'Golang', 'Go', 'Rust', 'Scala',

  // Frontend & Mobile
  'React', 'Next.js', 'Angular', 'Vue.js', 'Vue', 'Tailwind CSS', 'HTML5', 'HTML', 'CSS3', 'CSS', 'Redux',
  'Flutter', 'React Native', 'Swift', 'Kotlin', 'iOS', 'Android',

  // Database & Storage
  'SQL', 'PostgreSQL', 'MySQL', 'NoSQL', 'MongoDB', 'Redis', 'Cassandra',
  'DynamoDB', 'Elasticsearch', 'Database Schema Design', 'SQL Performance Tuning',

  // APIs, Platforms & Architecture
  'REST APIs', 'RESTful APIs', 'REST', 'SOAP APIs', 'SOAP', 'GraphQL', 'gRPC', 'API Integration',
  'Oracle EPM', 'EPM', 'PCM', 'Profitability and Cost Management', 'Hyperion', 'Enterprise Performance Management',
  'General Ledger', 'GL', 'Cost Allocation', 'ERP',
  'Newgen', 'LMS', 'CMS', 'LOS', 'SRM', 'ECM', 'Payment Gateways', 'Credit Bureaus',
  'System Architecture', 'Security Architecture',

  // Methodologies & Practices
  'Agile', 'Scrum', 'Kanban',

  // Testing & QA
  'Selenium', 'Playwright', 'Jest', 'Cypress', 'Automation Testing',

  // Design & Product
  'Figma', 'UI/UX'
];

export function parseRawJobDescription(rawText: string): ParsedJDFields {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { jobDescription: '' };
  }

  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result: ParsedJDFields = {
    jobDescription: trimmed,
  };

  // -------------------------------------------------------------
  // 1. EXTRACT JOB TITLE
  // -------------------------------------------------------------
  const titlePatterns = [
    /(?:[*_~#`]*Position|Job\s*Title|Title|Role|Opening|Designation)[*_~#`]*\s*[:\-–●•]\s*([^\n\r●•|]+)/i,
    /(?:Hiring\s+for|Looking\s+for|Requirement\s+for|Urgent\s+Requirement\s+for)\s*[:\-–●•]?\s*([^\n\r●•|]+)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      let cleaned = cleanTitleString(match[1]);
      if (cleaned.length > 2 && cleaned.length < 80) {
        result.jobTitle = cleaned;
        break;
      }
    }
  }

  // Fallback: Check top lines for role keywords
  if (!result.jobTitle && lines.length > 0) {
    const titleKeywords = ['developer', 'engineer', 'architect', 'lead', 'manager', 'designer', 'analyst', 'specialist', 'consultant', 'qa', 'tester', 'administrator'];
    for (const line of lines.slice(0, 5)) {
      if (titleKeywords.some(k => line.toLowerCase().includes(k)) && line.length < 100) {
        result.jobTitle = cleanTitleString(line);
        break;
      }
    }
  }

  // -------------------------------------------------------------
  // 2. EXTRACT EXPERIENCE
  // -------------------------------------------------------------
  const expMatch = trimmed.match(/(?:Experience|Exp|Total\s*Exp)\s*[:\-–●•]\s*([^\n\r●•|]+)/i);
  if (expMatch && expMatch[1]) {
    const cleaned = cleanString(expMatch[1]);
    if (cleaned.length > 1 && cleaned.length < 40) {
      result.experience = cleaned;
    }
  }

  if (!result.experience) {
    const standaloneExpMatch = trimmed.match(/(\b\d+\s*[-–to+]+\s*(?:\d+)?\s*(?:years?|yrs?|yr)\b(?:\s*(?:of)?\s*(?:hands-on\s*)?(?:exp|experience))?)/i);
    if (standaloneExpMatch && standaloneExpMatch[1]) {
      let expText = cleanString(standaloneExpMatch[1]);
      expText = expText.replace(/\s*(?:of\s*(?:hands-on\s*)?(?:exp(?:erience)?)?|exp(?:erience)?)$/i, '').trim();
      result.experience = expText;
    }
  }

  // -------------------------------------------------------------
  // 3. EXTRACT LOCATION & WORK MODE
  // -------------------------------------------------------------
  let isRemote = false;
  let isHybrid = false;
  let isOffshore = false;
  if (/\b(remote|work\s*from\s*home|wfh)\b/i.test(trimmed)) {
    isRemote = true;
  }
  if (/\b(hybrid)\b/i.test(trimmed)) {
    isHybrid = true;
  }
  if (/\b(offshore|onsite|on-site)\b/i.test(trimmed)) {
    isOffshore = true;
  }

  let detectedCity: string | null = null;
  const locMatch = trimmed.match(/(?:Job\s*Location|Location|Base\s*Location|Work\s*Location|City)\s*[:\-–●•]\s*([^\n\r●•|]+)/i);
  if (locMatch && locMatch[1]) {
    detectedCity = cleanString(locMatch[1]);
  }

  if (!detectedCity) {
    for (const city of KNOWN_CITIES) {
      const regex = new RegExp(`\\b${city}\\b`, 'i');
      if (regex.test(trimmed)) {
        detectedCity = city;
        break;
      }
    }
  }

  if (detectedCity) {
    if (isRemote && !detectedCity.toLowerCase().includes('remote')) {
      result.location = `Remote (${detectedCity})`;
    } else if (isHybrid && !detectedCity.toLowerCase().includes('hybrid')) {
      result.location = `Hybrid (${detectedCity})`;
    } else {
      result.location = detectedCity;
    }
  } else if (isRemote) {
    result.location = 'Remote';
  } else if (isOffshore) {
    result.location = 'Offshore';
  }

  // -------------------------------------------------------------
  // 4. EXTRACT COMPANY NAME
  // -------------------------------------------------------------
  const companyPatterns = [
    /(?:Company(?:\s*Name)?|Client|Employer|Organization|Org)\s*[:\-–●•]\s*([^\n\r,;|●•]+)/i,
    /^\*([A-Za-z0-9&]{3,30})\*\s*(?:Need\s+number|Need\s+profile|Requirement|Positions?)?/im,
    /(?:work\s+(?:on|with)|working\s+with|client\s+is|for)\s+([A-Z][A-Za-z0-9]+)(?:’s|'s)?\s+(?:LMS|CMS|LOS|SRM|ECM|platforms?|products?|systems?)/i,
    /Copyright\s*(?:©|\(c\))\s*(?:\d{4})?\s*([A-Za-z0-9\s&.,]+?)(?:\.|\s+All Rights|\s*\||\n|$)/i,
    /([A-Z0-9\s&]{4,40}\s+(?:STAFFING|RECRUITMENT|TECHNOLOGIES|SOLUTIONS|SERVICES|LABS|TECH|PVT|LTD|CORP|GROUP|SYSTEMS|FIRM))/i,
    /(?:About|Join)\s+([A-Z][A-Za-z0-9\s&.,]+?)(?:\s+is|\s+are|\s*:|\n|$)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      let cleaned = match[1].replace(/^(?:a|an|the|and|or|with|for|in|on|of|to|from|by)\s+/i, '').trim();
      cleaned = cleaned.replace(/\s+(STAFFING|RECRUITMENT|FIRM|JAIPUR|INDIA|ALL RIGHTS RESERVED).*$/i, '').trim();
      cleaned = cleanString(cleaned);
      const isTechJargon = /\b(?:risk|payment|operating|database|distributed|embedded|file|legacy|monitoring|records\s*management|web|restful|micro|third\s*party|software|cloud|data|enterprise|source|financial)\s+(?:systems|services|solutions)\b/i.test(cleaned);
      if (!isTechJargon && cleaned.length > 2 && cleaned.length < 50 && !/^(job|experience|skills|location|confidential|position|our|the|this)$/i.test(cleaned)) {
        result.companyName = toTitleCase(cleaned);
        break;
      }
    }
  }

  // Fallback: extract domain name from email e.g. hello@growthescalators.com
  if (!result.companyName) {
    const emailMatch = trimmed.match(/[\w.-]+@([a-zA-Z0-9-]+)\.[a-zA-Z]{2,}/);
    if (emailMatch && emailMatch[1]) {
      const domainName = emailMatch[1];
      if (!['gmail', 'yahoo', 'outlook', 'hotmail', 'mail', 'email'].includes(domainName.toLowerCase())) {
        result.companyName = formatDomainToCompanyName(domainName);
      }
    }
  }

  // -------------------------------------------------------------
  // 5. EXTRACT SALARY / BUDGET
  // -------------------------------------------------------------
  const salaryPatterns = [
    /(?:Salary|Budget|CTC|Package|Compensation|Stipend)\s*[:\-–●•]\s*([^\n\r,;|●•]+)/i,
    /((?:INR|Rs\.?|₹|\$)\s*[\d,.]+\s*[-–to]+\s*[\d,.]+\s*(?:LPA|L|k|USD|PA)?)/i,
    /(\d+(?:\.\d+)?\s*[-–to]+\s*\d+(?:\.\d+)?\s*(?:LPA|Lakhs?|Lacs?|L|CTC))/i,
  ];

  for (const pattern of salaryPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const cleaned = cleanString(match[1]);
      if (cleaned.length > 1 && cleaned.length < 40) {
        result.salaryBudget = cleaned;
        break;
      }
    }
  }

  // -------------------------------------------------------------
  // 6. EXTRACT SKILLS
  // -------------------------------------------------------------
  const detectedSkillsSet = new Set<string>();

  // 6a. Dictionary scan across entire text
  for (const skill of COMMON_TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
    if (regex.test(trimmed)) {
      detectedSkillsSet.add(skill);
    }
  }

  // 6b. Look for skills explicitly listed under "Required Skills" or "Tech Stack"
  const skillsSectionRegex = /(?:Required\s*Skills|Key\s*Skills|Primary\s*Skills|Skills|Tech\s*Stack|Technologies|Must\s*Have|Good\s*to\s*Have)([\s\S]*?)(?=(?:Key\s*Responsibilities|Job\s*Details|About|Copyright|\n\s*\n\s*\n|$))/i;
  const skillsSectionMatch = trimmed.match(skillsSectionRegex);
  if (skillsSectionMatch) {
    const bulletMatches = skillsSectionMatch[1].match(/[●•*]\s*([^\n\r●•*]+)/g);
    if (bulletMatches) {
      for (const bullet of bulletMatches) {
        const cleanBullet = bullet.replace(/^[●•*\s]+/, '').replace(/–\s*Mandatory.*$/i, '').trim();
        for (const skill of COMMON_TECH_SKILLS) {
          const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (new RegExp(`\\b${escaped}\\b`, 'i').test(cleanBullet)) {
            detectedSkillsSet.add(skill);
          }
        }
      }
    }
  }

  // 6c. Contextual phrases: "expertise in X", "experience with X", "integrations including X"
  const contextRegex = /(?:expertise\s+in|experience\s+with|proficient\s+in|knowledge\s+of|including)\s+([A-Za-z0-9\s,\/()&–\-]+?)(?:\.|\n|;|$)/gi;
  let contextMatch: RegExpExecArray | null;
  while ((contextMatch = contextRegex.exec(trimmed)) !== null) {
    if (contextMatch[1]) {
      const phrase = contextMatch[1];
      for (const skill of COMMON_TECH_SKILLS) {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i').test(phrase)) {
          detectedSkillsSet.add(skill);
        }
      }
    }
  }

  if (detectedSkillsSet.size > 0) {
    result.skills = Array.from(detectedSkillsSet).join(', ');
  }

  // -------------------------------------------------------------
  // 7. EXTRACT HANDLER / CONTACT PERSON (SPOC / Recruiter / Account Manager)
  // -------------------------------------------------------------
  const contactPatterns = [
    /(?:Handled\s*By|Handler|Contact\s*Person|Contact|SPOC|Account\s*Manager|Recruiter|Posted\s*By|HR\s*Name|POC|Lead\s*Recruiter)\s*[:\-–●•]\s*([^\n\r,;|●•]+)/i,
  ];

  for (const pattern of contactPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const cleaned = cleanString(match[1]);
      if (cleaned.length > 1 && cleaned.length < 40 && !/^(email|phone|immediate|remote|full\s*time)$/i.test(cleaned)) {
        result.contactPerson = toTitleCase(cleaned);
        break;
      }
    }
  }

  // -------------------------------------------------------------
  // 8. EXTRACT UAN REQUIREMENT
  // -------------------------------------------------------------
  const uanPattern = /(?:UAN|Universal\s*Account\s*Number)\s*[:\-–●•]?\s*(Required|Not\s*Required|Mandatory|Compulsory|Yes|No|NA|N\/A)/i;
  const uanMatch = trimmed.match(uanPattern);
  if (uanMatch && uanMatch[1]) {
    const val = uanMatch[1].toLowerCase().trim();
    if (val.includes('not') || val === 'no' || val === 'na' || val === 'n/a') {
      result.uan = 'Not Required';
    } else if (val === 'required' || val === 'mandatory' || val === 'compulsory' || val === 'yes') {
      result.uan = 'Required';
    }
  }

  // -------------------------------------------------------------
  // 9. EXTRACT NOTES / SPECIAL INSTRUCTIONS
  // -------------------------------------------------------------
  const notesPattern = /(?:[*_~#`]*(?:Important\s*)?Note[s]?|Special\s*Instruction[s]?|Remarks?)[*_~#`]*\s*[:\-–●•]\s*([^\n\r]+(?:\r?\n(?![A-Za-z\s]+:)[^\n\r]+)*)/i;
  const notesMatch = trimmed.match(notesPattern);
  if (notesMatch && notesMatch[1]) {
    const cleanedNotes = notesMatch[1].trim();
    if (cleanedNotes.length > 3) {
      result.notes = cleanedNotes;
    }
  }

  // -------------------------------------------------------------
  // 10. EXTRACT SHIFT TIMING
  // -------------------------------------------------------------
  const shiftPattern = /(?:Shift\s*(?:Timing|Hours|Type)?|Working\s*(?:Shift|Hours))[*_~#`]*\s*[:\-–●•]\s*([^\n\r,●•|]+)/i;
  const shiftMatch = trimmed.match(shiftPattern);
  if (shiftMatch && shiftMatch[1]) {
    const val = shiftMatch[1].toLowerCase().trim();
    if (val.includes('us') || val.includes('american') || val.includes('est') || val.includes('pst') || val.includes('cst')) {
      result.shiftTiming = 'US / American Shift';
    } else if (val.includes('uk') || val.includes('british') || val.includes('european') || val.includes('gmt') || val.includes('bst')) {
      result.shiftTiming = 'UK / European Shift';
    } else if (val.includes('australia') || val.includes('aest') || val.includes('aedt')) {
      result.shiftTiming = 'Australian Shift';
    } else if (val.includes('middle east') || val.includes('gulf') || val.includes('dubai') || val.includes('uae')) {
      result.shiftTiming = 'Middle East / Gulf Shift';
    } else if (val.includes('rotational') || val.includes('24/7') || val.includes('rotation')) {
      result.shiftTiming = 'Rotational Shift';
    } else if (val.includes('night') || val.includes('graveyard')) {
      result.shiftTiming = 'Night Shift';
    } else if (val.includes('day') || val.includes('general') || val.includes('india') || val.includes('ist') || val.includes('regular')) {
      result.shiftTiming = 'Day Shift (India)';
    } else if (val.includes('flexible') || val.includes('flexi') || val.includes('hybrid')) {
      result.shiftTiming = 'Flexible / Hybrid';
    } else {
      const cleanedCustom = cleanString(shiftMatch[1]);
      if (cleanedCustom.length >= 3 && cleanedCustom.length <= 40) {
        result.shiftTiming = cleanedCustom;
      }
    }
  } else {
    // Keyword scan in full text
    if (/\b(?:us\s+shift|american\s+shift)\b/i.test(trimmed)) {
      result.shiftTiming = 'US / American Shift';
    } else if (/\b(?:uk\s+shift|european\s+shift)\b/i.test(trimmed)) {
      result.shiftTiming = 'UK / European Shift';
    } else if (/\b(?:australian\s+shift|australia\s+shift)\b/i.test(trimmed)) {
      result.shiftTiming = 'Australian Shift';
    } else if (/\b(?:middle\s*east\s+shift|gulf\s+shift)\b/i.test(trimmed)) {
      result.shiftTiming = 'Middle East / Gulf Shift';
    } else if (/\b(?:rotational\s+shift|24\/7\s+shift)\b/i.test(trimmed)) {
      result.shiftTiming = 'Rotational Shift';
    } else if (/\b(?:night\s+shift)\b/i.test(trimmed)) {
      result.shiftTiming = 'Night Shift';
    }
  }

  return result;
}

function cleanString(str: string): string {
  return str
    .replace(/[*_~#`]/g, '')
    .replace(/^[:\-–●•\s]+/, '')
    .replace(/[:\-–●•\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitleString(str: string): string {
  let cleaned = str
    .replace(/[*_~#`]/g, '')
    .replace(/^[:\-–●•\s]+/, '')
    .replace(/[\s–\-—|●•]+(?:Job\s*Description|JD|Job\s*Opening|Opening|Requirements).*$/i, '')
    .replace(/[:\-–●•\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip trailing client name (e.g. "Oracle EPM Consultant - Relanto" -> "Oracle EPM Consultant")
  cleaned = cleaned.replace(/\s*[-–—|]\s*([A-Za-z0-9&.\s]{2,30})$/, (match, suffix) => {
    const sLower = suffix.trim().toLowerCase();
    const isRoleQualifier = ['developer', 'engineer', 'architect', 'lead', 'manager', 'consultant', 'specialist', 'senior', 'junior', 'analyst', 'administrator'].some(k => sLower.includes(k));
    return isRoleQualifier ? match : '';
  }).trim();

  return cleaned;
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDomainToCompanyName(domain: string): string {
  const split = domain.replace(/([a-z])([A-Z])/g, '$1 $2');
  if (domain.toLowerCase() === 'growthescalators') {
    return 'Growth Escalators';
  }
  return toTitleCase(split);
}
