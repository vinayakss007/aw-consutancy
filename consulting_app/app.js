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
        } else if (tabId === 'aiTab') {
            this.populateAIDropdowns();
        } else if (tabId === 'workflowsTab') {
            this.renderWorkflowsTab();
        } else if (tabId === 'settingsTab') {
            const settingsContainer = document.getElementById('aiSettingsContainer');
            if (settingsContainer) {
                settingsContainer.innerHTML = aiSettingsUI.renderSettingsPanel();
                aiSettingsUI.bindSettingsEvents();
            }
            this.updateAIStatus();
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

    // ============== AI INTEGRATION METHODS ==============

    // Initialize AI features
    initAI() {
        this.bindAIEvents();
        this.updateAIStatus();
    }

    // Bind all AI-related events
    bindAIEvents() {
        // AI Report Generator
        const genReportBtn = document.getElementById('generateAIReportBtn');
        if (genReportBtn) genReportBtn.addEventListener('click', () => this.generateAIReport());

        // AI Business Scorer
        const genScoreBtn = document.getElementById('generateAIScoreBtn');
        if (genScoreBtn) genScoreBtn.addEventListener('click', () => this.generateAIScore());

        // AI SWOT
        const genSwotBtn = document.getElementById('generateAISWOTBtn');
        if (genSwotBtn) genSwotBtn.addEventListener('click', () => this.generateAISWOT());

        // AI Form Generator
        const genFormBtn = document.getElementById('generateAIFormBtn');
        if (genFormBtn) genFormBtn.addEventListener('click', () => this.generateAIForm());

        // AI Proposal
        const genProposalBtn = document.getElementById('generateAIProposalBtn');
        if (genProposalBtn) genProposalBtn.addEventListener('click', () => this.generateAIProposal());

        // AI Insights
        const genInsightsBtn = document.getElementById('generateAIInsightsBtn');
        if (genInsightsBtn) genInsightsBtn.addEventListener('click', () => this.generateAIInsights());
    }

    // Update AI status indicator in header
    updateAIStatus() {
        const indicator = document.getElementById('aiStatusIndicator');
        if (indicator) {
            const status = aiGateway.getStatus();
            indicator.className = `ai-mini-status ${status.isReady ? 'ready' : 'not-ready'}`;
            indicator.innerHTML = `
                <span class="mini-dot"></span>
                <span class="mini-label">AI: ${status.isReady ? 'On' : 'Off'}</span>
            `;
        }
    }

    // Populate AI tool customer dropdowns
    async populateAIDropdowns() {
        const customers = await this.storageService.getAllCustomers();
        const dropdowns = ['aiReportCustomer', 'aiScoreCustomer', 'aiSwotCustomer', 'aiProposalCustomer'];

        dropdowns.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = '<option value="">Select Customer</option>';
                customers.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.id;
                    option.textContent = c.companyName;
                    select.appendChild(option);
                });
            }
        });
    }

    // Show AI output
    showAIOutput(title, content, meta = {}) {
        const section = document.getElementById('aiOutputSection');
        const titleEl = document.getElementById('aiOutputTitle');
        const contentEl = document.getElementById('aiOutputContent');
        const metaEl = document.getElementById('aiOutputMeta');

        titleEl.textContent = title;
        contentEl.innerHTML = content;
        contentEl.contentEditable = 'false';

        metaEl.innerHTML = `
            <span>Provider: ${meta.provider || 'AI'}</span>
            <span>Model: ${meta.model || 'default'}</span>
            ${meta.tokens ? `<span>Tokens: ${meta.tokens.totalTokens || '?'}</span>` : ''}
            <span>Generated: ${new Date().toLocaleTimeString()}</span>
        `;

        section.classList.remove('hidden');
        section.scrollIntoView({ behavior: 'smooth' });

        // Store for regeneration
        this.lastAIRequest = { title, meta };
    }

    // Show loading state in AI output
    showAILoading(message = 'Generating with AI...') {
        const section = document.getElementById('aiOutputSection');
        const contentEl = document.getElementById('aiOutputContent');
        const metaEl = document.getElementById('aiOutputMeta');

        document.getElementById('aiOutputTitle').textContent = message;
        contentEl.innerHTML = '<div class="ai-loading">Thinking...</div>';
        metaEl.innerHTML = `<span>Using: ${aiGateway.config.provider} / ${aiGateway.getProviderConfig().model}</span>`;
        section.classList.remove('hidden');
    }

    // Toggle edit mode on AI output
    toggleAIEdit() {
        const contentEl = document.getElementById('aiOutputContent');
        const isEditable = contentEl.contentEditable === 'true';
        contentEl.contentEditable = isEditable ? 'false' : 'true';
        document.getElementById('aiEditBtn').textContent = isEditable ? 'Edit' : 'Done';
    }

    // Copy AI output to clipboard
    copyAIOutput() {
        const contentEl = document.getElementById('aiOutputContent');
        navigator.clipboard.writeText(contentEl.innerText).then(() => {
            alert('Copied to clipboard!');
        });
    }

    // Print AI output
    printAIOutput() {
        const content = document.getElementById('aiOutputContent').innerHTML;
        const title = document.getElementById('aiOutputTitle').textContent;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>${title}</title>
            <style>body{font-family:Arial,sans-serif;margin:2rem;line-height:1.6}
            h1{color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:0.5rem}
            table{width:100%;border-collapse:collapse;margin:1rem 0}
            th,td{border:1px solid #ddd;padding:0.5rem;text-align:left}
            th{background:#f8f9fa}</style></head>
            <body><h1>${title}</h1>${content}</body></html>`);
        printWindow.document.close();
        printWindow.print();
    }

    // Regenerate last AI output
    async regenerateAIOutput() {
        if (this.lastAIGenerateFunction) {
            await this.lastAIGenerateFunction();
        }
    }

    // --- AI Tool Methods ---

    async generateAIReport() {
        const customerId = document.getElementById('aiReportCustomer').value;
        const reportType = document.getElementById('aiReportType').value;
        const context = document.getElementById('aiReportContext').value;

        if (!customerId) { alert('Please select a customer'); return; }
        if (!aiGateway.isReady()) { alert('Please configure AI in Settings first'); return; }

        const customers = await this.storageService.getAllCustomers();
        const customer = customers.find(c => c.id == customerId);

        this.showAILoading('Generating Report...');

        try {
            const formData = context ? { additionalContext: context } : {};
            const result = await aiReportGenerator.generateReport(customer, formData, reportType);
            this.showAIOutput(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${customer.companyName}`, result.content, result.metadata);
            this.lastAIGenerateFunction = () => this.generateAIReport();
        } catch (error) {
            this.showAIOutput('Error', `<p style="color:red">Failed to generate report: ${error.message}</p><p>Check your API key in Settings.</p>`, {});
        }
    }

    async generateAIScore() {
        const customerId = document.getElementById('aiScoreCustomer').value;
        if (!customerId) { alert('Please select a customer'); return; }
        if (!aiGateway.isReady()) { alert('Please configure AI in Settings first'); return; }

        const customers = await this.storageService.getAllCustomers();
        const customer = customers.find(c => c.id == customerId);

        this.showAILoading('Scoring Business...');

        try {
            const scores = await aiReportGenerator.scoreBusiness(customer, {});
            let html = `<h3>Business Score Card - ${customer.companyName}</h3>`;

            if (scores.scores) {
                html += '<table><tr><th>Dimension</th><th>Score</th><th>Justification</th></tr>';
                for (const [dim, data] of Object.entries(scores.scores)) {
                    html += `<tr><td><strong>${dim}</strong></td><td>${data.score}/10</td><td>${data.justification}</td></tr>`;
                }
                html += '</table>';
                html += `<h4>Overall Score: ${scores.overallScore}/10</h4>`;
                if (scores.topStrengths) html += `<p><strong>Strengths:</strong> ${scores.topStrengths.join(', ')}</p>`;
                if (scores.topWeaknesses) html += `<p><strong>Areas to Improve:</strong> ${scores.topWeaknesses.join(', ')}</p>`;
            } else {
                html += `<p>${JSON.stringify(scores, null, 2)}</p>`;
            }

            this.showAIOutput(`Score Card - ${customer.companyName}`, html, { provider: aiGateway.config.provider, model: aiGateway.getProviderConfig().model });
            this.lastAIGenerateFunction = () => this.generateAIScore();
        } catch (error) {
            this.showAIOutput('Error', `<p style="color:red">${error.message}</p>`, {});
        }
    }

    async generateAISWOT() {
        const customerId = document.getElementById('aiSwotCustomer').value;
        if (!customerId) { alert('Please select a customer'); return; }
        if (!aiGateway.isReady()) { alert('Please configure AI in Settings first'); return; }

        const customers = await this.storageService.getAllCustomers();
        const customer = customers.find(c => c.id == customerId);

        this.showAILoading('Generating SWOT Analysis...');

        try {
            const swot = await aiInsights.generateSWOT(customer, {});
            let html = `<h3>SWOT Analysis - ${customer.companyName}</h3>`;

            if (swot.strengths) {
                html += '<table><tr><th>Strengths</th><th>Weaknesses</th></tr><tr><td><ul>';
                swot.strengths.forEach(s => html += `<li>${s.point} (${s.impact})</li>`);
                html += '</ul></td><td><ul>';
                (swot.weaknesses || []).forEach(w => html += `<li>${w.point} (${w.impact})</li>`);
                html += '</ul></td></tr><tr><th>Opportunities</th><th>Threats</th></tr><tr><td><ul>';
                (swot.opportunities || []).forEach(o => html += `<li>${o.point} (${o.timeframe})</li>`);
                html += '</ul></td><td><ul>';
                (swot.threats || []).forEach(t => html += `<li>${t.point} (${t.severity})</li>`);
                html += '</ul></td></tr></table>';
                if (swot.strategicImplications) html += `<h4>Strategic Implications</h4><p>${swot.strategicImplications}</p>`;
            } else {
                html += `<pre>${JSON.stringify(swot, null, 2)}</pre>`;
            }

            this.showAIOutput(`SWOT - ${customer.companyName}`, html, { provider: aiGateway.config.provider, model: aiGateway.getProviderConfig().model });
            this.lastAIGenerateFunction = () => this.generateAISWOT();
        } catch (error) {
            this.showAIOutput('Error', `<p style="color:red">${error.message}</p>`, {});
        }
    }

    async generateAIForm() {
        const industry = document.getElementById('aiFormIndustry').value;
        const type = document.getElementById('aiFormType').value;
        if (!industry) { alert('Please enter an industry'); return; }
        if (!aiGateway.isReady()) { alert('Please configure AI in Settings first'); return; }

        this.showAILoading('Generating Assessment Form...');

        try {
            const formData = await aiInsights.generateFormQuestions(industry, type);
            let html = `<h3>${formData.title || 'Assessment Form'}</h3>`;
            html += `<p>${formData.description || ''}</p>`;

            if (formData.categories) {
                formData.categories.forEach(cat => {
                    html += `<h4>${cat.name}</h4><ol>`;
                    cat.questions.forEach(q => {
                        html += `<li><strong>${q.question}</strong> <em>(${q.type})</em>${q.helpText ? ` - ${q.helpText}` : ''}</li>`;
                    });
                    html += '</ol>';
                });
            } else {
                html += `<pre>${JSON.stringify(formData, null, 2)}</pre>`;
            }

            this.showAIOutput(`AI Form - ${industry} ${type}`, html, { provider: aiGateway.config.provider, model: aiGateway.getProviderConfig().model });
            this.lastAIGenerateFunction = () => this.generateAIForm();
        } catch (error) {
            this.showAIOutput('Error', `<p style="color:red">${error.message}</p>`, {});
        }
    }

    async generateAIProposal() {
        const customerId = document.getElementById('aiProposalCustomer').value;
        const service = document.getElementById('aiProposalService').value;
        if (!customerId) { alert('Please select a customer'); return; }
        if (!service) { alert('Please enter a service offering'); return; }
        if (!aiGateway.isReady()) { alert('Please configure AI in Settings first'); return; }

        const customers = await this.storageService.getAllCustomers();
        const customer = customers.find(c => c.id == customerId);

        this.showAILoading('Writing Proposal...');

        try {
            const content = await aiInsights.generateProposal(customer, service);
            this.showAIOutput(`Proposal - ${customer.companyName}`, content, { provider: aiGateway.config.provider, model: aiGateway.getProviderConfig().model });
            this.lastAIGenerateFunction = () => this.generateAIProposal();
        } catch (error) {
            this.showAIOutput('Error', `<p style="color:red">${error.message}</p>`, {});
        }
    }

    async generateAIInsights() {
        const industry = document.getElementById('aiInsightIndustry').value;
        if (!industry) { alert('Please enter an industry'); return; }
        if (!aiGateway.isReady()) { alert('Please configure AI in Settings first'); return; }

        this.showAILoading('Researching Industry...');

        try {
            const benchmarks = await aiInsights.getIndustryBenchmarks(industry);
            let html = `<h3>Industry Benchmarks - ${industry}</h3>`;

            if (benchmarks.benchmarks) {
                html += '<table><tr><th>Metric</th><th>Low</th><th>Median</th><th>Top Quartile</th><th>Unit</th></tr>';
                for (const [metric, data] of Object.entries(benchmarks.benchmarks)) {
                    html += `<tr><td>${metric}</td><td>${data.low}</td><td>${data.median}</td><td>${data.top_quartile}</td><td>${data.unit || ''}</td></tr>`;
                }
                html += '</table>';
                if (benchmarks.industryInsights) {
                    html += '<h4>Key Insights</h4><ul>';
                    benchmarks.industryInsights.forEach(i => html += `<li>${i}</li>`);
                    html += '</ul>';
                }
                if (benchmarks.keyRisks) {
                    html += '<h4>Key Risks</h4><ul>';
                    benchmarks.keyRisks.forEach(r => html += `<li>${r}</li>`);
                    html += '</ul>';
                }
            } else {
                html += `<pre>${JSON.stringify(benchmarks, null, 2)}</pre>`;
            }

            this.showAIOutput(`Benchmarks - ${industry}`, html, { provider: aiGateway.config.provider, model: aiGateway.getProviderConfig().model });
            this.lastAIGenerateFunction = () => this.generateAIInsights();
        } catch (error) {
            this.showAIOutput('Error', `<p style="color:red">${error.message}</p>`, {});
        }
    }

    // ============== WORKFLOW METHODS ==============

    initWorkflows() {
        workflowEngine.loadWorkflows();
        document.getElementById('runWorkflowBtn')?.addEventListener('click', () => this.showRunWorkflowModal());
        document.getElementById('executeWorkflowBtn')?.addEventListener('click', () => this.executeSelectedWorkflow());
    }

    renderWorkflowsTab() {
        this.renderWorkflowTemplates();
        this.renderSavedWorkflows();
        this.renderAgentRoles();
    }

    renderWorkflowTemplates() {
        const grid = document.getElementById('workflowTemplatesGrid');
        if (!grid) return;

        const templates = workflowTemplates.getAllTemplates();
        grid.innerHTML = templates.map((t, idx) => {
            const agents = [...new Set(t.steps.map(s => s.agent))];
            return `
            <div class="wf-template-card" data-idx="${idx}">
                <h4>${t.name}</h4>
                <p>${t.description}</p>
                <div class="wf-card-meta">
                    <span>${t.steps.length} steps</span>
                    <span>${t.estimatedDuration}</span>
                </div>
                <div class="wf-card-agents">
                    ${agents.map(a => {
                        const role = agentRoles.getRole(a);
                        return role ? `<span class="agent-badge" style="background:${role.color}">${role.icon} ${role.name}</span>` : '';
                    }).join('')}
                </div>
                <div class="wf-card-actions">
                    <button class="btn-primary" onclick="app.runTemplate(${idx})">Run</button>
                    <button class="btn-secondary" onclick="app.installTemplate(${idx})">Install</button>
                </div>
            </div>`;
        }).join('');
    }

    renderSavedWorkflows() {
        const container = document.getElementById('savedWorkflowsList');
        if (!container) return;

        const workflows = workflowEngine.workflows.filter(w => !w.isTemplate);
        if (workflows.length === 0) {
            container.innerHTML = '<p class="empty-state">No custom workflows yet. Install a template or create your own.</p>';
            return;
        }

        container.innerHTML = '<table><thead><tr><th>Name</th><th>Category</th><th>Steps</th><th>Actions</th></tr></thead><tbody>' +
            workflows.map(w => `<tr>
                <td>${w.name}</td>
                <td>${w.category}</td>
                <td>${w.steps.length}</td>
                <td>
                    <button class="btn-primary" onclick="app.runSavedWorkflow('${w.id}')" style="font-size:0.8rem;padding:0.3rem 0.6rem">Run</button>
                    <button class="btn-secondary" onclick="app.deleteWorkflow('${w.id}')" style="font-size:0.8rem;padding:0.3rem 0.6rem">Delete</button>
                </td>
            </tr>`).join('') + '</tbody></table>';
    }

    renderAgentRoles() {
        const grid = document.getElementById('agentRolesGrid');
        if (!grid) return;

        const roles = agentRoles.getRoleOptions();
        grid.innerHTML = roles.map(r => `
            <div class="agent-role-card">
                <div class="agent-icon" style="background:${r.color}">${r.icon}</div>
                <div class="agent-info">
                    <h5>${r.name}</h5>
                    <span class="agent-tier">${r.tier}</span>
                    <p>${agentRoles.getRole(r.id).description}</p>
                </div>
            </div>
        `).join('');
    }

    runTemplate(idx) {
        const template = workflowTemplates.getAllTemplates()[idx];
        if (!template) return;
        this.selectedWorkflow = template;
        this.showRunModal(template);
    }

    runSavedWorkflow(wfId) {
        const wf = workflowEngine.workflows.find(w => w.id === wfId);
        if (!wf) return;
        this.selectedWorkflow = wf;
        this.showRunModal(wf);
    }

    installTemplate(idx) {
        const wf = workflowTemplates.installTemplate(idx);
        if (wf) {
            alert('Template installed: ' + wf.name);
            this.renderSavedWorkflows();
        }
    }

    deleteWorkflow(wfId) {
        if (confirm('Delete this workflow?')) {
            workflowEngine.deleteWorkflow(wfId);
            this.renderSavedWorkflows();
        }
    }

    showRunModal(workflow) {
        document.getElementById('runWorkflowModal').classList.remove('hidden');
        document.getElementById('runWorkflowTitle').textContent = 'Run: ' + workflow.name;
        document.getElementById('runWorkflowDesc').textContent = workflow.description;

        // Render steps preview
        const preview = document.getElementById('workflowStepsPreview');
        preview.innerHTML = workflow.steps.map((s, i) => {
            const role = agentRoles.getRole(s.agent);
            return `<div class="wf-step-item">
                <span class="wf-step-num">${i + 1}</span>
                <span class="wf-step-name">${s.name}</span>
                <span class="wf-step-agent" style="color:${role?.color || '#999'}">${role?.name || s.agent}</span>
            </div>`;
        }).join('');

        // Populate customer dropdown
        this.storageService.getAllCustomers().then(customers => {
            const select = document.getElementById('wfCustomer');
            select.innerHTML = '<option value="">Select Customer</option>';
            customers.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.companyName} (${c.industry || 'N/A'})</option>`;
            });
        });

        // Render trigger inputs
        const inputs = document.getElementById('wfTriggerInputs');
        const required = workflow.trigger?.requiredInputs || [];
        const skip = ['customer']; // already have dropdown
        inputs.innerHTML = required.filter(r => !skip.includes(r)).map(r => `
            <div class="selector-group">
                <label for="wfInput_${r}">${r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</label>
                <input type="text" id="wfInput_${r}" placeholder="Enter ${r.replace(/_/g, ' ')}">
            </div>
        `).join('');
    }

    showRunWorkflowModal() {
        // Show template selection
        const templates = workflowTemplates.getAllTemplates();
        if (templates.length > 0) this.runTemplate(0);
    }

    async executeSelectedWorkflow() {
        if (!this.selectedWorkflow) return;
        if (!aiGateway.isReady()) { alert('Configure AI in Settings first'); return; }

        const customerId = document.getElementById('wfCustomer').value;
        if (!customerId) { alert('Select a customer'); return; }

        // Gather trigger data
        const customers = await this.storageService.getAllCustomers();
        const customer = customers.find(c => c.id == customerId);
        const triggerData = { customer: customer.companyName, industry: customer.industry || 'General' };

        // Collect additional inputs
        const required = this.selectedWorkflow.trigger?.requiredInputs || [];
        required.forEach(r => {
            const el = document.getElementById('wfInput_' + r);
            if (el && el.value) triggerData[r] = el.value;
        });

        // Hide modal, show output
        document.getElementById('runWorkflowModal').classList.add('hidden');
        const outputSection = document.getElementById('workflowRunOutput');
        outputSection.classList.remove('hidden');
        document.getElementById('wfRunTitle').textContent = 'Running: ' + this.selectedWorkflow.name;
        document.getElementById('wfRunContent').innerHTML = '<div class="ai-loading">Executing workflow...</div>';
        document.getElementById('wfRunLogs').innerHTML = '';
        document.getElementById('wfManagerReview').classList.add('hidden');

        // Ensure workflow is in engine
        if (!workflowEngine.workflows.find(w => w.id === this.selectedWorkflow.id)) {
            workflowEngine.workflows.push(this.selectedWorkflow);
        }

        // Execute
        const run = await workflowEngine.startWorkflow(this.selectedWorkflow.id, triggerData);

        // Render logs
        const logsEl = document.getElementById('wfRunLogs');
        logsEl.innerHTML = run.logs.map(l => `<div class="log-entry"><span class="log-time">${new Date(l.timestamp).toLocaleTimeString()}</span>${l.message}</div>`).join('');

        // Render meta
        document.getElementById('wfRunMeta').innerHTML = `
            <span>Status: <strong>${run.status}</strong></span>
            <span>Steps: ${Object.keys(run.stepResults).length}/${this.selectedWorkflow.steps.length}</span>
            <span>Started: ${new Date(run.startedAt).toLocaleTimeString()}</span>
            ${run.completedAt ? `<span>Completed: ${new Date(run.completedAt).toLocaleTimeString()}</span>` : ''}
        `;

        // Render final output
        if (run.finalOutput?.content) {
            document.getElementById('wfRunContent').innerHTML = run.finalOutput.content;
            document.getElementById('wfRunTitle').textContent = 'Completed: ' + this.selectedWorkflow.name;
        } else if (run.status === 'failed') {
            document.getElementById('wfRunContent').innerHTML = `<p style="color:red">Workflow failed.</p><pre>${JSON.stringify(run.errors, null, 2)}</pre>`;
            document.getElementById('wfRunTitle').textContent = 'Failed: ' + this.selectedWorkflow.name;
        }

        // Render manager review
        if (run.managerReview?.review) {
            const reviewEl = document.getElementById('wfManagerReview');
            reviewEl.classList.remove('hidden');
            const review = run.managerReview.review;
            const statusClass = (review.approvalStatus || '').toLowerCase().replace(/_/g, '-');
            reviewEl.innerHTML = `
                <h4>Manager AI Review</h4>
                <div style="display:flex;gap:1.5rem;align-items:center;margin-bottom:0.75rem">
                    ${review.qualityScore ? `<span class="review-score">${review.qualityScore}/10</span>` : ''}
                    ${review.approvalStatus ? `<span class="review-status ${statusClass}">${review.approvalStatus}</span>` : ''}
                </div>
                ${review.feedback ? `<p>${typeof review.feedback === 'string' ? review.feedback : JSON.stringify(review.feedback)}</p>` : ''}
                ${review.mustFix && review.mustFix.length ? `<h5>Must Fix:</h5><ul>${review.mustFix.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
            `;
        }

        outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    toggleWfEdit() {
        const el = document.getElementById('wfRunContent');
        const isEditable = el.contentEditable === 'true';
        el.contentEditable = isEditable ? 'false' : 'true';
        document.getElementById('wfEditBtn').textContent = isEditable ? 'Edit' : 'Done';
    }

    copyWfOutput() {
        const el = document.getElementById('wfRunContent');
        navigator.clipboard.writeText(el.innerText).then(() => alert('Copied!'));
    }

    printWfOutput() {
        const content = document.getElementById('wfRunContent').innerHTML;
        const title = document.getElementById('wfRunTitle').textContent;
        const pw = window.open('', '_blank');
        pw.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:2rem;line-height:1.6}h1{color:#2c3e50}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:0.5rem}th{background:#f8f9fa}</style></head><body><h1>${title}</h1>${content}</body></html>`);
        pw.document.close();
        pw.print();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new ConsultingApp();
    // Initialize AI after app is ready
    setTimeout(() => {
        app.initAI();
        app.populateAIDropdowns();
        app.initWorkflows();
        // Render AI settings
        const settingsContainer = document.getElementById('aiSettingsContainer');
        if (settingsContainer) {
            settingsContainer.innerHTML = aiSettingsUI.renderSettingsPanel();
            aiSettingsUI.bindSettingsEvents();
        }
    }, 500);
});