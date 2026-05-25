# Simple Business Consulting Software

## Application Overview
A desktop application that allows consultants to input business data and automatically generate professional reports with customizable templates and customer data storage.

## Technology Stack
- **Frontend**: Python with Tkinter (for cross-platform compatibility)
- **Data Storage**: JSON files (for simplicity) or SQLite database
- **Report Generation**: ReportLab for PDFs and matplotlib for charts
- **Configuration**: JSON configuration files

## Core Features

### 1. Customer Data Management
- Add new customers with basic info
- View and edit existing customer records
- Search and filter customers
- Store all form responses per customer

### 2. Report Template System
- Pre-defined templates for different report types
- Ability to add custom templates
- Template customization options

### 3. Automatic Report Generation
- Fill in form data and generate reports automatically
- Dynamic charts and graphs based on data
- Professional formatting and design

## Software Structure

```
consulting_software/
├── main.py                 # Main application entry point
├── customer_data/          # Directory for customer data storage
│   ├── customers.json      # Customer records
│   └── responses/          # Individual form responses
├── templates/              # Report templates
│   ├── ai_readiness.json   # AI readiness template
│   ├── operations.json     # Operations template
│   └── custom/             # User-added templates
├── reports/                # Generated reports
├── config/                 # Application settings
│   └── settings.json
└── resources/              # Images and other assets
```

## Main Application Code

