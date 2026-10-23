import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    configured: {
      groq: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()),
    },
    provider: 'groq',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobDescription,
      jobTitle = '',
      companyName = '',
    } = body;

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Job description text is required to enhance.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GROQ_API_KEY is not configured in .env file. Please add GROQ_API_KEY to your .env file.',
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an elite Talent Acquisition Director and ATS Optimization Expert.
Your task is to enhance, structure, and elevate ONLY the specific Job Description provided below.

STRICT INTEGRITY RULES:
1. ONLY USE THE PROVIDED JOB'S DATA: Do NOT use or invent details from other jobs, recruiters, companies, or contact information.
2. Maintain all technical stack requirements, years of experience, and qualifications from the original text. Do not omit crucial requirements.
3. Structure the enhanced output cleanly using these standardized markdown sections:
   - 📌 **Role Overview**: 2-3 engaging, professional sentences defining the mission of this role.
   - 🎯 **Key Responsibilities**: Clear, action-driven bullet points starting with strong action verbs.
   - 🛠️ **Required Qualifications & Technical Skills**: Bullet points detailing must-have skills, tools, and background.
   - ✨ **Preferred / Good-to-Have Skills**: Bonus or nice-to-have capabilities if mentioned in the JD.
   - 🌟 **Work Details & Offerings**: Location, Shift/Work Mode, and Perks (strictly derived from the provided JD).
4. Formatting: Output cleanly formatted text with clear headers and bullet points.`;

    const userPrompt = `Please enhance this Job Description:

${jobTitle ? `Job Title: ${jobTitle}\n` : ''}${companyName ? `Company: ${companyName}\n` : ''}
Original Job Description:
"""
${jobDescription.trim()}
"""`;

    let enhancedJD = '';
    const groqModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
    let lastErrMsg = '';

    for (const model of groqModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.4,
            max_tokens: 3000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          enhancedJD = data.choices?.[0]?.message?.content || '';
          if (enhancedJD) break;
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastErrMsg = errorData?.error?.message || `Groq responded with status ${response.status}`;
        }
      } catch (e: any) {
        lastErrMsg = e?.message || 'Connection error to Groq';
      }
    }

    if (!enhancedJD) {
      return NextResponse.json(
        { error: lastErrMsg || 'Failed to generate enhanced JD from Groq.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enhancedJD: enhancedJD.trim(),
    });
  } catch (error: any) {
    console.error('Enhance JD Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unexpected error while enhancing JD.' },
      { status: 500 }
    );
  }
}
