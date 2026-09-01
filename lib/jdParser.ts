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
  'Java', 'Spring Boot', 'Microservices', 'Python', 'Django', 'FastAPI',
  'Flask', 'Node.js', 'Express', 'TypeScript', 'JavaScript', 'C++', 'C#',
  '.NET', 'Dotnet', '.NET Core', 'PHP', 'Ruby', 'Golang', 'Go', 'Rust', 'Scala',

  // Frontend & Mobile
  'React', 'Next.js', 'Angular', 'Vue.js', 'Tailwind CSS', 'HTML', 'CSS', 'Redux',
  'Flutter', 'React Native', 'Swift', 'Kotlin', 'iOS', 'Android',

  // APIs & Architecture
  'REST APIs', 'REST', 'SOAP APIs', 'SOAP', 'GraphQL', 'gRPC', 'API Integration',
  'System Architecture', 'Security Architecture',

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

  // Fallback: Check line 1 or line 2
  if (!result.jobTitle && lines.length > 0) {
    const candidateLine = lines[0];
    const titleKeywords = ['developer', 'engineer', 'architect', 'lead', 'manager', 'designer', 'analyst', 'specialist', 'consultant', 'qa', 'tester', 'administrator'];
    if (titleKeywords.some(k => candidateLine.toLowerCase().includes(k)) && candidateLine.length < 100) {
      result.jobTitle = cleanTitleString(candidateLine);
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
      result.experience = cleanString(standaloneExpMatch[1]);
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
    /Copyright\s*(?:©|\(c\))\s*(?:\d{4})?\s*([A-Za-z0-9\s&.,]+?)(?:\.|\s+All Rights|\s*\||\n|$)/i,
    /([A-Z0-9\s&]{4,40}\s+(?:STAFFING|RECRUITMENT|TECHNOLOGIES|SOLUTIONS|SERVICES|LABS|TECH|PVT|LTD|CORP|GROUP|SYSTEMS|FIRM))/i,
    /(?:About|Join)\s+([A-Z][A-Za-z0-9\s&.,]+?)(?:\s+is|\s+are|\s*:|\n|$)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      let cleaned = match[1].replace(/^(a|an|the)\s+/i, '').trim();
      cleaned = cleaned.replace(/\s+(STAFFING|RECRUITMENT|FIRM|JAIPUR|INDIA|ALL RIGHTS RESERVED).*$/i, '').trim();
      cleaned = cleanString(cleaned);
      if (cleaned.length > 2 && cleaned.length < 50 && !/^(job|experience|skills|location|confidential|position)$/i.test(cleaned)) {
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
  return str
    .replace(/[*_~#`]/g, '')
    .replace(/^[:\-–●•\s]+/, '')
    .replace(/[\s–\-—|●•]+(?:Job\s*Description|JD|Job\s*Opening|Opening|Requirements).*$/i, '')
    .replace(/[:\-–●•\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
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
