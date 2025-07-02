export async function scrapeLinkedIn(linkedInUrl: string, rapidApiKey: string): Promise<string> {
  try {
    const response = await fetch(
      'https://linkedin-data-scraper.p.rapidapi.com/profile',
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'linkedin-data-scraper.p.rapidapi.com'
        },
        body: JSON.stringify({ url: linkedInUrl })
      }
    );
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract relevant profile information
    const profileSummary = {
      headline: data.headline || '',
      summary: data.summary || '',
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || []
    };
    
    // Return formatted profile data
    return JSON.stringify(profileSummary, null, 2);
  } catch (error) {
    console.error('Error scraping LinkedIn:', error);
    throw new Error('LinkedIn profile data unavailable');
  }
}