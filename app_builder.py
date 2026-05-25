# Consultancy App Builder
# This script will create a complete offline consulting application with all necessary files.

# Install required packages
# pip install tkinter

import os
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
from datetime import datetime

class AppBuilder:
    def __init__(self, root):
        self.root = root
        self.root.title("Consultancy App Builder")
        self.root.geometry("500x400")
        
        self.setup_ui()
    
    def setup_ui(self):
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        ttk.Label(main_frame, text="Consultancy App Builder", font=("Arial", 16, "bold")).grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        ttk.Label(main_frame, text="App Name:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.app_name = tk.StringVar(value="Business Consulting Toolkit")
        ttk.Entry(main_frame, textvariable=self.app_name, width=30).grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(main_frame, text="Output Directory:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.output_dir = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.output_dir, width=30).grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5)
        ttk.Button(main_frame, text="Browse", command=self.browse_directory).grid(row=2, column=2, padx=(5, 0), pady=5)
        
        ttk.Label(main_frame, text="Features to Include:").grid(row=3, column=0, columnspan=2, sticky=tk.W, pady=(15, 5))
        
        self.include_customers = tk.BooleanVar(value=True)
        self.include_forms = tk.BooleanVar(value=True)
        self.include_reports = tk.BooleanVar(value=True)
        self.include_templates = tk.BooleanVar(value=True)
        self.include_offline = tk.BooleanVar(value=True)
        
        ttk.Checkbutton(main_frame, text="Customer Management", variable=self.include_customers).grid(row=4, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Checkbutton(main_frame, text="Form Creation", variable=self.include_forms).grid(row=5, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Checkbutton(main_frame, text="Report Generation", variable=self.include_reports).grid(row=6, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Checkbutton(main_frame, text="Template System", variable=self.include_templates).grid(row=7, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Checkbutton(main_frame, text="Offline Functionality", variable=self.include_offline).grid(row=8, column=0, sticky=tk.W, padx=(20, 0))
        
        ttk.Button(main_frame, text="Build Application", command=self.build_app, style="Accent.TButton").grid(row=9, column=0, columnspan=3, pady=20)
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
    
    def browse_directory(self):
        directory = filedialog.askdirectory()
        if directory:
            self.output_dir.set(directory)
    
    def build_app(self):
        if not self.output_dir.get():
            messagebox.showerror("Error", "Please select an output directory")
            return
        
        app_dir = os.path.join(self.output_dir.get(), self.app_name.get().replace(" ", "_"))
        
        # Create main directory
        os.makedirs(app_dir, exist_ok=True)
        
        # Create subdirectories
        os.makedirs(os.path.join(app_dir, "data"), exist_ok=True)
        
        # Create all the application files
        self.create_index_html(app_dir)
        self.create_styles_css(app_dir)
        self.create_storage_js(app_dir)
        self.create_forms_js(app_dir)
        self.create_reports_js(app_dir)
        self.create_app_js(app_dir)
        self.create_service_worker(app_dir)
        self.create_manifest_json(app_dir)
        
        messagebox.showinfo("Success", f"Application created successfully at:\n{app_dir}")
    
    def create_index_html(self, app_dir):
        content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.app_name.get()}</title>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>{self.app_name.get()}</h1>
        <nav>
            <button id="customersTab" class="tab-btn active">Customers</button>
            <button id="formsTab" class="tab-btn">Forms</button>
            <button id="reportsTab" class="tab-btn">Reports</button>
            <button id="templatesTab" class="tab-btn">Templates</button>
        </nav>
    </header>

    <main>
        <!-- Customers Tab -->
        <div id="customersSection" class="section active">
            <div class="section-header">
                <h2>Customer Management</h2>
                <button id="addCustomerBtn" class="btn-primary">Add Customer</button>
            </div>
            
            <div id="customerForm" class="form-container hidden">
                <h3>Add New Customer</h3>
                <input type="text" id="companyName" placeholder="Company Name" required>
                <input type="text" id="contactName" placeholder="Contact Name" required>
                <input type="text" id="industry" placeholder="Industry">
                <input type="email" id="email" placeholder="Email">
                <input type="tel" id="phone" placeholder="Phone">
                <div class="form-actions">
                    <button id="saveCustomerBtn" class="btn-primary">Save</button>
                    <button id="cancelCustomerBtn" class="btn-secondary">Cancel</button>
                </div>
            </div>
            
            <div id="customerList">
                <table>
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Contact</th>
                            <th>Industry</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="customerTableBody">
                        <!-- Customer rows will be added here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Forms Tab -->
        <div id="formsSection" class="section hidden">
            <div class="section-header">
                <h2>Form Management</h2>
                <div>
                    <button id="createFormBtn" class="btn-primary">Create New Form</button>
                    <button id="importFormBtn" class="btn-secondary">Import Form</button>
                </div>
            </div>
            
            <div id="formCreator" class="form-container hidden">
                <h3>Create New Form</h3>
                <input type="text" id="formTitle" placeholder="Form Title" required>
                <div id="formFieldsContainer">
                    <!-- Form fields will be added here -->
                </div>
                <div class="form-actions">
                    <button id="addFieldBtn" class="btn-secondary">Add Field</button>
                    <button id="saveFormBtn" class="btn-primary">Save Form</button>
                    <button id="cancelFormBtn" class="btn-secondary">Cancel</button>
                </div>
            </div>
            
            <div id="formList">
                <table>
                    <thead>
                        <tr>
                            <th>Form Title</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="formTableBody">
                        <!-- Form rows will be added here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Reports Tab -->
        <div id="reportsSection" class="section hidden">
            <div class="section-header">
                <h2>Report Generation</h2>
                <div>
                    <button id="generateReportBtn" class="btn-primary">Generate Report</button>
                    <button id="printReportBtn" class="btn-secondary">Print</button>
                </div>
            </div>
            
            <div id="reportGenerator" class="form-container">
                <div class="selector-group">
                    <label for="selectCustomer">Select Customer:</label>
                    <select id="selectCustomer"></select>
                </div>
                
                <div class="selector-group">
                    <label for="selectTemplate">Select Template:</label>
                    <select id="selectTemplate"></select>
                </div>
                
                <div id="reportFormContainer">
                    <!-- Dynamic form fields will appear here -->
                </div>
                
                <div class="form-actions">
                    <button id="generateReportBtn2" class="btn-primary">Generate Report</button>
                    <button id="previewReportBtn" class="btn-secondary">Preview</button>
                </div>
                
                <div id="reportPreview" class="preview-container">
                    <!-- Report preview will appear here -->
                </div>
            </div>
        </div>

        <!-- Templates Tab -->
        <div id="templatesSection" class="section hidden">
            <div class="section-header">
                <h2>Templates</h2>
                <button id="addTemplateBtn" class="btn-primary">Add Template</button>
            </div>
            
            <div id="templateEditor" class="form-container hidden">
                <h3>Create New Template</h3>
                <input type="text" id="templateTitle" placeholder="Template Title" required>
                <textarea id="templateContent" placeholder="Template content with placeholders..."></textarea>
                <div class="form-actions">
                    <button id="saveTemplateBtn" class="btn-primary">Save Template</button>
                    <button id="cancelTemplateBtn" class="btn-secondary">Cancel</button>
                </div>
            </div>
            
            <div id="templateList">
                <table>
                    <thead>
                        <tr>
                            <th>Template Name</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="templateTableBody">
                        <!-- Template rows will be added here -->
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <script src="storage.js"></script>
    <script src="forms.js"></script>
    <script src="reports.js"></script>
    <script src="app.js"></script>
</body>
</html>'''
        
        with open(os.path.join(app_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(content)
    
    def create_styles_css(self, app_dir):
        content = '''* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    color: #333;
}

header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem;
}

header h1 {
    margin-bottom: 1rem;
}

nav {
    display: flex;
    gap: 1rem;
}

.tab-btn {
    background: none;
    border: 2px solid transparent;
    color: white;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
}

.tab-btn.active {
    border-bottom: 2px solid #3498db;
    background-color: rgba(255, 255, 255, 0.1);
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.section {
    display: none;
}

.section.active {
    display: block;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.form-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 1.5rem;
}

.form-container.hidden {
    display: none;
}

input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.btn-primary {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.btn-secondary {
    background-color: #95a5a6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
}

th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
}

th {
    background-color: #ecf0f1;
    font-weight: bold;
}

tr:hover {
    background-color: #f8f9fa;
}

.selector-group {
    margin-bottom: 1rem;
}

.selector-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.preview-container {
    margin-top: 1.5rem;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
}

.field-editor {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
}

.field-editor input {
    margin-bottom: 0.5rem;
}

.field-actions {
    display: flex;
    gap: 0.5rem;
}

.hidden {
    display: none !important;
}

@media (max-width: 768px) {
    nav {
        flex-direction: column;
    }
    
    .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }
    
    .form-actions {
        flex-direction: column;
    }
}'''
        
        with open(os.path.join(app_dir, "styles.css"), "w", encoding="utf-8") as f:
            f.write(content)
    
    def create_storage_js(self, app_dir):
        content = '''// Storage service using IndexedDB
class StorageService {
    constructor() {
        this.dbName = 'ConsultingDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('customers')) {
                    const customerStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
                    customerStore.createIndex('companyName', 'companyName', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('forms')) {
                    const formStore = db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
                    formStore.createIndex('title', 'title', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
                    templateStore.createIndex('title', 'title', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('responses')) {
                    const responseStore = db.createObjectStore('responses', { keyPath: 'id', autoIncrement: true });
                    responseStore.createIndex('customerId', 'customerId', { unique: false });
                    responseStore.createIndex('formId', 'formId', { unique: false });
                }
            };
        });
    }

    async addCustomer(customer) {
        const transaction = this.db.transaction(['customers'], 'readwrite');
        const store = transaction.objectStore('customers');
        return store.add(customer);
    }

    async getAllCustomers() {
        const transaction = this.db.transaction(['customers'], 'readonly');
        const store = transaction.objectStore('customers');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteCustomer(id) {
        const transaction = this.db.transaction(['customers'], 'readwrite');
        const store = transaction.objectStore('customers');
        return store.delete(id);
    }

    async addForm(form) {
        const transaction = this.db.transaction(['forms'], 'readwrite');
        const store = transaction.objectStore('forms');
        return store.add(form);
    }

    async getAllForms() {
        const transaction = this.db.transaction(['forms'], 'readonly');
        const store = transaction.objectStore('forms');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addTemplate(template) {
        const transaction = this.db.transaction(['templates'], 'readwrite');
        const store = transaction.objectStore('templates');
        return store.add(template);
    }

    async getAllTemplates() {
        const transaction = this.db.transaction(['templates'], 'readonly');
        const store = transaction.objectStore('templates');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addResponse(response) {
        const transaction = this.db.transaction(['responses'], 'readwrite');
        const store = transaction.objectStore('responses');
        return store.add(response);
    }

    async getResponsesByCustomer(customerId) {
        const transaction = this.db.transaction(['responses'], 'readonly');
        const store = transaction.objectStore('responses');
        const index = store.index('customerId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(customerId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global storage instance
const storageService = new StorageService();'''
        
        with open(os.path.join(app_dir, "storage.js"), "w", encoding="utf-8") as f:
            f.write(content)
    
    def create_forms_js(self, app_dir):
        content = '''// Form management functions
class FormManager {
    constructor() {
        this.currentFormFields = [];
    }

    createField(fieldType, label, placeholder = '', required = false) {
        const field = {
            id: Date.now() + Math.random(),
            type: fieldType,
            label: label,
            placeholder: placeholder,
            required: required
        };
        return field;
    }

    addFieldToForm(field) {
        this.currentFormFields.push(field);
        this.renderFormFields();
    }

    removeFieldFromForm(fieldId) {
        this.currentFormFields = this.currentFormFields.filter(field => field.id !== fieldId);
        this.renderFormFields();
    }

    renderFormFields() {
        const container = document.getElementById('formFieldsContainer');
        container.innerHTML = '';
        
        this.currentFormFields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'field-editor';
            fieldDiv.innerHTML = `
                <input type="text" value="${field.label}" placeholder="Field Label" class="field-label" data-id="${field.id}">
                <input type="text" value="${field.placeholder}" placeholder="Placeholder" class="field-placeholder" data-id="${field.id}">
                <div class="field-actions">
                    <button class="remove-field-btn" data-id="${field.id}">Remove</button>
                </div>
            `;
            container.appendChild(fieldDiv);
        });

        // Add event listeners for field editing
        document.querySelectorAll('.field-label').forEach(input => {
            input.addEventListener('input', (e) => {
                const fieldId = e.target.dataset.id;
                const field = this.currentFormFields.find(f => f.id == fieldId);
                if (field) field.label = e.target.value;
            });
        });

        document.querySelectorAll('.field-placeholder').forEach(input => {
            input.addEventListener('input', (e) => {
                const fieldId = e.target.dataset.id;
                const field = this.currentFormFields.find(f => f.id == fieldId);
                if (field) field.placeholder = e.target.value;
            });
        });

        document.querySelectorAll('.remove-field-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fieldId = e.target.dataset.id;
                this.removeFieldFromForm(parseInt(fieldId));
            });
        });
    }

    async saveForm() {
        const title = document.getElementById('formTitle').value;
        if (!title) {
            alert('Please enter a form title');
            return;
        }

        const form = {
            title: title,
            fields: this.currentFormFields,
            createdAt: new Date().toISOString()
        };

        await storageService.addForm(form);
        this.currentFormFields = [];
        document.getElementById('formTitle').value = '';
        document.getElementById('formFieldsContainer').innerHTML = '';
        document.getElementById('formCreator').classList.add('hidden');
        
        await renderForms();
        alert('Form saved successfully!');
    }

    async loadFormForFilling(formId, customerId) {
        const forms = await storageService.getAllForms();
        const form = forms.find(f => f.id == formId);
        
        if (form) {
            this.renderFormForFilling(form, customerId);
        }
    }

    renderFormForFilling(form, customerId) {
        const container = document.getElementById('reportFormContainer');
        container.innerHTML = '';
        
        const formTitle = document.createElement('h3');
        formTitle.textContent = form.title;
        container.appendChild(formTitle);
        
        form.fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-field';
            
            const label = document.createElement('label');
            label.textContent = field.label;
            label.htmlFor = field.id;
            
            let input;
            switch (field.type) {
                case 'textarea':
                    input = document.createElement('textarea');
                    break;
                case 'select':
                    input = document.createElement('select');
                    // Add options if available
                    break;
                default:
                    input = document.createElement('input');
                    input.type = field.type || 'text';
            }
            
            input.id = field.id;
            input.placeholder = field.placeholder;
            input.required = field.required;
            
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            container.appendChild(fieldDiv);
        });
        
        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn-primary';
        submitBtn.textContent = 'Save Response';
        submitBtn.onclick = () => this.saveFormResponse(form, customerId);
        container.appendChild(submitBtn);
    }

    async saveFormResponse(form, customerId) {
        const formData = {};
        form.fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                formData[field.id] = input.value;
            }
        });

        const response = {
            customerId: customerId,
            formId: form.id,
            formData: formData,
            submittedAt: new Date().toISOString()
        };

        await storageService.addResponse(response);
        alert('Response saved successfully!');
    }

    async importForm(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const form = JSON.parse(e.target.result);
                    resolve(form);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
}'''
        
        with open(os.path.join(app_dir, "forms.js"), "w", encoding="utf-8") as f:
            f.write(content)
    
    def create_reports_js(self, app_dir):
        content = '''// Report generation functions
