import * as XLSX from 'xlsx';
import { EnrichedRowData } from './types';

export function writeWorkbook(data: EnrichedRowData[]): Buffer {
  // Create worksheet with proper column ordering
  const orderedData = data.map(row => ({
    Name: row.Name,
    JobTitle: row.JobTitle,
    CompanyName: row.CompanyName || '',
    CompanyWebsite: row.CompanyWebsite,
    LinkedInURL: row.LinkedInURL || '',
    Icebreaker1: row.Icebreaker1,
    Icebreaker2: row.Icebreaker2
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(orderedData);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 20 }, // Name
    { wch: 25 }, // JobTitle
    { wch: 25 }, // CompanyName
    { wch: 30 }, // CompanyWebsite
    { wch: 30 }, // LinkedInURL
    { wch: 50 }, // Icebreaker1
    { wch: 50 }  // Icebreaker2
  ];
  worksheet['!cols'] = columnWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'AI Icebreakers');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}