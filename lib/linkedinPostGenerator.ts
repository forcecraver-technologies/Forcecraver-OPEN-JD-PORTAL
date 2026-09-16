/**
 * Intelligent & Comprehensive LinkedIn Post Generator Engine
 * Ported & Enhanced for Open JD System
 * - Automatically normalizes and rejoins hard-wrapped multi-line sentences & bullets (no cutoffs)
 * - Cleans OCR/PDF copy-paste artifacts ('l ', '• l ', '1. ', etc.)
 * - Extracts Shift Timing and US / Client Overlap requirements dynamically into Role Snapshot
 * - Captures Crucial Screening Notes & Ideal Candidate Profile (with full multi-line completeness)
 * - Extracts Categorized Tech Stacks & Key Action Responsibilities
 * - Generates clean, searchable, canonical LinkedIn hashtags per technology & role
 * - Professional CTA formatting with express review subject lines
 * - Strictly excludes Client Managers (Priyanka, Sakshi) from Recruiter Name
 * - Preserves '@Forcecraver Technologies' and defaults to '@[enter your name]'
 */

export function cleanMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/[*_~`#]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .trim();
}

export function stripBulletPrefix(line: string): string {
  return line
    .replace(/^(?:[•*–—\-●▪►✔️▪️\t\s]+|\d+[\.\)]\s*|[lo]\s+|•\s*l\s*)+/i, '')
    .trim();
}

const LABELED_FIELD_REGEX = /^(?:Job\s*(?:Description|Title)|Position|Role|Designation|Title|Experience(?:\s*Required)?|Exp|Total\s*Exp|Location|Work\s*Mode(?:\s*\/\s*Location)?|Base\s*Location|Work\s*Location|Engagement(?:\s*Type|\s*Model)?|Contract\s*Type|Notice(?:\s*Period)?|Shift(?:\s*Timing|\s*Hours)?|Work\s*Timing|Work\s*Overlap(?:\s*Requirement)?|Salary|Budget|CTC|Package|Compensation|Stipend|Rate|Hourly\s*Rate|Billing\s*Rate|Target\s*Rate|Client(?:\s*Name)?|Company(?:\s*Name)?|Employer|Organization|Handled\s*By|Handler|Contact\s*Person|SPOC|Recruiter|UAN|Notes?|Special\s*Instructions?|Required\s*Skills|Technical\s*Skills|Tech\s*Stack|Key\s*Skills|Must\s*Have|Key\s*Responsibilities|Responsibilities|What\s*You('ll)?\s*Do|Ideal\s*Candidate(?:\s*Profile)?|Candidate\s*Profile|Screening\s*Note[s]?|Screening\s*Criteria|Important\s*Note[s]?|About(?:\s+the\s+Role)?|Overview|Qualifications)\s*[:\-–]/i;

const SECTION_HEADER_REGEX = /^(?:About(?:\s+the\s+Role)?|Role\s*Overview|Job\s*Description|Key\s*Responsibilities|Responsibilities|What\s*You('ll)?\s*Do|Required\s*Skills(?:\s*&?\s*Experience)?|Technical\s*Skills|Qualifications|Requirements|Ideal\s*Candidate(?:\s*Profile)?|Candidate\s*Profile|Screening\s*Note[s]?|Screening\s*Criteria|Important\s*Note[s]?|Work\s*Timing|Shift\s*Timing|Work\s*Overlap(?:\s*Requirement)?|Engagement(?:\s*Criteria|\s*Model)?|How\s*to\s*Apply)\s*[:\-–]?$/i;

/**
 * Normalizes raw JD text by rejoining wrapped lines in sentences and bullets,
 * cleaning OCR bullet artifacts, and preserving coherent structure.
 */
export function normalizeJdText(rawText: string): string[] {
  if (!rawText) return [];
  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const normalized: string[] = [];

  const isExplicitBullet = (raw: string): boolean => {
    return /^(?:[•*–—\-●▪►✔️▪️]|\d+[\.\)]|[lo]\s+|•\s*l\s*)/i.test(raw);
  };

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const cleaned = cleanMarkdown(raw);
    if (!cleaned) continue;

    const isBullet = isExplicitBullet(raw);
    const isLabeled = LABELED_FIELD_REGEX.test(cleaned);
    const isSection = SECTION_HEADER_REGEX.test(cleaned);

    if (!isBullet && !isLabeled && !isSection && normalized.length > 0) {
      const prev = normalized[normalized.length - 1];
      const prevIsSection = SECTION_HEADER_REGEX.test(prev);

      const prevEndsWithDangling = /[,\/&+|]\s*$|[-–—]\s*$|(?:\b(?:and|or|with|for|to|in|of|including|the|a|an|as|under|during|across|within|between|plus))\s*$/i.test(prev);
      const prevHasUnclosedParen = (prev.match(/\(/g) || []).length > (prev.match(/\)/g) || []).length;
      const startsWithLowercase = /^[a-z]/.test(cleaned);

      if (!prevIsSection && (prevEndsWithDangling || prevHasUnclosedParen || startsWithLowercase)) {
        normalized[normalized.length - 1] = `${prev} ${cleaned}`;
        continue;
      }
    }

    normalized.push(cleaned);
  }

  return normalized;
}

export const JOB_ROLE_KEYWORDS = [
  'developer', 'engineer', 'architect', 'consultant', 'analyst', 'lead', 'manager',
  'specialist', 'designer', 'administrator', 'tester', 'qa', 'fullstack', 'full stack',
  'frontend', 'front end', 'backend', 'back end', 'devops', 'cloud', 'data scientist',
  'data engineer', 'java', 'python', 'salesforce', 'react', 'angular', 'node', 'dotnet',
  '.net', 'c#', 'golang', 'aws', 'azure', 'gcp', 'android', 'ios', 'flutter', 'ui/ux',
  'product manager', 'scrum master', 'business analyst', 'oracle', 'sap', 'zuora', 'workday',
  'snowflake', 'databricks', 'power bi', 'tableau', 'servicenow', 'boomi', 'mulesoft'
];

export const BAD_TITLE_STARTERS = [
  'exp', 'experience', 'salary', 'budget', 'years', 'yoe', 'duration', 'contract',
  'remote', 'notice', 'location', 'mode', 'must have', 'skills', 'core skills',
  'overview', 'about', 'role summary', 'responsibilities', 'requirements', 'we are',
  'job description', 'client', 'company', 'engagement', 'working model', 'project type',
  'work timing', 'shift timing', 'work overlap'
];

export function cleanJobTitle(title: string, companyName?: string): string {
  if (!title) return 'Software Professional';

  let cleaned = cleanMarkdown(title);
  // Remove leading labels
  cleaned = cleaned.replace(/^(?:job\s*description|job\s*title|role|position|opening|designation)\s*[:\-–]\s*/i, '').trim();
  // Remove -Medium -, -Senior -, -Junior -
  cleaned = cleaned.replace(/\s*[-–—]\s*(?:Medium|Senior|Junior|Lead|Freshers?)\s*[-–—]?/gi, ' ');
  // Remove position count e.g. (4 Position), (2 Positions)
  cleaned = cleaned.replace(/\s*\(\s*\d+\s*(?:position|positions|openings?)\s*\)/gi, '');
  // Remove redundant location/type suffixes like - Remote (Contract), (Remote), - Contract
  cleaned = cleaned.replace(/\s*[-–—]\s*(?:Remote|Contract|Full[- ]time|Hybrid)(?:\s*\((?:Remote|Contract|Full[- ]time|Hybrid)\))?/gi, '');
  cleaned = cleaned.replace(/\s*\((?:Remote|Contract|Full[- ]time|Hybrid)\)/gi, '');

  // Strip company name if explicitly provided
  if (companyName && companyName.trim()) {
    const escaped = companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`^\\[?\\s*${escaped}\\s*\\]?\\s*[-–—|/:]*\\s*`, 'gi'), '').trim();
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
      ['senior', 'junior', 'lead', 'principal', 'remote', 'hybrid', 'contract', 'full-time', 'integration', 'troubleshooting'].includes(iLower);
    return isRoleQualifier ? fullMatch : '';
  }).trim();

  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned || 'Software Professional';
}

export function extractRoleFromText(text: string): string {
  const normalizedLines = normalizeJdText(text);
  if (!normalizedLines.length) return 'Software Professional';

  // Check labeled patterns first: Role: Boomi Developer (Integration + Troubleshooting)
  for (const line of normalizedLines.slice(0, 8)) {
    const labeledMatch = line.match(/^(?:Role|Job\s*Title|Position|Title|Job\s*Description)\s*[:\-–]\s*([^\n\r]+)/i);
    if (labeledMatch && labeledMatch[1]) {
      const candidate = cleanJobTitle(labeledMatch[1]);
      if (candidate.length >= 3 && candidate.length < 80) return candidate;
    }
  }

  for (const line of normalizedLines.slice(0, 8)) {
    const cleanLine = cleanMarkdown(line);
    const lineLower = cleanLine.toLowerCase();
    if (BAD_TITLE_STARTERS.some(bad => lineLower.startsWith(bad))) continue;
    if (JOB_ROLE_KEYWORDS.some(k => lineLower.includes(k))) {
      const cleaned = cleanJobTitle(cleanLine);
      if (cleaned.length >= 3 && cleaned.length < 80) return cleaned;
    }
  }

  return cleanJobTitle(normalizedLines[0]);
}

export function extractExperienceFromText(text: string): string {
  const normalizedLines = normalizeJdText(text);
  for (const line of normalizedLines) {
    const labeledMatch = line.match(/(?:Experience(?:\s*Required)?|Exp|Total\s*Exp)\s*[:\-–]\s*([^\n\r*]+)/i);
    if (labeledMatch && labeledMatch[1]) {
      const cleaned = cleanMarkdown(labeledMatch[1]).replace(/^[:\-–\s]+/, '').trim();
      const numRange = cleaned.match(/(\d+\s*(?:[-–to+]\s*\d+)?\+?)\s*(?:years?|yrs?)?/i);
      if (numRange && numRange[1]) {
        let val = numRange[1].replace(/\s+/g, '').replace(/[–-]/g, ' - ').trim();
        if (!val.endsWith('+') && !val.includes('-') && !val.includes('to')) {
          val += '+';
        }
        return `${val} Years`;
      }
      if (cleaned.length > 1 && cleaned.length < 35) {
        return cleaned;
      }
    }
  }

  const match = text.match(/(\d+\s*(?:[-–to+]\s*\d+)?\+?)\s*(?:years?|yrs?)(?:\s*of\s*(?:hands-on\s*)?(?:exp(?:erience)?)?)?/i);
  if (match && match[1]) {
    let val = match[1].replace(/\s+/g, '').replace(/[–-]/g, ' - ').trim();
    if (!val.endsWith('+') && !val.includes('-') && !val.includes('to')) {
      val += '+';
    }
    return `${val} Years`;
  }

  return '5+ Years';
}

export function extractLocationFromText(text: string): string {
  const normalizedLines = normalizeJdText(text);
  for (const line of normalizedLines) {
    const locMatch = line.match(/(?:Location|Base\s*Location|Work\s*Location|Work\s*Mode\s*\/\s*Location)\s*[:\-–]\s*([^\n\r*]+)/i);
    if (locMatch && locMatch[1]) {
      const rawLoc = cleanMarkdown(locMatch[1]).trim();
      if (!/to\s*be\s*confirmed|tbd|n\/a|not\s*specified/i.test(rawLoc) && rawLoc.length > 2) {
        return rawLoc;
      }
    }
  }
  if (/\b(100%\s*remote|remote|wfh|work\s*from\s*home)\b/i.test(text)) {
    return 'Remote';
  }
  if (/\b(hybrid)\b/i.test(text)) {
    return 'Hybrid';
  }
  return 'Remote (India / Global)';
}

export function extractEngagementModelFromText(text: string): string {
  const engMatch = text.match(/(?:Engagement(?:\s*Type|\s*Model)?|Contract\s*Type)\s*[:\-–]\s*([^\n\r*]+)/i);
  if (engMatch && engMatch[1]) {
    return cleanMarkdown(engMatch[1]).trim();
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
 * Extracts Shift Timing & US / Client Overlap requirements dynamically
 */
export function extractShiftAndOverlap(text: string, customShift?: string): string {
  if (customShift && customShift.trim() && customShift !== 'Day Shift (India)') {
    return customShift.trim();
  }

  const normalizedLines = normalizeJdText(text);
  const fullNormalized = normalizedLines.join('\n');

  let shiftTiming = '';
  let overlapReq = '';

  // 1. Check explicit shift timing patterns
  const timeRangeMatch = fullNormalized.match(/(?:(?:Standard\s*)?Shift\s*(?:Timing|Hours|Type)?|Working\s*(?:Shift|Hours|Timing))\s*[:\-–]\s*([^\n\r.]+)/i) ||
    fullNormalized.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)\s*[-–to]+\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)(?:\s*IST|\s*EST|\s*PST|\s*CST|\s*GMT)?)/i);

  if (timeRangeMatch && timeRangeMatch[1]) {
    const raw = cleanMarkdown(timeRangeMatch[1]).replace(/^[:\-–\s]+/, '').trim();
    if (/\d{1,2}(?::\d{2})?\s*(?:AM|PM)/i.test(raw)) {
      shiftTiming = raw;
    } else if (/us|american|est|pst|night/i.test(raw)) {
      shiftTiming = 'US / American Shift';
    } else if (/uk|european|gmt/i.test(raw)) {
      shiftTiming = 'UK / European Shift';
    } else if (/day|india|ist/i.test(raw)) {
      shiftTiming = 'Day Shift (India)';
    } else if (raw.length > 3 && raw.length < 40) {
      shiftTiming = raw;
    }
  }

  // 2. Check US / Client overlap patterns
  const overlapMatch = fullNormalized.match(/(?:Work\s*Overlap(?:\s*Requirement)?|Overlap(?:\s*Requirement)?)\s*[:\-–]\s*([^\n\r]+)/i) ||
    fullNormalized.match(/(?:minimum\s*)?(\d+[\s-]*(?:to|-)?\s*\d*\s*hours?\s*overlap\s*(?:with\s*)?(?:US\s*(?:Eastern\s*Time\s*\()?(?:EST|PST|CST|ET|PT)\)?|US\s*EST|US\s*PST|US|UK|European|client)(?:\s*(?:working\s*hours|hours|overlap|time\s*zone))?)/i) ||
    fullNormalized.match(/(maintain\s*(?:a\s*)?\d+[- ]hour\s*overlap\s*with\s*US\s*(?:EST|PST|CST)?\s*hours?)/i);

  if (overlapMatch && overlapMatch[1]) {
    const rawOverlap = cleanMarkdown(overlapMatch[1]).trim();
    if (/4[- ]hour\s*overlap\s*with\s*US\s*(?:Eastern\s*Time\s*\()?EST/i.test(rawOverlap) || /4[- ]hour\s*overlap\s*with\s*US\s*EST/i.test(rawOverlap) || /4\s*hours?\s*overlap\s*with\s*US/i.test(rawOverlap)) {
      overlapReq = 'Min 4 hours US EST overlap required';
    } else if (/(\d+[- ]hours?)\s*overlap\s*with\s*(US\s*(?:EST|PST|CST)?)/i.test(rawOverlap)) {
      overlapReq = rawOverlap.replace(/Candidate must be flexible and available for a /i, '').trim();
    } else if (rawOverlap.length < 75) {
      overlapReq = rawOverlap.replace(/^Candidate must be flexible.*?to\s*/i, '').trim();
    }
  }

  // Combine into clean readable snapshot line
  if (shiftTiming && overlapReq) {
    return `${shiftTiming} (${overlapReq})`;
  }
  if (shiftTiming) {
    return shiftTiming;
  }
  if (overlapReq) {
    return `Flexible Shift (${overlapReq})`;
  }
  if (/\b(?:us\s+shift|american\s+shift)\b/i.test(text)) {
    return 'US / American Shift (EST/PST Overlap)';
  }
  if (/\b(?:uk\s+shift|european\s+shift)\b/i.test(text)) {
    return 'UK / European Shift';
  }

  return 'Day Shift (India)';
}

/**
 * Extracts Crucial Screening Notes & Ideal Candidate Profile with full multi-line completeness
 */
export function extractCriticalNotes(text: string): string[] {
  const normalizedLines = normalizeJdText(text);
  const criticalNotes: string[] = [];

  // 1. Scan for dedicated sections: Ideal Candidate Profile / Screening Criteria / Crucial Notes / Important Note
  const sectionHeaderRegex = /^(?:Ideal\s*Candidate(?:\s*Profile)?|Target\s*Candidate\s*Profile|Crucial\s*Screening\s*Note[s]?|Screening\s*Criteria|Important\s*Note[s]?|Who\s*(?:We\s*Are\s*Looking\s*For|Should\s*Apply))\s*[:\-–]?$/i;
  let inSection = false;

  for (const line of normalizedLines) {
    if (sectionHeaderRegex.test(line)) {
      inSection = true;
      continue;
    }

    if (inSection) {
      if (SECTION_HEADER_REGEX.test(line) || LABELED_FIELD_REGEX.test(line)) {
        break;
      }

      const cleanLine = stripBulletPrefix(line);
      if (cleanLine.length > 20 && !cleanLine.endsWith(':')) {
        criticalNotes.push(`📌 ${cleanLine}`);
      }
    }
  }

  // 2. Also search for high-impact screening statements across all lines if section was small
  if (criticalNotes.length < 2) {
    for (const line of normalizedLines) {
      const cleanL = stripBulletPrefix(line);
      if (
        /^(?:We\s+are\s+specifically\s+looking\s+for|Specifically\s+seeking|NOT\s+a\s+traditional|We\s+are\s+NOT\s+looking\s+for|Submit\s+profiles\s+only\s+if|Candidates\s+who\s+have\s+owned|Demonstrated\s+balance\s+of\s+development\s+and\s+operational|Not\s+purely\s+a\s+build-and-move-on)/i.test(cleanL) ||
        /\b(?:not\s+purely\s+a\s+build-and-move-on|not\s+solely\s+development-focused|live\s+production\s+support\s+and\s+incident\s+management)\b/i.test(cleanL)
      ) {
        const formatted = `📌 ${cleanL}`;
        if (!criticalNotes.some(n => n.includes(cleanL.slice(0, 30)))) {
          criticalNotes.push(formatted);
        }
      }
      if (criticalNotes.length >= 3) break;
    }
  }

  return criticalNotes.slice(0, 3);
}

/**
 * Purely dynamic extraction of technical competencies directly from JD text
 */
export function extractTechnologyStack(text: string): string[] {
  const normalizedLines = normalizeJdText(text);
  const results: string[] = [];

  const skillsHeaderRegex = /^(?:Required\s*Skills(?:\s*&?\s*Experience|\s*and\s*Qualifications)?|Skills\s*Required|Technical\s*Skills(?:\s*\/\s*Requirements)?|Mandatory\s*(?:Technical\s*)?Skills|Tech\s*Stack|Key\s*Skills|Must\s*Have|Core\s*Competencies)\s*[:\-–]?$/i;

  let inSkillsSection = false;
  const sectionBullets: string[] = [];

  for (const line of normalizedLines) {
    if (skillsHeaderRegex.test(line)) {
      inSkillsSection = true;
      continue;
    }

    if (inSkillsSection) {
      if (SECTION_HEADER_REGEX.test(line) || (LABELED_FIELD_REGEX.test(line) && !line.startsWith('•') && !line.startsWith('-'))) {
        break;
      }

      const cleanBullet = stripBulletPrefix(line);
      if (cleanBullet.length > 10 && cleanBullet.length < 220) {
        if (/^\d+\s*[-–to+]+\s*\d*\s*years?\s*of\s*overall\s*experience$/i.test(cleanBullet)) {
          continue;
        }
        let formattedBullet = cleanBullet;
        if (/^\d+\s*[-–to+]+\s*\d*\s*years?\s*of\s*overall\s*experience,\s*with\s*(?:hands-on\s*)?/i.test(cleanBullet)) {
          formattedBullet = cleanBullet.replace(/^\d+\s*[-–to+]+\s*\d*\s*years?\s*of\s*overall\s*experience,\s*with\s*(?:hands-on\s*)?/i, 'Hands-on ');
        }

        const isSoftSkill = /^(?:excellent|strong|good)\s+(?:communication|interpersonal|presentation)\s+skills$/i.test(formattedBullet);
        if (!isSoftSkill && !sectionBullets.includes(formattedBullet)) {
          sectionBullets.push(formattedBullet);
        }
      }
    }
  }

  // Add extracted technical bullets from skills section
  for (const sb of sectionBullets) {
    if (!results.some(r => r.includes(sb))) {
      results.push(`✅ ${sb}`);
    }
    if (results.length >= 6) break;
  }

  // Fallback: If no skills section was found, scan for technical lines
  if (results.length === 0) {
    for (const line of normalizedLines) {
      if (SECTION_HEADER_REGEX.test(line) || LABELED_FIELD_REGEX.test(line)) continue;
      const cleanL = stripBulletPrefix(line);
      if (cleanL.length > 15 && cleanL.length < 180) {
        if (/(?:Boomi|MuleSoft|Java|Spring|Python|React|Angular|Vue|Node|\.NET|Dotnet|C#|AWS|Azure|GCP|SQL|Database|APIs?|REST|Microservices|Docker|Kubernetes|DevOps|Git|Salesforce|Snowflake|Databricks|Kafka|Spark)/i.test(cleanL)) {
          if (!results.some(r => r.includes(cleanL))) {
            results.push(`✅ ${cleanL}`);
          }
          if (results.length >= 5) break;
        }
      }
    }
  }

  return results.slice(0, 6);
}

/**
 * Extracts action-oriented key responsibilities dynamically from the JD
 */
export function extractKeyResponsibilities(text: string): string[] {
  const normalizedLines = normalizeJdText(text);
  const responsibilities: string[] = [];

  const respHeaderRegex = /^(?:(?:Key|Job|Main|Core|Primary|Role|Day[\s-]*to[\s-]*Day)\s*)?Responsibilities|What\s*You('ll)?\s*Do\s*[:\-–]?$/i;
  let inRespSection = false;

  for (const line of normalizedLines) {
    if (respHeaderRegex.test(line)) {
      inRespSection = true;
      continue;
    }

    if (inRespSection) {
      if (SECTION_HEADER_REGEX.test(line) || (LABELED_FIELD_REGEX.test(line) && !line.startsWith('•') && !line.startsWith('-'))) {
        break;
      }

      const cleanBullet = stripBulletPrefix(line);
      if (cleanBullet.length > 15 && cleanBullet.length < 180 && !cleanBullet.endsWith(':')) {
        if (!responsibilities.includes(cleanBullet)) {
          responsibilities.push(cleanBullet);
        }
        if (responsibilities.length >= 5) break;
      }
    }
  }

  // Fallback if no responsibilities section was found
  if (responsibilities.length < 3) {
    const actionVerbRegex = /^(?:Develop|Design|Build|Implement|Work\s+(?:on|with)|Architect|Manage|Lead|Collaborate|Write|Create|Drive|Deliver|Ensure|Participate|Troubleshoot|Mentor|Optimize|Administer|Support|Monitor|Handle|Provide)\b/i;
    for (const line of normalizedLines) {
      if (SECTION_HEADER_REGEX.test(line)) continue;
      const cleanBullet = stripBulletPrefix(line);
      if (actionVerbRegex.test(cleanBullet)) {
        if (cleanBullet.length > 20 && cleanBullet.length < 160 && !cleanBullet.endsWith(':')) {
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
 * Generates clean, high-traffic, canonical hashtags tailored for LinkedIn visibility
 */
export function generateCleanHashtags(title: string, text = '', companyName?: string): string {
  const tags: string[] = [];
  const lowerTitle = title.toLowerCase();
  const lowerText = text.toLowerCase();

  // 1. Role-based & Technology-based canonical tags
  if (lowerTitle.includes('boomi') || lowerText.includes('boomi')) {
    tags.push('#DellBoomi', '#BoomiDeveloper', '#IntegrationEngineer');
    if (lowerTitle.includes('troubleshoot') || lowerText.includes('production support') || lowerText.includes('troubleshooting')) {
      tags.push('#ProductionSupport');
    }
  } else if (lowerTitle.includes('mulesoft') || lowerText.includes('mulesoft')) {
    tags.push('#MuleSoft', '#MuleSoftDeveloper', '#IntegrationDeveloper');
  } else if (lowerTitle.includes('salesforce') || lowerText.includes('salesforce')) {
    tags.push('#Salesforce', '#SalesforceDeveloper', '#Apex');
  } else if (lowerTitle.includes('full stack') || lowerTitle.includes('fullstack')) {
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
    tags.push('#JavaDeveloper', '#SpringBoot', '#BackendDeveloper');
  } else if (lowerTitle.includes('python')) {
    tags.push('#PythonDeveloper', '#Python', '#BackendDeveloper');
  } else if (lowerTitle.includes('frontend') || lowerTitle.includes('react') || lowerTitle.includes('angular')) {
    tags.push('#FrontendDeveloper', '#ReactJS', '#WebDevelopment');
  } else if (lowerTitle.includes('devops') || lowerTitle.includes('cloud')) {
    tags.push('#DevOpsEngineer', '#CloudEngineer', '#AWS');
  } else if (lowerTitle.includes('data engineer') || lowerTitle.includes('snowflake') || lowerTitle.includes('databricks')) {
    tags.push('#DataEngineer', '#Snowflake', '#Databricks');
  } else if (lowerTitle.includes('oracle')) {
    if (lowerTitle.includes('epm') || lowerText.includes('epm')) {
      tags.push('#OracleEPM', '#EPMConsultant');
    } else {
      tags.push('#OracleDeveloper', '#OracleCloud');
    }
  } else {
    const baseTitle = title.replace(/\(.*?\)/g, '').trim();
    const words = baseTitle
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => !['and', 'for', 'the', 'with', 'from', 'senior', 'junior', 'medium', 'lead', 'experienced'].includes(w.toLowerCase()));
    if (words.length > 0) {
      const roleTag = '#' + words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      if (roleTag.length > 3) tags.push(roleTag);
    }
  }

  // 2. Additional specific technology tags
  if (lowerText.includes('spring boot') || lowerText.includes('springboot')) tags.push('#SpringBoot');
  if (lowerText.includes('microservice')) tags.push('#Microservices');
  if (lowerText.includes('aws') && !tags.includes('#AWS')) tags.push('#AWS');
  if (lowerText.includes('azure') && !tags.includes('#Azure')) tags.push('#Azure');
  if (lowerText.includes('kubernetes') && !tags.includes('#Kubernetes')) tags.push('#Kubernetes');

  // 3. High-traffic hiring tags
  const standardTags = ['#HiringAlert', '#RemoteJobs', '#TechHiring', '#ImmediateJoiner', '#JobAlert', '#Forcecraver'];
  for (const st of standardTags) {
    if (!tags.includes(st)) {
      tags.push(st);
    }
  }

  // Sanitize all tags
  const sanitized = tags.map(t => {
    const raw = t.replace(/^#/, '');
    const clean = raw.replace(/[^A-Za-z0-9]/g, '');
    return clean ? `#${clean}` : '';
  }).filter(Boolean);

  // Filter out company name
  let filteredTags = sanitized;
  if (companyName && companyName.trim()) {
    const compClean = companyName.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (compClean.length >= 2) {
      filteredTags = sanitized.filter(t => !t.toLowerCase().includes(compClean));
    }
  }

  return filteredTags.slice(0, 9).join(' ');
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

  // 1. Role Title
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

  // 4. Shift & Overlap
  const shift = extractShiftAndOverlap(jdText, options?.shiftTiming);

  // 5. Engagement Model
  const engagement = options?.engagementModel || extractEngagementModelFromText(jdText);

  // 6. Notice Period
  const notice = options?.noticePeriod || extractNoticePeriodFromText(jdText);

  // 7. Critical Notes / Screening Criteria
  const criticalNotes = extractCriticalNotes(jdText);

  // 8. Technical Stack
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
    techStack = extractTechnologyStack(jdText);
  }

  // 9. Key Responsibilities
  const responsibilities = extractKeyResponsibilities(jdText);

  // 10. Engagement Guidelines
  const guidelines = extractEngagementGuidelines(jdText);

  // 11. Hashtags
  const hashtags = generateCleanHashtags(cleanTitle, jdText, options?.companyName);

  // 12. Recruiter Placeholders
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

  // TEMPLATE 1: Viral / Engaging (Default)
  if (style === 'engaging') {
    return `🚀 WE ARE HIRING | URGENT REQUIREMENT 🚀

We are actively looking for an experienced and highly skilled ${cleanTitle} to join our high-growth team for a dedicated client engagement! 🌐💼

📌 Role Snapshot:
💼 Role: ${cleanTitle}
⏳ Experience: ${expStr}
📍 Location: ${loc}
⏰ Shift Timing: ${shift}
🤝 Engagement Model: ${engagement}
⚡ Notice Period: ${notice}
${criticalNotes.length > 0 ? `
⚠️ Crucial Screening Note / Ideal Profile:
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
(Please mention "Application: ${cleanTitle}" in the subject or message for express review)

🔄 Know someone in your network who is looking for this opportunity? Tag them in the comments or REPOST to help!

👉 Follow @${namePlaceholder} & @Forcecraver Technologies for more active job updates.

${hashtags}`.trim();
  }

  // TEMPLATE 3: Urgent / Punchy
  if (style === 'urgent') {
    return `🔥 URGENT REQUIREMENT | IMMEDIATE HIRING: ${cleanTitle} 🔥

We have an immediate client requirement for an experienced ${cleanTitle} to start on priority! ⚡

📌 Role Snapshot:
💼 Role: ${cleanTitle}
⏳ Experience: ${expStr}
📍 Location: ${loc}
⏰ Shift Timing: ${shift}
🤝 Model: ${engagement}
⚡ Availability: ${notice}
${criticalNotes.length > 0 ? `
⚠️ Mandatory Screening Criteria / Ideal Profile:
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
(Please mention "Application: ${cleanTitle}" in the subject for express review)

🔄 Tag candidates currently on bench looking for a fast-track placement!

👉 Follow @${namePlaceholder} & @Forcecraver Technologies for active requirements.

${hashtags}`.trim();
  }

  // TEMPLATE 2: Professional
  return `Career Opportunity: We are actively hiring for ${cleanTitle}.

Position Overview:
• Role: ${cleanTitle}
• Experience Required: ${expStr}
• Location: ${loc}
• Shift / Overlap: ${shift}
• Engagement: ${engagement}
• Availability: ${notice}
${criticalNotes.length > 0 ? `
Screening Requirements & Ideal Profile:
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
