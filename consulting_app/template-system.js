// Advanced Template System for the Business Consulting Toolkit
class TemplateSystem {
    constructor() {
        this.templates = [];
        this.combinedTemplates = [];
    }

    // Load all existing templates from storage
    async loadTemplates() {
        try {
            this.templates = await storageService.getAllTemplates();
            return this.templates;
        } catch (error) {
            console.error('Error loading templates:', error);
            return [];
        }
    }

    // Create a new detailed template with sections
    createDetailedTemplate(title, sections = []) {
        const template = {
            id: Date.now() + Math.random(),
            title: title,
            sections: sections, // Array of sections with content and placeholders
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCombined: false,
            combinedTemplateIds: [] // For combined templates
        };
        
        return template;
    }

    // Create a section for a template
    createSection(name, content, placeholders = [], type = 'text') {
        return {
            name: name,
            content: content,
            placeholders: placeholders, // Array of placeholder objects {name, description}
            type: type, // 'text', 'table', 'chart', 'image', etc.
            order: 0
        };
    }

    // Save template to storage
    async saveTemplate(template) {
        try {
            // Add the template to storage
            await storageService.addTemplate(template);
            // Reload templates to ensure we have the latest data
            await this.loadTemplates();
            return true;
        } catch (error) {
            console.error('Error saving template:', error);
            return false;
        }
    }

    // Combine multiple templates into a larger document
    combineTemplates(templateIds, combinedTitle) {
        const combinedTemplate = {
            id: Date.now() + Math.random(),
            title: combinedTitle,
            sections: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCombined: true,
            combinedTemplateIds: [...templateIds] // Store IDs of templates that were combined
        };

        // Aggregate sections from all templates being combined
        templateIds.forEach(templateId => {
            const sourceTemplate = this.templates.find(t => t.id == templateId);
            if (sourceTemplate) {
                if (sourceTemplate.isCombined) {
                    // If it's already a combined template, add its sections directly
                    combinedTemplate.sections.push(...sourceTemplate.sections);
                } else {
                    // Add sections from a regular template
                    combinedTemplate.sections.push(...sourceTemplate.sections);
                }
            }
        });

        // Sort sections by their original order
        combinedTemplate.sections.sort((a, b) => a.order - b.order);

        return combinedTemplate;
    }

    // Fill template with data from Excel or form responses
    fillTemplate(template, data) {
        let filledContent = '';
        
        if (template.isCombined) {
            // Process each template in the combined template
            template.combinedTemplateIds.forEach(templateId => {
                const sourceTemplate = this.templates.find(t => t.id == templateId);
                if (sourceTemplate) {
                    filledContent += this.fillSingleTemplate(sourceTemplate, data) + '\n\n';
                }
            });
        } else {
            // Process a single template
            filledContent = this.fillSingleTemplate(template, data);
        }

        return filledContent;
    }

    // Fill a single template with data
    fillSingleTemplate(template, data) {
        let filledContent = '';
        
        template.sections.forEach(section => {
            let sectionContent = section.content;
            
            // Replace placeholders with actual data
            section.placeholders.forEach(placeholder => {
                const placeholderKey = placeholder.name;
                const placeholderValue = data[placeholderKey] || `{{${placeholderKey}}}`; // Keep placeholder if no data found
                const regex = new RegExp(`{{${placeholderKey}}}`, 'g');
                sectionContent = sectionContent.replace(regex, placeholderValue);
            });
            
            // Add customer data if available
            if (data.customer) {
                sectionContent = sectionContent.replace(/\{\{customer\.companyName\}\}/g, data.customer.companyName || '');
                sectionContent = sectionContent.replace(/\{\{customer\.contactName\}\}/g, data.customer.contactName || '');
                sectionContent = sectionContent.replace(/\{\{customer\.industry\}\}/g, data.customer.industry || '');
                sectionContent = sectionContent.replace(/\{\{customer\.email\}\}/g, data.customer.email || '');
                sectionContent = sectionContent.replace(/\{\{customer\.phone\}\}/g, data.customer.phone || '');
            }
            
            filledContent += sectionContent + '\n\n';
        });
        
        return filledContent;
    }

    // Generate report using template and Excel data
    async generateReportFromExcel(templateId, customerId, excelData) {
        // Get the template
        const template = this.templates.find(t => t.id == templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        // Get customer data
        const customers = await storageService.getAllCustomers();
        const customer = customers.find(c => c.id == customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Process Excel data and combine with customer data
        const data = {
            customer: customer,
            ...excelData
        };

        // Fill the template with data
        const filledContent = this.fillTemplate(template, data);

        return {
            customer: customer,
            template: template,
            content: filledContent,
            date: new Date().toLocaleDateString(),
            source: 'excel'
        };
    }

    // Export template to a downloadable format
    exportTemplate(templateId) {
        const template = this.templates.find(t => t.id == templateId);
        if (!template) {
            throw new Error('Template not found');
        }
        
        const dataStr = JSON.stringify(template, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${template.title.replace(/\s+/g, '_')}_template.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Import template from file
    async importTemplateFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const template = JSON.parse(e.target.result);
                    // Validate template structure
                    if (!template.title || !template.sections) {
                        reject(new Error('Invalid template format'));
                        return;
                    }
                    
                    // Save the imported template
                    this.saveTemplate(template)
                        .then(() => resolve(template))
                        .catch(reject);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }
}

// Global template system instance
window.templateSystem = new TemplateSystem();