// Main application logic
class ConsultingApp {
    constructor() {
        this.storageService = storageService;
        this.formManager = new FormManager();
        this.reportGenerator = new ReportGenerator();
        this.excelImporter = new ExcelImporter();
        this.templateSystem = templateSystem;
        this.currentTab = 'customersTab';

        this.init();
    }

    async init() {
        await this.storageService.init();
        this.bindEvents();
        await this.loadInitialData();
        this.registerServiceWorker();
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.id);
            });
        });

        // Customer management
        document.getElementById('addCustomerBtn').addEventListener('click', () => {
            document.getElementById('customerForm').classList.remove('hidden');
        });

        document.getElementById('saveCustomerBtn').addEventListener('click', () => this.saveCustomer());
        document.getElementById('cancelCustomerBtn').addEventListener('click', () => {
            document.getElementById('customerForm').classList.add('hidden');
        });

        // Form management
        document.getElementById('createFormBtn').addEventListener('click', () => {
            document.getElementById('formCreator').classList.remove('hidden');
            document.getElementById('formTitle').value = '';
            this.formManager.currentFormFields = [];
            this.formManager.renderFormFields();
        });

        document.getElementById('importFormBtn').addEventListener('click', () => {
            this.importFormFromExcel();
        });

        document.getElementById('addFieldBtn').addEventListener('click', () => {
            const field = this.formManager.createField('text', 'New Field', 'Enter value here');
            this.formManager.addFieldToForm(field);
        });

        document.getElementById('saveFormBtn').addEventListener('click', () => this.formManager.saveForm());
        document.getElementById('cancelFormBtn').addEventListener('click', () => {
            document.getElementById('formCreator').classList.add('hidden');
        });

        // Report generation
        document.getElementById('generateReportBtn2').addEventListener('click', () => this.generateReport());
        document.getElementById('previewReportBtn').addEventListener('click', () => this.previewReport());
        document.getElementById('printReportBtn').addEventListener('click', () => this.reportGenerator.printReport());
        document.getElementById('importExcelForReportBtn').addEventListener('click', () => this.importExcelForReport());

        // Template management
        document.getElementById('addTemplateBtn').addEventListener('click', () => {
            this.showTemplateEditor();
        });

        document.getElementById('addSectionBtn').addEventListener('click', () => {
            this.addTemplateSection();
        });

        document.getElementById('saveTemplateBtn').addEventListener('click', () => this.saveTemplate());
        document.getElementById('cancelTemplateBtn').addEventListener('click', () => {
            document.getElementById('templateEditor').classList.add('hidden');
            document.getElementById('combineTemplatesModal').classList.add('hidden');
        });

        // Template combination
        document.getElementById('combineTemplatesBtn').addEventListener('click', () => {
            this.showCombineTemplatesModal();
        });

        document.getElementById('combineSaveBtn').addEventListener('click', () => {
            this.combineTemplates();
        });

        document.getElementById('combineCancelBtn').addEventListener('click', () => {
            document.getElementById('combineTemplatesModal').classList.add('hidden');
        });

        // Template import
        document.getElementById('importTemplateBtn').addEventListener('click', () => {
            this.importTemplateFile();
        });
    }

    switchTab(tabId) {
        // Hide current section
        document.getElementById(this.currentTab.replace('Tab', 'Section')).classList.remove('active');
        document.getElementById(this.currentTab).classList.remove('active');
        
        // Show new section
        document.getElementById(tabId.replace('Tab', 'Section')).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        this.currentTab = tabId;

        // Load data based on tab
        if (tabId === 'customersTab') {
            this.renderCustomers();
        } else if (tabId === 'formsTab') {
            this.renderForms();
        } else if (tabId === 'templatesTab') {
            this.renderTemplates();
        }
    }

    async saveCustomer() {
        const customer = {
            companyName: document.getElementById('companyName').value,
            contactName: document.getElementById('contactName').value,
            industry: document.getElementById('industry').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            createdAt: new Date().toISOString()
        };

        if (!customer.companyName) {
            alert('Company name is required');
            return;
        }

        await this.storageService.addCustomer(customer);
        document.getElementById('customerForm').classList.add('hidden');
        await this.renderCustomers();
        alert('Customer saved successfully!');
    }

    async renderCustomers() {
        const customers = await this.storageService.getAllCustomers();
        const tbody = document.getElementById('customerTableBody');
        tbody.innerHTML = '';

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.companyName}</td>
                <td>${customer.contactName}</td>
                <td>${customer.industry}</td>
                <td>
                    <button class="btn-secondary" onclick="app.editCustomer(${customer.id})">Edit</button>
                    <button class="btn-secondary" onclick="app.deleteCustomer(${customer.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update customer dropdown for reports
        const customerSelect = document.getElementById('selectCustomer');
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.companyName;
            customerSelect.appendChild(option);
        });
    }

    async editCustomer(customerId) {
        const customers = await this.storageService.getAllCustomers();
        const customer = customers.find(c => c.id == customerId);
        
        if (customer) {
            document.getElementById('companyName').value = customer.companyName;
            document.getElementById('contactName').value = customer.contactName;
            document.getElementById('industry').value = customer.industry;
            document.getElementById('email').value = customer.email;
            document.getElementById('phone').value = customer.phone;
            
            document.getElementById('customerForm').classList.remove('hidden');
            
            // Remove the old customer and update with new data
            const saveBtn = document.getElementById('saveCustomerBtn');
            const originalClickHandler = saveBtn.onclick;
            
            saveBtn.onclick = async () => {
                customer.companyName = document.getElementById('companyName').value;
                customer.contactName = document.getElementById('contactName').value;
                customer.industry = document.getElementById('industry').value;
                customer.email = document.getElementById('email').value;
                customer.phone = document.getElementById('phone').value;
                
                // For simplicity, delete and re-add (in real app, use put operation)
                await this.storageService.deleteCustomer(customerId);
                await this.storageService.addCustomer(customer);
                
                document.getElementById('customerForm').classList.add('hidden');
                await this.renderCustomers();
                saveBtn.onclick = originalClickHandler;
            };
        }
    }

    async deleteCustomer(customerId) {
        if (confirm('Are you sure you want to delete this customer?')) {
            await this.storageService.deleteCustomer(customerId);
            await this.renderCustomers();
        }
    }

    async renderForms() {
        const forms = await this.storageService.getAllForms();
        const tbody = document.getElementById('formTableBody');
        tbody.innerHTML = '';

        forms.forEach(form => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${form.title}</td>
                <td>${new Date(form.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn-secondary" onclick="app.loadFormForFilling(${form.id})">Use Form</button>
                    <button class="btn-secondary" onclick="app.deleteForm(${form.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadFormForFilling(formId) {
        // Get selected customer from dropdown
        const customerSelect = document.getElementById('selectCustomer');
        const customerId = customerSelect.value;
        
        if (!customerId) {
            alert('Please select a customer first');
            return;
        }
        
        this.formManager.loadFormForFilling(formId, customerId);
    }

    async deleteForm(formId) {
        if (confirm('Are you sure you want to delete this form?')) {
            // In real implementation, you would need to delete from IndexedDB
            alert('Form deletion would be implemented in the full version');
        }
    }

    async renderTemplates() {
        const templates = await this.storageService.getAllTemplates();
        const tbody = document.getElementById('templateTableBody');
        tbody.innerHTML = '';

        templates.forEach(template => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${template.title}</td>
                <td>${new Date(template.createdAt).toLocaleDateString()}</td>
                <td>${template.isCombined ? 'Combined' : 'Regular'}</td>
                <td>
                    <button class="btn-secondary" onclick="app.editTemplate(${template.id})">Edit</button>
                    <button class="btn-secondary" onclick="app.deleteTemplate(${template.id})">Delete</button>
                    ${template.isCombined ? `<button class="btn-secondary" onclick="app.viewCombinedTemplate(${template.id})">View Components</button>` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update template dropdown for reports
        const templateSelect = document.getElementById('selectTemplate');
        templateSelect.innerHTML = '<option value="">Select Template</option>';
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.title;
            templateSelect.appendChild(option);
        });
    }

    async editTemplate(templateId) {
        const templates = await this.storageService.getAllTemplates();
        const template = templates.find(t => t.id == templateId);

        if (template) {
            this.showTemplateEditor(template);
        }
    }

    // View components of a combined template
    async viewCombinedTemplate(templateId) {
        const templates = await this.storageService.getAllTemplates();
        const template = templates.find(t => t.id == templateId);

        if (template && template.isCombined) {
            let componentList = 'Components of "' + template.title + '":\n\n';

            template.combinedTemplateIds.forEach(id => {
                const component = templates.find(t => t.id == id);
                if (component) {
                    componentList += '- ' + component.title + '\n';
                }
            });

            alert(componentList);
        }
    }

    async generateReport() {
        const customerId = document.getElementById('selectCustomer').value;
        const templateId = document.getElementById('selectTemplate').value;

        if (!customerId || !templateId) {
            alert('Please select both customer and template');
            return;
        }

        // Collect form data from rendered form fields
        const formData = {};
        document.querySelectorAll('#reportFormContainer .form-field input, #reportFormContainer .form-field textarea, #reportFormContainer .form-field select').forEach(field => {
            formData[field.id] = field.value;
        });

        try {
            // Use the template system to generate report with Excel data support
            const report = await this.generateReportWithTemplateSystem(customerId, templateId, formData);
            this.reportGenerator.renderReportPreview(report);

            // Hide the Excel import notice after generating report
            const notice = document.getElementById('excelImportNotice');
            if (notice) {
                notice.classList.add('hidden');
            }
        } catch (error) {
            alert('Error generating report: ' + error.message);
        }
    }

    // Generate report using the advanced template system
    async generateReportWithTemplateSystem(customerId, templateId, formData) {
        // Get the template from the template system
        const templates = await this.templateSystem.loadTemplates();
        const template = templates.find(t => t.id == templateId);

        if (!template) {
            throw new Error('Template not found');
        }

        // Get customer data
        const customers = await this.storageService.getAllCustomers();
        const customer = customers.find(c => c.id == customerId);

        if (!customer) {
            throw new Error('Customer not found');
        }

        // Prepare data for template filling
        const data = {
            customer: customer,
            ...formData
        };

        // Use the template system to fill the template
        const filledContent = this.templateSystem.fillTemplate(template, data);

        return {
            customer: customer,
            template: template,
            content: filledContent,
            date: new Date().toLocaleDateString()
        };
    }

    async previewReport() {
        // This is now handled by the generateReport function
        alert('Report preview is shown after generation');
    }

    async loadInitialData() {
        await this.renderCustomers();
        await this.renderForms();
        await this.renderTemplates();
    }

    // Import form from Excel file
    async importFormFromExcel() {
        // Create a temporary file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx, .xls';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                // Import the Excel data
                const excelData = await this.excelImporter.importExcel(file);

                // Process and display the data to let user confirm
                this.processExcelForTemplate(excelData);

            } catch (error) {
                console.error('Error importing Excel:', error);
                alert('Error importing Excel file: ' + error.message);
            }
        };

        fileInput.click();
    }

    // Import Excel data directly for report generation
    async importExcelForReport() {
        // Create a temporary file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx, .xls';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                // Import the Excel data
                const excelData = await this.excelImporter.importExcel(file);

                // Show the first sheet's data to use for the report
                const sheetName = Object.keys(excelData)[0];
                const sheetData = excelData[sheetName];

                if (!sheetData || sheetData.length === 0) {
                    alert('No data found in Excel file');
                    return;
                }

                // Use the first row as form fields in the report section
                this.populateReportFormFromExcel(sheetData[0]);

            } catch (error) {
                console.error('Error importing Excel:', error);
                alert('Error importing Excel file: ' + error.message);
            }
        };

        fileInput.click();
    }

    // Populate report form with Excel data
    populateReportFormFromExcel(excelRow) {
        const container = document.getElementById('reportFormContainer');

        // Show the Excel import notice
        const notice = document.getElementById('excelImportNotice');
        notice.classList.remove('hidden');

        // Clear existing form fields (but keep the notice)
        while (container.children.length > 1) { // Keep the first child (notice)
            if (container.lastChild.id !== 'excelImportNotice') {
                container.removeChild(container.lastChild);
            } else {
                break;
            }
        }

        // Create form fields from Excel data
        Object.keys(excelRow).forEach(key => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-field';

            const label = document.createElement('label');
            label.textContent = key;
            label.htmlFor = key;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = key;
            input.placeholder = key;
            input.value = excelRow[key] || '';

            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            container.appendChild(fieldDiv);
        });
    }

    // Process Excel data to create templates
    async processExcelForTemplate(excelData) {
        // Get the first sheet data
        const sheetName = Object.keys(excelData)[0];
        const sheetData = excelData[sheetName];

        if (!sheetData || sheetData.length === 0) {
            alert('No data found in the Excel file');
            return;
        }

        // Create a template based on the Excel data structure
        const firstRow = sheetData[0];
        const placeholders = Object.keys(firstRow).map(key => ({
            name: key,
            description: key
        }));

        // Create template sections based on Excel data
        const sections = [{
            name: 'Excel Data Section',
            content: this.generateTemplateContent(placeholders),
            placeholders: placeholders,
            type: 'data',
            order: 0
        }];

        // Show template editor with generated content
        document.getElementById('templateEditor').classList.remove('hidden');
        document.getElementById('templateTitle').value = 'Template from Excel: ' + sheetName;

        // Create a textarea for template content
        const templateContent = this.generateTemplateContent(placeholders);
        document.getElementById('templateContent').value = templateContent;
    }

    // Generate template content with placeholders based on Excel columns
    generateTemplateContent(placeholders) {
        let content = '# Excel Data Report\n\n';

        placeholders.forEach(placeholder => {
            content += `**${placeholder.name}:** {{${placeholder.name}}}\n\n`;
        });

        return content;
    }

    // Show template editor with empty sections
    showTemplateEditor(template = null) {
        document.getElementById('templateEditor').classList.remove('hidden');

        if (template) {
            // Editing existing template
            document.getElementById('templateEditorTitle').textContent = 'Edit Template';
            document.getElementById('templateTitle').value = template.title;

            // Clear existing sections
            document.getElementById('sectionsList').innerHTML = '';

            // Add sections for existing template
            template.sections.forEach(section => {
                this.addTemplateSection(section);
            });
        } else {
            // Creating new template
            document.getElementById('templateEditorTitle').textContent = 'Create New Template';
            document.getElementById('templateTitle').value = '';

            // Clear existing sections
            document.getElementById('sectionsList').innerHTML = '';

            // Add a default section
            this.addTemplateSection();
        }
    }

    // Add a new section to the template editor
    addTemplateSection(section = null) {
        const sectionsContainer = document.getElementById('sectionsList');
        const sectionId = 'section_' + Date.now();

        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'template-section';
        sectionDiv.id = sectionId;

        // Section data from parameter or defaults
        const sectionTitle = section ? section.name : 'New Section';
        const sectionContent = section ? section.content : '';
        const sectionType = section ? section.type : 'text';
        const placeholders = section ? section.placeholders : [];

        sectionDiv.innerHTML = `
            <div class="section-header">
                <input type="text" class="section-title" value="${sectionTitle}" placeholder="Section Title">
                <div class="section-actions">
                    <button class="btn-secondary remove-section-btn">Remove</button>
                    <button class="btn-secondary add-placeholder-btn">Add Placeholder</button>
                </div>
            </div>
            <div class="section-content">
                <select class="section-type">
                    <option value="text" ${sectionType === 'text' ? 'selected' : ''}>Text</option>
                    <option value="table" ${sectionType === 'table' ? 'selected' : ''}>Table</option>
                    <option value="chart" ${sectionType === 'chart' ? 'selected' : ''}>Chart</option>
                    <option value="image" ${sectionType === 'image' ? 'selected' : ''}>Image</option>
                    <option value="data" ${sectionType === 'data' ? 'selected' : ''}>Data</option>
                </select>
                <textarea class="section-content-textarea" placeholder="Section content with placeholders like {{name}}">${sectionContent}</textarea>
            </div>
            <div class="section-placeholders">
                <h5>Placeholders:</h5>
                <div class="placeholders-list">
                    <!-- Placeholders will be added here -->
                </div>
            </div>
        `;

        sectionsContainer.appendChild(sectionDiv);

        // Add existing placeholders if editing
        if (placeholders && placeholders.length > 0) {
            const placeholdersContainer = sectionDiv.querySelector('.placeholders-list');
            placeholders.forEach(placeholder => {
                this.addPlaceholderToSection(placeholdersContainer, placeholder.name, placeholder.description);
            });
        }

        // Add event listeners for the new section
        sectionDiv.querySelector('.remove-section-btn').addEventListener('click', () => {
            sectionDiv.remove();
        });

        sectionDiv.querySelector('.add-placeholder-btn').addEventListener('click', () => {
            const placeholdersContainer = sectionDiv.querySelector('.placeholders-list');
            this.addPlaceholderToSection(placeholdersContainer);
        });
    }

    // Add a placeholder to a section
    addPlaceholderToSection(container, name = '', description = '') {
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'placeholder-item';

        placeholderDiv.innerHTML = `
            <div style="flex: 2;">
                <input type="text" class="placeholder-name" value="${name}" placeholder="Placeholder name">
            </div>
            <div style="flex: 3;">
                <input type="text" class="placeholder-desc" value="${description}" placeholder="Description">
            </div>
            <button class="btn-secondary remove-placeholder-btn">Remove</button>
        `;

        container.appendChild(placeholderDiv);

        // Add event listener to remove button
        placeholderDiv.querySelector('.remove-placeholder-btn').addEventListener('click', () => {
            placeholderDiv.remove();
        });
    }

    // Save template with sections
    async saveTemplate() {
        const title = document.getElementById('templateTitle').value;

        if (!title) {
            alert('Please enter a template title');
            return;
        }

        // Get all sections
        const sections = [];
        document.querySelectorAll('.template-section').forEach(sectionEl => {
            const titleInput = sectionEl.querySelector('.section-title');
            const contentTextarea = sectionEl.querySelector('.section-content-textarea');
            const typeSelect = sectionEl.querySelector('.section-type');

            const section = {
                name: titleInput.value || 'Untitled Section',
                content: contentTextarea.value,
                type: typeSelect.value,
                order: sections.length
            };

            // Get placeholders for this section
            section.placeholders = [];
            sectionEl.querySelectorAll('.placeholder-item').forEach(placeholderEl => {
                const nameInput = placeholderEl.querySelector('.placeholder-name');
                const descInput = placeholderEl.querySelector('.placeholder-desc');

                if (nameInput.value) {
                    section.placeholders.push({
                        name: nameInput.value,
                        description: descInput.value
                    });
                }
            });

            sections.push(section);
        });

        if (sections.length === 0) {
            alert('Please add at least one section to the template');
            return;
        }

        // Create template object
        const template = {
            title: title,
            sections: sections,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCombined: false,
            combinedTemplateIds: []
        };

        // If this is an edit, we should preserve the ID
        // For simplicity in this implementation, we'll add a new template

        try {
            await this.templateSystem.saveTemplate(template);
            document.getElementById('templateEditor').classList.add('hidden');
            await this.renderTemplates();
            alert('Template saved successfully!');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Error saving template: ' + error.message);
        }
    }

    // Show the combine templates modal
    async showCombineTemplatesModal() {
        // Load templates for dropdowns
        const templates = await this.templateSystem.loadTemplates();

        const template1Select = document.getElementById('template1Select');
        const template2Select = document.getElementById('template2Select');

        // Clear existing options
        template1Select.innerHTML = '<option value="">Select Template</option>';
        template2Select.innerHTML = '<option value="">Select Template</option>';

        // Add templates to dropdowns
        templates.forEach(template => {
            const option1 = document.createElement('option');
            option1.value = template.id;
            option1.textContent = template.title;
            template1Select.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = template.id;
            option2.textContent = template.title;
            template2Select.appendChild(option2);
        });

        // Show modal
        document.getElementById('combineTemplatesModal').classList.remove('hidden');
    }

    // Combine templates
    async combineTemplates() {
        const templateId1 = document.getElementById('template1Select').value;
        const templateId2 = document.getElementById('template2Select').value;
        const combinedTitle = document.getElementById('combinedTemplateTitle').value;

        if (!templateId1 || !templateId2) {
            alert('Please select both templates to combine');
            return;
        }

        if (!combinedTitle) {
            alert('Please enter a title for the combined template');
            return;
        }

        try {
            // Create combined template
            const combinedTemplate = this.templateSystem.combineTemplates([parseInt(templateId1), parseInt(templateId2)], combinedTitle);

            // Save the combined template
            await this.templateSystem.saveTemplate(combinedTemplate);

            // Hide modal and refresh template list
            document.getElementById('combineTemplatesModal').classList.add('hidden');
            await this.renderTemplates();
            alert('Templates combined successfully!');
        } catch (error) {
            console.error('Error combining templates:', error);
            alert('Error combining templates: ' + error.message);
        }
    }

    // Import template from file
    importTemplateFile() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const result = await this.templateSystem.importTemplateFromFile(file);
                alert('Template imported successfully!');
                await this.renderTemplates();
            } catch (error) {
                console.error('Error importing template:', error);
                alert('Error importing template: ' + error.message);
            }
        };

        fileInput.click();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new ConsultingApp();
});