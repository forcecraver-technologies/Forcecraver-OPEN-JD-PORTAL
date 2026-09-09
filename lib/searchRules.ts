import { Prisma, JobStatus } from '@prisma/client';
import { JobFilterParams } from '@/types/job';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface ParsedSearchRule {
  type: 'RULE_1_COMPANY_JDS' | 'RULE_2_JOB_TITLE' | 'RULE_3_ACTIVE_JDS' | 'RULE_4_TODAY_JDS' | 'RULE_5_JOBS_IN_LOCATION' | 'RULE_6_GENERAL_KEYWORD';
  description: string;
  extractedParam?: string;
}

const KNOWN_LOCATIONS = [
  'remote', 'hybrid', 'offshore', 'onsite', 'ahmedabad', 'bengaluru',
  'bangalore', 'pune', 'mumbai', 'hyderabad', 'chennai', 'delhi',
  'noida', 'gurugram', 'gurgaon', 'kolkata', 'jaipur', 'indore', 'surat', 'vadodara'
];

const KNOWN_ROLE_TERMS = [
  'developer', 'engineer', 'architect', 'lead', 'manager', 'designer',
  'analyst', 'consultant', 'administrator', 'tester', 'intern', 'qa',
  'frontend', 'backend', 'full stack', 'fullstack', 'devops', 'sre', 'specialist',
  'java', 'python', 'react', 'node', 'salesforce', 'snowflake', 'data', 'cloud', 'flutter'
];

const STOP_WORDS = new Set([
  'job', 'jobs', 'jd', 'jds', 'opening', 'openings', 'opportunity', 'opportunities',
  'role', 'roles', 'for', 'in', 'at', 'with', 'and', 'the', 'a', 'an'
]);

/**
 * Deterministic rule-based query classifier
 */