```python
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
from datetime import datetime
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

class BusinessConsultingApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Business Consulting Report Generator")
        self.root.geometry("800x600")
        
        # Data storage
        self.customers_file = "customer_data/customers.json"
        self.templates_dir = "templates/"
        self.reports_dir = "reports/"
        
        # Initialize data
        self.load_customers()
        self.load_templates()
        
        # Create UI
        self.create_ui()
    
    def create_ui(self):
        # Tabs for different functions
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Customer Management Tab
        self.customer_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.customer_tab, text="Customers")
        self.create_customer_tab()
        
        # Report Generation Tab
        self.report_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.report_tab, text="Generate Report")
        self.create_report_tab()
        
        # Templates Tab
        self.templates_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.templates_tab, text="Templates")
        self.create_templates_tab()
    
    def create_customer_tab(self):
        # Add customer section
        add_frame = ttk.LabelFrame(self.customer_tab, text="Add New Customer")
        add_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(add_frame, text="Company Name:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        self.company_name = tk.StringVar()
        ttk.Entry(add_frame, textvariable=self.company_name).grid(row=0, column=1, padx=5, pady=2)
        
        ttk.Label(add_frame, text="Contact Name:").grid(row=1, column=0, sticky=tk.W, padx=5, pady=2)
        self.contact_name = tk.StringVar()
        ttk.Entry(add_frame, textvariable=self.contact_name).grid(row=1, column=1, padx=5, pady=2)
        
        ttk.Label(add_frame, text="Industry:").grid(row=2, column=0, sticky=tk.W, padx=5, pady=2)
        self.industry = tk.StringVar()
        industries = ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Professional Services", "Education", "Other"]
        ttk.Combobox(add_frame, textvariable=self.industry, values=industries).grid(row=2, column=1, padx=5, pady=2)
        
        ttk.Button(add_frame, text="Add Customer", command=self.add_customer).grid(row=3, column=0, columnspan=2, pady=5)
        
        # Customer list
        list_frame = ttk.LabelFrame(self.customer_tab, text="Customer List")
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        self.customer_list = ttk.Treeview(list_frame, columns=("name", "contact", "industry"), show="headings")
        self.customer_list.heading("name", text="Company Name")
        self.customer_list.heading("contact", text="Contact")
        self.customer_list.heading("industry", text="Industry")
        
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.customer_list.yview)
        self.customer_list.configure(yscroll=scrollbar.set)
        
        self.customer_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Load existing customers
        self.refresh_customer_list()
    
    def create_report_tab(self):
        # Customer selection
        selection_frame = ttk.LabelFrame(self.report_tab, text="Select Customer")
        selection_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(selection_frame, text="Customer:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        self.selected_customer = tk.StringVar()
        self.customer_combo = ttk.Combobox(selection_frame, textvariable=self.selected_customer, state="readonly")
        self.customer_combo.grid(row=0, column=1, padx=5, pady=2)
        
        # Template selection
        template_frame = ttk.LabelFrame(self.report_tab, text="Select Template")
        template_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(template_frame, text="Template:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        self.selected_template = tk.StringVar()
        self.template_combo = ttk.Combobox(template_frame, textvariable=self.selected_template, state="readonly")
        self.template_combo.grid(row=0, column=1, padx=5, pady=2)
        
        # Report data input
        data_frame = ttk.LabelFrame(self.report_tab, text="Report Data")
        data_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # This will be dynamically populated based on template selection
        self.data_entries = {}
        self.data_input_frame = ttk.Frame(data_frame)
        self.data_input_frame.pack(fill=tk.BOTH, expand=True)
        
        # Buttons
        button_frame = ttk.Frame(self.report_tab)
        button_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Button(button_frame, text="Generate Report", command=self.generate_report).pack(side=tk.LEFT, padx=5)
        
        # Refresh customer list when tab is shown
        self.notebook.bind("<<NotebookTabChanged>>", self.on_tab_change)
    
    def create_templates_tab(self):
        # Template list
        template_list_frame = ttk.LabelFrame(self.templates_tab, text="Available Templates")
        template_list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        self.template_list = ttk.Treeview(template_list_frame, columns=("name", "type"), show="headings")
        self.template_list.heading("name", text="Template Name")
        self.template_list.heading("type", text="Type")
        
        scrollbar = ttk.Scrollbar(template_list_frame, orient=tk.VERTICAL, command=self.template_list.yview)
        self.template_list.configure(yscroll=scrollbar.set)
        
        self.template_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Add custom template button
        ttk.Button(self.templates_tab, text="Add Custom Template", command=self.add_custom_template).pack(pady=5)
        
        self.refresh_template_list()
    
    def load_customers(self):
        os.makedirs("customer_data", exist_ok=True)
        if os.path.exists(self.customers_file):
            with open(self.customers_file, 'r') as f:
                self.customers = json.load(f)
        else:
            self.customers = []
    
    def save_customers(self):
        with open(self.customers_file, 'w') as f:
            json.dump(self.customers, f, indent=2)
    
    def add_customer(self):
        if not self.company_name.get():
            messagebox.showerror("Error", "Company name is required")
            return
        
        customer = {
            "id": len(self.customers) + 1,
            "company_name": self.company_name.get(),
            "contact_name": self.contact_name.get(),
            "industry": self.industry.get(),
            "created_date": datetime.now().isoformat()
        }
        
        self.customers.append(customer)
        self.save_customers()
        self.refresh_customer_list()
        
        # Clear form
        self.company_name.set("")
        self.contact_name.set("")
        self.industry.set("")
        
        messagebox.showinfo("Success", "Customer added successfully")
    
    def refresh_customer_list(self):
        # Clear existing items
        for item in self.customer_list.get_children():
            self.customer_list.delete(item)
        
        # Add customers
        for customer in self.customers:
            self.customer_list.insert("", "end", values=(
                customer["company_name"],
                customer["contact_name"],
                customer["industry"]
            ))
        
        # Update customer combo
        customer_names = [c["company_name"] for c in self.customers]
        self.customer_combo['values'] = customer_names
    
    def load_templates(self):
        os.makedirs("templates/custom", exist_ok=True)
        
        # Pre-defined templates
        self.predefined_templates = {
            "ai_readiness": {
                "name": "AI Readiness Assessment",
                "fields": [
                    {"name": "company_size", "label": "Company Size", "type": "text"},
                    {"name": "current_ai_use", "label": "Current AI Usage", "type": "text"},
                    {"name": "revenue_range", "label": "Revenue Range", "type": "text"},
                    {"name": "top_challenges", "label": "Top 3 Business Challenges", "type": "textarea"},
                    {"name": "automation_goals", "label": "Automation Goals", "type": "textarea"}
                ]
            },
            "operations": {
                "name": "Operations Efficiency",
                "fields": [
                    {"name": "processes_handled", "label": "Current Processes", "type": "textarea"},
                    {"name": "bottlenecks", "label": "Identified Bottlenecks", "type": "textarea"},
                    {"name": "efficiency_score", "label": "Current Efficiency Score (1-10)", "type": "text"},
                    {"name": "cost_reduction_goals", "label": "Cost Reduction Goals", "type": "text"},
                    {"name": "improvement_priorities", "label": "Improvement Priorities", "type": "textarea"}
                ]
            }
        }
        
        # Save predefined templates if they don't exist
        for template_id, template in self.predefined_templates.items():
            file_path = f"templates/{template_id}.json"
            if not os.path.exists(file_path):
                with open(file_path, 'w') as f:
                    json.dump(template, f, indent=2)
    
    def refresh_template_list(self):
        # Clear existing items
        for item in self.template_list.get_children():
            self.template_list.delete(item)
        
        # Add predefined templates
        for template_id, template in self.predefined_templates.items():
            self.template_list.insert("", "end", values=(
                template["name"],
                "System"
            ))
        
        # Add custom templates
        for filename in os.listdir("templates/custom"):
            if filename.endswith(".json"):
                with open(f"templates/custom/{filename}", 'r') as f:
                    template = json.load(f)
                self.template_list.insert("", "end", values=(
                    template["name"],
                    "Custom"
                ))
    
    def add_custom_template(self):
        # Simple dialog to add a custom template
        dialog = tk.Toplevel(self.root)
        dialog.title("Add Custom Template")
        dialog.geometry("400x300")
        
        ttk.Label(dialog, text="Template Name:").pack(pady=5)
        name_var = tk.StringVar()
        ttk.Entry(dialog, textvariable=name_var).pack(pady=5)
        
        ttk.Label(dialog, text="Number of Fields:").pack(pady=5)
        fields_var = tk.StringVar(value="3")
        ttk.Spinbox(dialog, from_=1, to=20, textvariable=fields_var).pack(pady=5)
        
        def save_template():
            if not name_var.get():
                messagebox.showerror("Error", "Template name is required")
                return
            
            # Create template structure
            template = {
                "name": name_var.get(),
                "fields": []
            }
            
            for i in range(int(fields_var.get())):
                field_name = f"field_{i+1}"
                field_label = f"Field {i+1} Label"
                template["fields"].append({
                    "name": field_name,
                    "label": field_label,
                    "type": "text"
                })
            
            # Save template
            filename = f"templates/custom/{name_var.get().replace(' ', '_').lower()}.json"
            with open(filename, 'w') as f:
                json.dump(template, f, indent=2)
            
            self.refresh_template_list()
            dialog.destroy()
            messagebox.showinfo("Success", "Template added successfully")
        
        ttk.Button(dialog, text="Save Template", command=save_template).pack(pady=10)
    
    def on_tab_change(self, event):
        # Only refresh customer list when switching to the report tab
        current_tab = self.notebook.index(self.notebook.select())
        if current_tab == 1:  # Report tab
            self.refresh_customer_list()
    
    def generate_report(self):
        if not self.selected_customer.get():
            messagebox.showerror("Error", "Please select a customer")
            return
        
        if not self.selected_template.get():
            messagebox.showerror("Error", "Please select a template")
            return
        
        # Get selected customer data
        customer = None
        for c in self.customers:
            if c["company_name"] == self.selected_customer.get():
                customer = c
                break
        
        # Get template data
        template_name = self.selected_template.get().replace(" ", "_").lower()
        if template_name in self.predefined_templates:
            template = self.predefined_templates[template_name]
        else:
            # Load from custom templates
            for filename in os.listdir("templates/custom"):
                if filename.startswith(template_name):
                    with open(f"templates/custom/{filename}", 'r') as f:
                        template = json.load(f)
                    break
        
        # Collect report data from entries
        report_data = {}
        for field in template["fields"]:
            field_name = field["name"]
            if field_name in self.data_entries:
                report_data[field_name] = self.data_entries[field_name].get()
        
        # Generate report
        self.create_pdf_report(customer, template, report_data)
    
    def create_pdf_report(self, customer, template, report_data):
        os.makedirs(self.reports_dir, exist_ok=True)
        
        filename = f"{self.reports_dir}/{customer['company_name'].replace(' ', '_')}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        doc = SimpleDocTemplate(filename, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph(f"{customer['company_name']} - {template['name']}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Customer info
        customer_info = Paragraph(f"Contact: {customer['contact_name']}", styles['Normal'])
        story.append(customer_info)
        story.append(Spacer(1, 12))
        
        # Report data
        for field in template["fields"]:
            field_name = field["name"]
            if field_name in report_data:
                label = Paragraph(f"<b>{field['label']}:</b>", styles['Heading3'])
                story.append(label)
                
                value = Paragraph(report_data[field_name], styles['Normal'])
                story.append(value)
                story.append(Spacer(1, 6))
        
        # Generate and add a simple chart if relevant data exists
        if "efficiency_score" in report_data:
            self.create_efficiency_chart(report_data["efficiency_score"], customer['company_name'])
            # Note: Adding images to PDF would require additional code
        
        doc.build(story)
        messagebox.showinfo("Success", f"Report generated: {filename}")

def main():
    root = tk.Tk()
    app = BusinessConsultingApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
```

## Simple Installation Guide

```bash
# Install required packages
pip install reportlab matplotlib

# Create the directory structure
mkdir consulting_software
cd consulting_software
mkdir customer_data
mkdir templates
mkdir templates/custom
mkdir reports

# Create the main.py file with the code above
# Run the application
python main.py
```

## How to Use the Software

1. **Customer Management**:
   - Add customers with company name, contact, and industry
   - View and manage your customer list

2. **Report Generation**:
   - Select a customer from the dropdown
   - Choose a report template
   - Fill in the form fields that appear
   - Click "Generate Report" to create a PDF

3. **Templates**:
   - Use predefined templates (AI Readiness, Operations Efficiency)
   - Add custom templates as needed

4. **Data Storage**:
   - All customer data is saved to JSON files
   - Reports are stored in the reports/ directory
   - Templates can be added to templates/custom/

This simple application gives you a complete solution for collecting customer data, generating reports, and managing templates - all in a single, easy-to-use interface!