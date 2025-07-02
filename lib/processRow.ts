import { OpenAI } from 'openai';
import { scrapeLinkedIn } from './scrapeLinkedIn';
import { buildPrompt } from './buildPrompt';
import { RowData, EnrichedRowData } from './types';

export async function processRow(
  row: any,
  openai: OpenAI,
  rapidApiKey: string
): Promise<EnrichedRowData> {
  const { Name, JobTitle, CompanyWebsite, CompanyName, LinkedInURL } = row;
  
  try {
    // 1️⃣ Company research using GPT-4 with search
    const companyDesc = await researchCompany(CompanyWebsite, CompanyName, openai);
    
    // 2️⃣ Prospect profile from LinkedIn (optional)
    let prospectProfile = '';
    if (LinkedInURL && LinkedInURL.trim()) {
      try {
        prospectProfile = await scrapeLinkedIn(LinkedInURL, rapidApiKey);
      } catch (error) {
        console.warn('LinkedIn scraping failed for:', LinkedInURL, error);
        // Continue without LinkedIn data
      }
    }
    
    // 3️⃣ Build expert B2B copywriter prompt
    const prompt = buildPrompt({ 
      prospectProfile, 
      Name, 
      JobTitle, 
      companyDesc,
      CompanyName: CompanyName || ''
    });
    
    // 4️⃣ Generate icebreakers using GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const content = completion.choices[0].message.content || '';
    
    // Parse the structured output with improved regex
    const icebreaker1Match = content.match(/1\.\s*Prospect-Focused Statement Icebreaker:\s*(.+?)(?=\n2\.|$)/s);
    const icebreaker2Match = content.match(/2\.\s*Prospect \+ Company Question Icebreaker:\s*(.+?)$/s);
    
    let icebreaker1 = icebreaker1Match ? icebreaker1Match[1].trim() : '';
    let icebreaker2 = icebreaker2Match ? icebreaker2Match[1].trim() : '';
    
    // Fallback parsing if structured format fails
    if (!icebreaker1 || !icebreaker2) {
      const lines = content.split('\n').filter(line => line.trim() && !line.includes('Icebreaker:'));
      icebreaker1 = lines[0]?.trim() || '';
      icebreaker2 = lines[1]?.trim() || '';
    }
    
    return { 
      ...row, 
      Icebreaker1: icebreaker1 || '',
      Icebreaker2: icebreaker2 || ''
    };
  } catch (error) {
    console.error('Error processing row for:', Name, error);
    return {
      ...row,
      Icebreaker1: '',
      Icebreaker2: ''
    };
  }
}

async function researchCompany(companyWebsite: string, companyName: string | undefined, openai: OpenAI): Promise<string> {
  try {
    // Check if companyWebsite is valid
    if (!companyWebsite || typeof companyWebsite !== 'string' || !companyWebsite.trim()) {
      return `Company research unavailable - no website provided for ${companyName || 'this company'}.`;
    }
    
    const companyDomain = companyWebsite.replace(/^https?:\/\//, '').split('/')[0];
    
    // Build comprehensive research query
    const searchQuery = companyName 
      ? `Research ${companyName} company (website: ${companyWebsite}). Provide comprehensive business summary including core business, recent developments, company scale, unique differentiators, and industry context.`
      : `Research the company at ${companyDomain}. Provide comprehensive business summary including core business, recent developments, company scale, unique differentiators, and industry context.`;
    
    // Try gpt-4o-search-preview with Chat Completions
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-search-preview",
        tools: [{ type: "web_search" } as any],
        tool_choice: "auto",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `${searchQuery}

Focus on factual, recent information that would be valuable for B2B sales outreach. Prioritize concrete details over generic descriptions. Keep response under 600 words.`
        }]
      });
      
      const result = completion.choices[0].message.content || 'No company information found.';
      
      if (result.length < 50) {
        return `${companyName || companyDomain} - Company research in progress. Please check their website at ${companyWebsite} for more details.`;
      }
      
      return result;
      
    } catch (chatSearchError) {
      console.log('Chat Completions search failed, using fallback approach:', chatSearchError);
      
      // Fallback: Use regular GPT-4o-mini without search
      const fallbackCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 600,
        temperature: 0.3,
        messages: [{
          role: "user",
          content: `Based on your knowledge, provide information about the company at ${companyWebsite}${companyName ? ` (${companyName})` : ''}. Include:

1. What type of business they likely operate
2. Industry sector and typical services/products
3. General company profile and market position
4. Key business characteristics

Note: This is based on general knowledge. For the most current information, visit their website at ${companyWebsite}.`
        }]
      });
      
      const fallbackResult = fallbackCompletion.choices[0].message.content || 'Company information unavailable.';
      return `${fallbackResult}\n\nNote: For the most current information, please visit ${companyWebsite}`;
    }
    
  } catch (error) {
    console.error('Error researching company:', companyWebsite, error);
    return `Company research unavailable for ${companyName || companyWebsite || 'this company'}. Please visit their website for more information.`;
  }
}