class ReportGenerator {
    constructor() {
        this.formManager = new FormManager();
    }

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
        reportContent = reportContent.replace(/\\{\\{companyName\\}\\}/g, customer.companyName || '');
        reportContent = reportContent.replace(/\\{\\{contactName\\}\\}/g, customer.contactName || '');
        reportContent = reportContent.replace(/\\{\\{industry\\}\\}/g, customer.industry || '');
        
        // Replace form data placeholders
        if (formData) {
            for (const [key, value] of Object.entries(formData)) {
                reportContent = reportContent.replace(new RegExp(`\\\\{\\\\{${key}\\\\}\\\\}`, 'g'), value || '');
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
}'''
        
        with open(os.path.join(app_dir, "reports.js"), "w", encoding="utf-8") as f:
            f.write(content)
    
    def create_app_js(self, app_dir):
        content = '''// Main application logic
class ConsultingApp {
    constructor() {
        this.storageService = storageService;
        this.formManager = new FormManager();
        this.reportGenerator = new ReportGenerator();
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

        // Template management
        document.getElementById('addTemplateBtn').addEventListener('click', () => {
            document.getElementById('templateEditor').classList.remove('hidden');
            document.getElementById('templateTitle').value = '';
            document.getElementById('templateContent').value = '';
        });

        document.getElementById('saveTemplateBtn').addEventListener('click', () => this.saveTemplate());
        document.getElementById('cancelTemplateBtn').addEventListener('click', () => {
            document.getElementById('templateEditor').classList.add('hidden');
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
                <td>
                    <button class="btn-secondary" onclick="app.editTemplate(${template.id})">Edit</button>
                    <button class="btn-secondary" onclick="app.deleteTemplate(${template.id})">Delete</button>
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

    async saveTemplate() {
        const title = document.getElementById('templateTitle').value;
        const content = document.getElementById('templateContent').value;
        
        if (!title || !content) {
            alert('Please enter both title and content');
            return;
        }

        const template = {
            title: title,
            content: content,
            createdAt: new Date().toISOString()
        };

        await this.storageService.addTemplate(template);
        document.getElementById('templateEditor').classList.add('hidden');
        await this.renderTemplates();
        alert('Template saved successfully!');
    }

    async editTemplate(templateId) {
        const templates = await this.storageService.getAllTemplates();
        const template = templates.find(t => t.id == templateId);
        
        if (template) {
            document.getElementById('templateTitle').value = template.title;
            document.getElementById('templateContent').value = template.content;
            document.getElementById('templateEditor').classList.remove('hidden');
            
            // Set up save with update logic
            const saveBtn = document.getElementById('saveTemplateBtn');
            const originalClickHandler = saveBtn.onclick;
            
            saveBtn.onclick = async () => {
                template.title = document.getElementById('templateTitle').value;
                template.content = document.getElementById('templateContent').value;
                
                // For simplicity, delete and re-add
                // In real implementation, you would update the existing record
                alert('Template update would be implemented in the full version');
                
                document.getElementById('templateEditor').classList.add('hidden');
                saveBtn.onclick = originalClickHandler;
            };
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
            const report = await this.reportGenerator.generateReport(customerId, templateId, formData);
            this.reportGenerator.renderReportPreview(report);
        } catch (error) {
            alert('Error generating report: ' + error.message);
        }
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
});'''
        
        with open(os.path.join(app_dir, "app.js"), "w", encoding="utf-8") as f:
            f.write(content)
    
    def create_service_worker(self, app_dir):
        content = '''const CACHE_NAME = 'consulting-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/storage.js',
    '/forms.js',
    '/reports.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request);
            })
    );
});'''
        
        with open(os.path.join(app_dir, "service-worker.js"), "w", encoding="utf-8") as f:
            f.write(content)
    
    def create_manifest_json(self, app_dir):
        content = '''{
    "name": "''' + self.app_name.get() + '''",
    "short_name": "Consulting App",
    "description": "Offline business consulting software",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#2c3e50",
    "theme_color": "#2c3e50",
    "icons": [
        {
            "src": "icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}'''
        
        with open(os.path.join(app_dir, "manifest.json"), "w", encoding="utf-8") as f:
            f.write(content)

def main():
    root = tk.Tk()
    app = AppBuilder(root)
    root.mainloop()

if __name__ == "__main__":
    main()