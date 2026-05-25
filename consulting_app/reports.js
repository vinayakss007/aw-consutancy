// Report generation functions
class ReportGenerator {
    constructor() {
        this.formManager = new FormManager();
    }

    // Kept for backward compatibility - will be deprecated
    async generateReport(customerId, templateId, formData) {
        const customers = await storageService.getAllCustomers();
        const templates = await storageService.getAllTemplates();
        const responses = await storageService.getResponsesByCustomer(customerId);

        const customer = customers.find(c => c.id == customerId);
        const template = templates.find(t => t.id == templateId);

        if (!customer || !template) {
            throw new Error('Customer or template not found');
        }

        // Generate report content using template and form data
        let reportContent = template.content || '';

        // Replace placeholders with actual data
        reportContent = reportContent.replace(/\{\{companyName\}\}/g, customer.companyName || '');
        reportContent = reportContent.replace(/\{\{contactName\}\}/g, customer.contactName || '');
        reportContent = reportContent.replace(/\{\{industry\}\}/g, customer.industry || '');

        // Replace form data placeholders
        if (formData) {
            for (const [key, value] of Object.entries(formData)) {
                reportContent = reportContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
            }
        }

        return {
            customer: customer,
            template: template,
            content: reportContent,
            date: new Date().toLocaleDateString()
        };
    }

    renderReportPreview(reportData) {
        const previewContainer = document.getElementById('reportPreview');
        previewContainer.innerHTML = `
            <div class="report-header">
                <h2>${reportData.template.title || 'Report'}</h2>
                <p>Generated for: ${reportData.customer.companyName}</p>
                <p>Date: ${reportData.date}</p>
            </div>
            <div class="report-content">
                ${reportData.content}
            </div>
        `;

        // Show the preview container
        previewContainer.classList.remove('hidden');
    }

    printReport() {
        const reportPreview = document.getElementById('reportPreview');
        if (!reportPreview.innerHTML.trim()) {
            alert('No report to print. Please generate a report first.');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Report - ${document.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .report-header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
                        .report-content { margin-top: 20px; }
                        .report-content p { margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    ${reportPreview.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    async exportToPDF() {
        // Basic PDF generation using browser APIs
        // In a real implementation, you would use a library like jsPDF
        alert('PDF export functionality would be implemented using jsPDF or similar library.');
    }
}