export function parseSearchRule(query: string): ParsedSearchRule | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // 1. Combination: Today Active JDs / Active Today JDs / Today's Active JDs
  if (/^(?:today('?s)?\s+active|active\s+today('?s)?)\s*(?:jds?|jobs?|openings?)?$/i.test(trimmed)) {
    return {
      type: 'RULE_4_TODAY_JDS',
      description: "Today's Active JDs rule applied (Showing Active JDs posted today)",
    };
  }

  // 2. Rule 4: Today JDs / Today Jobs
  if (/^today('?s)?\s*(?:jds?|jobs?|openings?)$/i.test(trimmed)) {
    return {
      type: 'RULE_4_TODAY_JDS',
      description: "Today JDs rule applied (Showing JDs posted today)",
    };
  }

  // 3. Rule 3: Active JDs / All Active JDs / Active Jobs
  if (/^(?:all\s+)?active\s*(?:jds?|jobs?|openings?)$/i.test(trimmed)) {
    return {
      type: 'RULE_3_ACTIVE_JDS',
      description: 'Active JDs rule applied (Showing only Active JDs)',
    };
  }

  // 4. Rule 5: Jobs in [Location] OR [Location] Jobs / Remote Jobs (e.g. "remote jobs", "jobs in ahmedabad", "pune openings")
  const jobsInLocMatch = trimmed.match(/^jobs?\s+(?:in|at|for)\s+(.+)$/i);
  if (jobsInLocMatch && jobsInLocMatch[1]) {
    const loc = jobsInLocMatch[1].trim();
    return {
      type: 'RULE_5_JOBS_IN_LOCATION',
      description: `Jobs in ${loc} rule applied`,
      extractedParam: loc,
    };
  }

  const locPrefixMatch = trimmed.match(/^(.+?)\s+(?:jobs?|jds?|openings?|opportunities?|work)$/i);
  if (locPrefixMatch && locPrefixMatch[1]) {
    const prefix = locPrefixMatch[1].trim().toLowerCase();
    if (KNOWN_LOCATIONS.includes(prefix)) {
      return {
        type: 'RULE_5_JOBS_IN_LOCATION',
        description: `Jobs in ${locPrefixMatch[1].trim()} rule applied`,
        extractedParam: locPrefixMatch[1].trim(),
      };
    }
  }

  // 5. Rule 1: [Company Name] JDs
  const companyJdsMatch = trimmed.match(/^(.+?)\s+(?:jds?|jobs?)$/i);
  if (companyJdsMatch && companyJdsMatch[1]) {
    const candidate = companyJdsMatch[1].trim();
    const candidateLower = candidate.toLowerCase();
    const isModifier = /^(active|today('?s)?|today\s+active|active\s+today|recent|latest|all|open|closed|new)$/i.test(candidate);
    const isKnownLoc = KNOWN_LOCATIONS.includes(candidateLower);
    const isKnownRole = KNOWN_ROLE_TERMS.some(t => candidateLower.includes(t));

    if (!isModifier && !isKnownLoc && !isKnownRole) {
      return {
        type: 'RULE_1_COMPANY_JDS',
        description: `Company JDs rule applied for "${candidate}"`,
        extractedParam: candidate,
      };
    }
  }

  // 6. Rule 2: Title Search (e.g. "Java Developer", "React Jobs", "Python Developer")
  const isTitleQuery = KNOWN_ROLE_TERMS.some(term => trimmed.toLowerCase().includes(term));
  if (isTitleQuery) {
    // Strip trailing generic words like "jobs" / "jds" for cleaner matching
    const cleanTerm = trimmed.replace(/\s+(?:jobs?|jds?|openings?)$/i, '').trim();
    return {
      type: 'RULE_2_JOB_TITLE',
      description: `Job Title Search rule applied for "${cleanTerm || trimmed}"`,
      extractedParam: cleanTerm || trimmed,
    };
  }

  // 7. Rule 6: General Keyword Search
  return {
    type: 'RULE_6_GENERAL_KEYWORD',
    description: `General keyword search rule applied for "${trimmed}"`,
    extractedParam: trimmed,
  };
}

/**
 * Builds Prisma WHERE clause combining Rule-Based search and structured filters.
 */
export function buildJobWhereClause(filters: JobFilterParams): {
  where: Prisma.JobWhereInput;
  matchedRule: string | null;
} {
  const andConditions: Prisma.JobWhereInput[] = [];
  let matchedRuleName: string | null = null;

  // 1. Evaluate Rule-Based Search Query
  if (filters.search && filters.search.trim()) {
    const rule = parseSearchRule(filters.search.trim());
    if (rule) {
      matchedRuleName = rule.description;

      switch (rule.type) {
        case 'RULE_3_ACTIVE_JDS': {
          andConditions.push({ status: JobStatus.ACTIVE });
          break;
        }

        case 'RULE_4_TODAY_JDS': {
          const now = new Date();
          const todayStart = startOfDay(now);
          const todayEnd = endOfDay(now);
          andConditions.push({
            status: JobStatus.ACTIVE,
            postedDate: {
              gte: todayStart,
              lte: todayEnd,
            },
          });
          break;
        }

        case 'RULE_5_JOBS_IN_LOCATION': {
          const locationKeyword = rule.extractedParam || '';
          andConditions.push({
            status: JobStatus.ACTIVE,
            location: {
              contains: locationKeyword,
              mode: 'insensitive',
            },
          });
          break;
        }

        case 'RULE_1_COMPANY_JDS': {
          const companyKeyword = rule.extractedParam || '';
          andConditions.push({
            status: JobStatus.ACTIVE,
            companyName: {
              contains: companyKeyword,
              mode: 'insensitive',
            },
          });
          break;
        }

        case 'RULE_2_JOB_TITLE': {
          const term = rule.extractedParam || '';
          andConditions.push({
            status: JobStatus.ACTIVE,
            OR: [
              { jobTitle: { contains: term, mode: 'insensitive' } },
              { skills: { contains: term, mode: 'insensitive' } },
              { jobDescription: { contains: term, mode: 'insensitive' } },
            ],
          });
          break;
        }

        case 'RULE_6_GENERAL_KEYWORD': {
          const rawTerms = (rule.extractedParam || '')
            .split(/\s+/)
            .map(t => t.trim())
            .filter(Boolean);

          // Filter out generic stopwords so queries like "remote jobs" don't fail matching literal "jobs"
          const filteredTerms = rawTerms.filter(t => !STOP_WORDS.has(t.toLowerCase()));
          const terms = filteredTerms.length > 0 ? filteredTerms : rawTerms;

          if (terms.length > 0) {
            terms.forEach(term => {
              andConditions.push({
                OR: [
                  { companyName: { contains: term, mode: 'insensitive' } },
                  { jobTitle: { contains: term, mode: 'insensitive' } },
                  { skills: { contains: term, mode: 'insensitive' } },
                  { location: { contains: term, mode: 'insensitive' } },
                  { jobDescription: { contains: term, mode: 'insensitive' } },
                ],
              });
            });
          }
          break;
        }
      }
    }
  }

  // 2. Structured Filters (Work alongside search rules)
  if (filters.company && filters.company.trim()) {
    andConditions.push({
      companyName: {
        contains: filters.company.trim(),
        mode: 'insensitive',
      },
    });
  }

  if (filters.title && filters.title.trim()) {
    andConditions.push({
      jobTitle: {
        contains: filters.title.trim(),
        mode: 'insensitive',
      },
    });
  }

  if (filters.skills && filters.skills.trim()) {
    andConditions.push({
      skills: {
        contains: filters.skills.trim(),
        mode: 'insensitive',
      },
    });
  }

  if (filters.experience && filters.experience.trim()) {
    andConditions.push({
      experience: {
        contains: filters.experience.trim(),
        mode: 'insensitive',
      },
    });
  }

  if (filters.location && filters.location.trim()) {
    andConditions.push({
      location: {
        contains: filters.location.trim(),
        mode: 'insensitive',
      },
    });
  }

  // Status Filter
  if (filters.status && filters.status !== 'ALL') {
    andConditions.push({
      status: filters.status as JobStatus,
    });
  }

  // UAN Requirement Filter
  if (filters.uan && filters.uan !== 'ALL') {
    andConditions.push({
      uan: {
        equals: filters.uan,
        mode: 'insensitive',
      },
    });
  }

  // Posted Date Filter
  if (filters.startDate || filters.endDate) {
    const dateCondition: Prisma.DateTimeFilter = {};
    if (filters.startDate) {
      dateCondition.gte = startOfDay(new Date(filters.startDate));
    }
    if (filters.endDate) {
      dateCondition.lte = endOfDay(new Date(filters.endDate));
    }
    andConditions.push({
      postedDate: dateCondition,
    });
  } else if (filters.postedDate && filters.postedDate !== 'all') {
    const now = new Date();
    if (filters.postedDate === 'today') {
      andConditions.push({
        postedDate: {
          gte: startOfDay(now),
          lte: endOfDay(now),
        },
      });
    } else if (filters.postedDate === '7days') {
      andConditions.push({
        postedDate: {
          gte: startOfDay(subDays(now, 7)),
        },
      });
    } else if (filters.postedDate === '30days') {
      andConditions.push({
        postedDate: {
          gte: startOfDay(subDays(now, 30)),
        },
      });
    }
  }

  const where: Prisma.JobWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  return { where, matchedRule: matchedRuleName };
}
