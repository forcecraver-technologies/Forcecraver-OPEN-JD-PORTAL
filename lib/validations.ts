export interface JobInput {
  companyName: string;
  contactPerson?: string;
  jobTitle: string;
  skills?: string;
  experience?: string;
  location?: string;
  salaryBudget?: string;
  jobDescription: string;
  postedDate: string;
  status: 'ACTIVE' | 'CLOSED';
  uan?: string;
  notes?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateJobInput(data: Partial<JobInput>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.companyName || !data.companyName.trim()) {
    errors.companyName = 'Company name is required';
  }

  if (!data.jobTitle || !data.jobTitle.trim()) {
    errors.jobTitle = 'Job title is required';
  }

  if (!data.jobDescription || !data.jobDescription.trim()) {
    errors.jobDescription = 'Job description is required';
  }

  if (!data.postedDate || !data.postedDate.trim()) {
    errors.postedDate = 'Posted date is required';
  } else {
    const parsedDate = new Date(data.postedDate);
    if (isNaN(parsedDate.getTime())) {
      errors.postedDate = 'Please enter a valid date';
    }
  }

  if (data.status && !['ACTIVE', 'CLOSED'].includes(data.status)) {
    errors.status = 'Status must be either ACTIVE or CLOSED';
  }

  if (data.uan && !['Required', 'Not Required', 'NotRequired'].includes(data.uan)) {
    errors.uan = 'UAN must be either Required or Not Required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginInput(data: { email?: string; password?: string }): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password || !data.password.trim()) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
