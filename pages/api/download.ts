import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing file ID' });
  }

  try {
    const filePath = path.join(process.cwd(), 'tmp', `${id}.xlsx`);
    
    console.log(`Looking for file at: ${filePath}`);
    console.log(`File exists: ${fs.existsSync(filePath)}`);
    
    if (!fs.existsSync(filePath)) {
      // List all files in tmp directory for debugging
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (fs.existsSync(tmpDir)) {
        const files = fs.readdirSync(tmpDir);
        console.log(`Files in tmp directory:`, files);
      }
      
      return res.status(404).json({ error: 'File not found or expired' });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-icebreakers-enriched.xlsx"');
    res.setHeader('Content-Length', fileBuffer.length);
    
    res.end(fileBuffer);

    // Clean up file after download (with delay to ensure download completes)
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up temporary file: ${id}`);
        }
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }
    }, 10000); // 10 second delay

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}