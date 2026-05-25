// Form management functions
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
}