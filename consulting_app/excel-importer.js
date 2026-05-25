// Excel Importer module for the Business Consulting Toolkit
class ExcelImporter {
    constructor() {
        this.excelLib = null;
        this.loadExcelLibrary();
    }

    // Dynamically load SheetJS library
    async loadExcelLibrary() {
        if (typeof XLSX === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
            document.head.appendChild(script);
            
            // Wait for the library to load
            await new Promise((resolve) => {
                script.onload = () => resolve();
            });
            
            this.excelLib = XLSX;
        } else {
            this.excelLib = XLSX;
        }
    }

    // Import Excel file and convert to JSON
    async importExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = this.excelLib.read(data, { type: 'array' });
                    
                    // Convert all sheets to JSON
                    const result = {};
                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        result[sheetName] = this.excelLib.utils.sheet_to_json(worksheet);
                    });
                    
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    }

    // Process imported Excel data to match template format
    processExcelData(excelData, sheetName = null) {
        // If no sheet name specified, use the first available sheet
        if (!sheetName && excelData && Object.keys(excelData).length > 0) {
            sheetName = Object.keys(excelData)[0];
        }
        
        if (!sheetName || !excelData[sheetName]) {
            throw new Error('Invalid sheet name or no data found');
        }
        
        return excelData[sheetName]; // Return array of objects from the specified sheet
    }

    // Import Excel and convert to form response format
    async importToFormResponse(file) {
        const excelData = await this.importExcel(file);
        const processedData = this.processExcelData(excelData);
        
        // Convert to form response format
        const responses = processedData.map((row, index) => {
            const formData = {};
            // Convert each column in the row to a form field
            Object.keys(row).forEach(key => {
                formData[key] = row[key];
            });
            
            return {
                id: Date.now() + index, // Generate unique ID
                formData: formData,
                submittedAt: new Date().toISOString()
            };
        });
        
        return responses;
    }
}

// Export the ExcelImporter for use in other modules
// In a real environment with modules, you would use export
window.ExcelImporter = ExcelImporter;