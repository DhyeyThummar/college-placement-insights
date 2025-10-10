import { Response } from 'express';
import Papa from 'papaparse';
import PlacementData from '../models/PlacementData.js';
import { AuthRequest } from '../middleware/auth.js';

type CsvRow = {
  batchYear: string;
  studentName: string;
  branch: string;
  company: string;
  package: string;
  status: string;
};

export const downloadCsvTemplate = async (_req: AuthRequest, res: Response) => {
  try {
    const templateData = [
      {
        batchYear: '2024',
        studentName: 'John Doe',
        branch: 'Computer Science',
        company: 'Tech Corp',
        package: '12.5',
        status: 'Placed'
      },
      {
        batchYear: '2024',
        studentName: 'Jane Smith',
        branch: 'Information Technology',
        company: 'Software Solutions Inc',
        package: '15.0',
        status: 'Placed'
      },
      {
        batchYear: '2024',
        studentName: 'Mike Johnson',
        branch: 'Electronics',
        company: 'Hardware Corp',
        package: '8.5',
        status: 'Not Placed'
      },
      {
        batchYear: '2024',
        studentName: 'Sarah Wilson',
        branch: 'Mechanical',
        company: 'Engineering Ltd',
        package: '6.0',
        status: 'Intern'
      }
    ];
    
    const csv = Papa.unparse(templateData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=placement_data_template.csv');
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate template' });
  }
};

export const uploadCsv = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'CSV file is required' });
    if (!req.user?.collegeId) return res.status(400).json({ error: 'Missing admin collegeId' });

    const csv = req.file.buffer.toString('utf-8');
    console.log('CSV content preview:', csv.substring(0, 200));
    
    const parsed = Papa.parse<CsvRow>(csv, { header: true, skipEmptyLines: true });
    console.log('Parsed CSV data:', parsed.data);
    console.log('CSV parse errors:', parsed.errors);
    
    if (parsed.errors.length) {
      return res.status(400).json({ error: 'CSV parse error', details: parsed.errors.slice(0, 3) });
    }

    const rows = parsed.data;
    console.log(`Processing ${rows.length} rows`);
    const docs: any[] = [];

    rows.forEach((row, idx) => {
      // Replace null/empty values with 0 or default values
      const processedRow = {
        collegeId: req.user!.collegeId!,
        batchYear: row.batchYear && String(row.batchYear).trim() !== '' ? row.batchYear : 0,
        studentName: row.studentName && String(row.studentName).trim() !== '' ? String(row.studentName).trim() : '0',
        branch: row.branch && String(row.branch).trim() !== '' ? String(row.branch).trim() : '0',
        company: row.company && String(row.company).trim() !== '' ? String(row.company).trim() : '0',
        package: row.package && String(row.package).trim() !== '' ? row.package : 0,
        status: row.status && String(row.status).trim() !== '' ? String(row.status).trim() : '0',
      };
      
      console.log(`Row ${idx + 1} processed:`, processedRow);
      docs.push(processedRow);
    });

    await PlacementData.insertMany(docs, { ordered: false });
    res.json({ success: true, inserted: docs.length });
  } catch (e) {
    res.status(500).json({ error: 'Upload failed' });
  }
};


