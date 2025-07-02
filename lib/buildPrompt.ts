import { RowData } from './types';

interface PromptData {
  prospectProfile: string;
  Name: string;
  JobTitle: string;
  companyDesc: string;
  CompanyName?: string;
}

export function buildPrompt(data: PromptData): string {
  const { prospectProfile, Name, JobTitle, companyDesc, CompanyName } = data;
  
  // Use prospect profile if available, otherwise use name and job title
  const prospectSection = prospectProfile 
    ? `Prospect_Profile: ${prospectProfile}`
    : `Prospect_Name: ${Name}\nProspect_Job_Title: ${JobTitle}`;
  
  // Include company name in the description if available
  const companySection = CompanyName 
    ? `Company_Name: ${CompanyName}\nCompany_Description: ${companyDesc}`
    : `Company_Description: ${companyDesc}`;
  
  return `Act as an expert B2B researcher-copywriter.

You will receive:
• Prospect_Profile – Full text copied from the prospect's LinkedIn profile (headline, experience, skills, tenure, achievements).  
  **If Prospect_Profile is unavailable, you will instead receive Prospect_Name and Prospect_Job_Title.**  
• Company_Description – Official company "About" section or overview text.

Your task  
Write exactly two personalized icebreakers, each 15–30 words and built on one vivid fact or metric from the inputs.

Icebreaker details
1 — Prospect Statement  
   Opener style: Fact-driven statement  
   Focus: Prospect only  
   Requirements  
   • Reference a specific responsibility, skill, project, or tenure milestone  
     **– If Prospect_Profile is unavailable, infer one plausible responsibility or milestone from the Job_Title and industry context.**  
   • Link that fact to a larger outcome (efficiency, growth, quality, etc.).  
   • End with a subtle curiosity hook—no pitch.

2 — Prospect + Company Question  
   Opener style: Laser-specific question  
   Focus: Prospect and company  
   Requirements  
   • Tie the prospect's role to company scale, mission, products, or impact.  
   • The question must be answerable in one sentence and hint at value.  
   • Avoid generic "pain-point" clichés; keep it warm, human, professional.

General constraints  
• 15–30 words each.  
• Use one clear metric or fact per line.  
• No selling, no multiple questions, no clichés.  
• **If explicit metrics are missing, synthesize a reasonable, role-relevant metric or fact from available inputs.**

Output format (verbatim):
1. Prospect-Focused Statement Icebreaker:
[Your 15–30-word statement]

2. Prospect + Company Question Icebreaker:
[Your 15–30-word question]

${prospectSection}

${companySection}`;
}