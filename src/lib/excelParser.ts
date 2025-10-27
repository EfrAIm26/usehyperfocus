// Excel/CSV Parser for generating Mermaid diagrams
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  rawData: any[][];
}

/**
 * Parse Excel file to structured data
 */
export function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          reject(new Error('Empty file'));
          return;
        }
        
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1).map((row) => {
          const rowObj: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index];
          });
          return rowObj;
        });
        
        resolve({
          headers,
          rows,
          rawData: jsonData,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse CSV file to structured data
 */
export function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const rawData = results.data as any[][];
          
          if (rawData.length === 0) {
            reject(new Error('Empty file'));
            return;
          }
          
          const headers = rawData[0] as string[];
          const rows = rawData.slice(1).map((row) => {
            const rowObj: Record<string, any> = {};
            headers.forEach((header, index) => {
              rowObj[header] = row[index];
            });
            return rowObj;
          });
          
          resolve({
            headers,
            rows: rows.filter(row => Object.values(row).some(v => v !== null && v !== '')),
            rawData,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error),
    });
  });
}

/**
 * Generate Mermaid Pie Chart from data
 * CORRECTED SYNTAX: Mermaid pie chart uses "pie" directive with showData
 */
export function generatePieChart(data: ParsedData, labelColumn: string, valueColumn: string): string {
  const validRows = data.rows.filter(row => row[labelColumn] && row[valueColumn]);
  
  if (validRows.length === 0) {
    throw new Error('No valid data for pie chart');
  }
  
  // Mermaid Pie Chart Syntax (CORRECTED)
  let mermaidCode = 'pie showData\n';
  mermaidCode += `    title ${labelColumn} Distribution\n`;
  
  validRows.forEach((row) => {
    const label = String(row[labelColumn]).replace(/"/g, '\\"');
    const value = Number(row[valueColumn]) || 0;
    mermaidCode += `    "${label}" : ${value}\n`;
  });
  
  return mermaidCode;
}

/**
 * Generate Mermaid Sankey Diagram from data
 */
export function generateSankeyDiagram(
  data: ParsedData,
  sourceColumn: string,
  targetColumn: string,
  valueColumn: string
): string {
  const validRows = data.rows.filter(
    row => row[sourceColumn] && row[targetColumn] && row[valueColumn]
  );
  
  if (validRows.length === 0) {
    throw new Error('No valid data for Sankey diagram');
  }
  
  // Mermaid Sankey Diagram Syntax
  let mermaidCode = '%%{init: {"theme": "base", "themeVariables": {"fontSize": "16px"}}}%%\n';
  mermaidCode += 'sankey-beta\n\n';
  
  validRows.forEach((row) => {
    const source = String(row[sourceColumn]).replace(/,/g, ' ');
    const target = String(row[targetColumn]).replace(/,/g, ' ');
    const value = Number(row[valueColumn]) || 0;
    mermaidCode += `${source},${target},${value}\n`;
  });
  
  return mermaidCode;
}

/**
 * Generate Mermaid Bar Chart from data
 */
export function generateBarChart(data: ParsedData, labelColumn: string, valueColumn: string): string {
  const validRows = data.rows.filter(row => row[labelColumn] && row[valueColumn]);
  
  if (validRows.length === 0) {
    throw new Error('No valid data for bar chart');
  }
  
  // Mermaid Bar Chart (XY Chart)
  let mermaidCode = 'xychart-beta\n';
  mermaidCode += `    title "${labelColumn} vs ${valueColumn}"\n`;
  mermaidCode += `    x-axis [${validRows.map(r => `"${r[labelColumn]}"`).join(', ')}]\n`;
  mermaidCode += `    y-axis "${valueColumn}"\n`;
  mermaidCode += `    bar [${validRows.map(r => r[valueColumn]).join(', ')}]\n`;
  
  return mermaidCode;
}

/**
 * Count occurrences for categorical data (for pie charts)
 */
export function countOccurrences(data: ParsedData, column: string): ParsedData {
  const counts: Record<string, number> = {};
  
  data.rows.forEach((row) => {
    const value = String(row[column] || 'Unknown');
    counts[value] = (counts[value] || 0) + 1;
  });
  
  const headers = [column, 'Count'];
  const rows = Object.entries(counts).map(([key, value]) => ({
    [column]: key,
    'Count': value,
  }));
  
  return {
    headers,
    rows,
    rawData: [headers, ...rows.map(r => Object.values(r))],
  };
}

