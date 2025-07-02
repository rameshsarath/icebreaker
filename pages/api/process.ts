import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import { OpenAI } from 'openai';
import PQueue from 'p-queue';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { processRow } from '@/lib/processRow';
import { writeWorkbook } from '@/lib/writeWorkbook';
import { RowData, EnrichedRowData } from '@/lib/types';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.' 
      });
    }

    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ 
        error: 'RapidAPI key is not configured. Please set RAPIDAPI_KEY in your environment variables.' 
      });
    }

    // Parse the uploaded file
    const buffer = Buffer.from(req.body.file, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: RowData[] = XLSX.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No data found in the uploaded file' });
    }

    // Validate required columns
    const requiredColumns = ['Name', 'JobTitle', 'CompanyWebsite'];
    const firstRow = rows[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}. Please ensure your Excel file has columns: Name, JobTitle, CompanyWebsite` 
      });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize queue for rate limiting (more conservative for stability)
    const queue = new PQueue({ 
      concurrency: 2, 
      interval: 60000, 
      intervalCap: 100 
    });

    // Process all rows with progress tracking
    console.log(`Starting to process ${rows.length} rows...`);
    
    const raw = await Promise.all(
      rows.map(r => queue.add(() =>
        processRow(r, openai, process.env.RAPIDAPI_KEY!)
      ))
    );

    const results: EnrichedRowData[] = raw.filter(
      (r): r is EnrichedRowData => !!r
    );

    console.log(`Completed processing ${results.length} rows`);

    // Write results to buffer
    const resultBuffer = writeWorkbook(results);

    // Save to tmp directory
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const fileId = uuidv4();
    const filePath = path.join(tmpDir, `${fileId}.xlsx`);
    fs.writeFileSync(filePath, resultBuffer);

    console.log(`File saved with ID: ${fileId} at path: ${filePath}`);

    res.status(200).json({ 
      fileId: fileId, // Return fileId instead of id
      processedRows: results.length,
      results: results.slice(0, 10) // Return first 10 for preview
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process file', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}