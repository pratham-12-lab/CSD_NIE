// Parse PDF files
export const parsePDF = async (file) => {
  try {
    // Use pdf-parse library via a simple approach
    // We'll read the file and send to backend for parsing
    const formData = new FormData();
    formData.append('file', file);
    
    // Return the file for backend processing
    return { type: 'pdf', file, fileName: file.name };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
};

// Parse DOCX files
export const parseDOCX = async (file) => {
  try {
    // Read DOCX file - we'll send to backend for proper parsing
    return { type: 'docx', file, fileName: file.name };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
};

// Parse TXT files
export const parseTXT = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        resolve({
          type: 'txt',
          content: text,
          fileName: file.name,
        });
      } catch (error) {
        reject(new Error('Failed to read TXT file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Main function to parse any resume file
export const parseResumeFile = async (file) => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.txt')) {
    return await parseTXT(file);
  } else if (fileName.endsWith('.pdf')) {
    return await parsePDF(file);
  } else if (fileName.endsWith('.docx')) {
    return await parseDOCX(file);
  } else {
    throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
  }
};

export default { parseResumeFile, parsePDF, parseDOCX, parseTXT };
