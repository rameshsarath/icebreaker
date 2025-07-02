export interface RowData {
  Name: string;
  JobTitle: string;
  CompanyWebsite: string;
  CompanyName?: string;
  LinkedInURL?: string;
  [key: string]: any;
}

export interface EnrichedRowData extends Record<string, unknown> {
  Name: string;
  JobTitle: string;
  CompanyWebsite: string;
  CompanyName?: string;
  LinkedInURL?: string;
  Icebreaker1: string;
  Icebreaker2: string;
}

export interface ProcessingProgress {
  current: number;
  total: number;
}