// AI Settings UI - API key management, model selection, provider switching
class AISettingsUI {
    constructor() {
        this.gateway = window.aiGateway;
    }

    // Render the full settings panel
    renderSettingsPanel() {
        const config = this.gateway.config;
        const providerConfig = this.gateway.getProviderConfig();
        const models = this.gateway.getAvailableModels();
        const status = this.gateway.getStatus();

        return `
            <div class="ai-settings-panel">
                <div class="ai-status-bar ${status.isReady ? 'status-ready' : 'status-not-ready'}">
                    <span class="status-dot"></span>
                    <span class="status-text">${status.isReady ? 'AI Connected' : 'AI Not Configured'}</span>
                    <span class="status-model">${status.isReady ? `${status.provider} / ${status.model}` : 'Add API key to enable'}</span>
                </div>

                <div class="settings-section">
                    <h4>AI Provider</h4>
                    <div class="provider-selector">
                        ${this.renderProviderButtons(config.provider)}
                    </div>
                </div>

                <div class="settings-section">
                    <h4>API Configuration</h4>
                    <div class="setting-row">
                        <label for="ai-api-key">API Key:</label>
                        <div class="api-key-input-group">
                            <input type="password" id="ai-api-key" 
                                value="${providerConfig.apiKey || ''}" 
                                placeholder="${config.provider === 'ollama' ? 'Not required for Ollama' : 'Enter your API key'}"
                                ${config.provider === 'ollama' ? 'disabled' : ''}>
                            <button class="btn-small" onclick="aiSettingsUI.toggleApiKeyVisibility()">Show</button>
                        </div>
                    </div>

                    <div class="setting-row">
                        <label for="ai-base-url">Base URL:</label>
                        <input type="text" id="ai-base-url" 
                            value="${providerConfig.baseUrl}" 
                            placeholder="API Base URL">
                    </div>

                    <div class="setting-row">
                        <label for="ai-model">Model:</label>
                        <select id="ai-model">
                            ${(models[config.provider] || []).map(m => 
                                `<option value="${m.id}" ${m.id === providerConfig.model ? 'selected' : ''}>${m.name} (${m.context})</option>`
                            ).join('')}
                            <option value="custom">Custom Model...</option>
                        </select>
                    </div>

                    <div class="setting-row" id="custom-model-row" style="display: none;">
                        <label for="ai-custom-model">Custom Model ID:</label>
                        <input type="text" id="ai-custom-model" placeholder="Enter model identifier">
                    </div>
                </div>

                <div class="settings-section">
                    <h4>Generation Settings</h4>
                    <div class="setting-row">
                        <label for="ai-temperature">Creativity (Temperature): <span id="temp-value">${providerConfig.temperature}</span></label>
                        <input type="range" id="ai-temperature" min="0" max="1" step="0.1" 
                            value="${providerConfig.temperature}">
                        <small>Lower = more focused, Higher = more creative</small>
                    </div>

                    <div class="setting-row">
                        <label for="ai-max-tokens">Max Output Length:</label>
                        <select id="ai-max-tokens">
                            <option value="1024" ${providerConfig.maxTokens === 1024 ? 'selected' : ''}>Short (1K tokens)</option>
                            <option value="2048" ${providerConfig.maxTokens === 2048 ? 'selected' : ''}>Medium (2K tokens)</option>
                            <option value="4096" ${providerConfig.maxTokens === 4096 ? 'selected' : ''}>Long (4K tokens)</option>
                            <option value="8192" ${providerConfig.maxTokens === 8192 ? 'selected' : ''}>Very Long (8K tokens)</option>
                        </select>
                    </div>
                </div>

                <div class="settings-section">
                    <h4>Behavior</h4>
                    <div class="setting-row checkbox-row">
                        <label>
                            <input type="checkbox" id="ai-enabled" ${config.enabled ? 'checked' : ''}>
                            Enable AI features
                        </label>
                    </div>
                    <div class="setting-row checkbox-row">
                        <label>
                            <input type="checkbox" id="ai-stream" ${config.streamResponses ? 'checked' : ''}>
                            Stream responses (show text as it generates)
                        </label>
                    </div>
                    <div class="setting-row checkbox-row">
                        <label>
                            <input type="checkbox" id="ai-fallback" ${config.fallbackToTemplate ? 'checked' : ''}>
                            Fallback to template if AI fails
                        </label>
                    </div>
                </div>

                <div class="settings-actions">
                    <button class="btn-primary" onclick="aiSettingsUI.saveSettings()">Save Settings</button>
                    <button class="btn-secondary" onclick="aiSettingsUI.testConnection()">Test Connection</button>
                    <button class="btn-secondary" onclick="aiSettingsUI.resetSettings()">Reset to Defaults</button>
                </div>

                <div id="ai-test-result" class="test-result hidden"></div>
            </div>
        `;
    }

    // Render provider selection buttons
    renderProviderButtons(currentProvider) {
        const providers = [
            { id: 'openai', name: 'OpenAI', icon: 'O' },
            { id: 'anthropic', name: 'Anthropic', icon: 'A' },
            { id: 'groq', name: 'Groq', icon: 'G' },
            { id: 'ollama', name: 'Ollama (Local)', icon: 'L' },
            { id: 'custom', name: 'Custom API', icon: 'C' }
        ];

        return providers.map(p => `
            <button class="provider-btn ${p.id === currentProvider ? 'active' : ''}" 
                onclick="aiSettingsUI.switchProvider('${p.id}')">
                <span class="provider-icon">${p.icon}</span>
                <span class="provider-name">${p.name}</span>
            </button>
        `).join('');
    }

    // Switch provider and re-render
    switchProvider(provider) {
        this.gateway.setProvider(provider);
        // Re-render the settings panel
        const container = document.getElementById('aiSettingsContainer');
        if (container) {
            container.innerHTML = this.renderSettingsPanel();
            this.bindSettingsEvents();
        }
    }

    // Toggle API key visibility
    toggleApiKeyVisibility() {
        const input = document.getElementById('ai-api-key');
        const btn = input.nextElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = 'Hide';
        } else {
            input.type = 'password';
            btn.textContent = 'Show';
        }
    }

    // Save all settings
    saveSettings() {
        const provider = this.gateway.config.provider;
        const config = { ...this.gateway.config };

        // Update provider-specific settings
        config.models[provider].apiKey = document.getElementById('ai-api-key').value;
        config.models[provider].baseUrl = document.getElementById('ai-base-url').value;
        
        const modelSelect = document.getElementById('ai-model');
        if (modelSelect.value === 'custom') {
            config.models[provider].model = document.getElementById('ai-custom-model').value;
        } else {
            config.models[provider].model = modelSelect.value;
        }

        config.models[provider].temperature = parseFloat(document.getElementById('ai-temperature').value);
        config.models[provider].maxTokens = parseInt(document.getElementById('ai-max-tokens').value);

        // Global settings
        config.enabled = document.getElementById('ai-enabled').checked;
        config.streamResponses = document.getElementById('ai-stream').checked;
        config.fallbackToTemplate = document.getElementById('ai-fallback').checked;

        this.gateway.saveConfig(config);

        // Show success message
        this.showTestResult('Settings saved successfully!', 'success');
    }

    // Test the AI connection
    async testConnection() {
        const resultDiv = document.getElementById('ai-test-result');
        resultDiv.classList.remove('hidden');
        resultDiv.className = 'test-result loading';
        resultDiv.innerHTML = 'Testing connection...';

        try {
            const startTime = Date.now();
            const result = await this.gateway.generate(
                'Respond with exactly: "Connection successful. ABetWorks AI is ready."',
                'You are a test assistant. Respond exactly as instructed.',
                { maxTokens: 50, temperature: 0 }
            );
            const elapsed = Date.now() - startTime;

            this.showTestResult(
                `Connected! Response in ${elapsed}ms. Model: ${result.model || this.gateway.getProviderConfig().model}. Tokens used: ${result.usage?.totalTokens || 'unknown'}.`,
                'success'
            );
        } catch (error) {
            this.showTestResult(`Connection failed: ${error.message}`, 'error');
        }
    }

    // Reset to default settings
    resetSettings() {
        if (confirm('Reset all AI settings to defaults? API keys will be cleared.')) {
            localStorage.removeItem('ai_gateway_config');
            this.gateway.config = this.gateway.getDefaultConfig();
            
            const container = document.getElementById('aiSettingsContainer');
            if (container) {
                container.innerHTML = this.renderSettingsPanel();
                this.bindSettingsEvents();
            }
            this.showTestResult('Settings reset to defaults.', 'success');
        }
    }

    // Show test result
    showTestResult(message, type) {
        const resultDiv = document.getElementById('ai-test-result');
        if (resultDiv) {
            resultDiv.classList.remove('hidden', 'loading');
            resultDiv.className = `test-result ${type}`;
            resultDiv.innerHTML = message;
        }
    }

    // Bind events for settings panel
    bindSettingsEvents() {
        // Temperature slider
        const tempSlider = document.getElementById('ai-temperature');
        if (tempSlider) {
            tempSlider.addEventListener('input', (e) => {
                document.getElementById('temp-value').textContent = e.target.value;
            });
        }

        // Model select - show custom input
        const modelSelect = document.getElementById('ai-model');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                const customRow = document.getElementById('custom-model-row');
                if (customRow) {
                    customRow.style.display = e.target.value === 'custom' ? 'block' : 'none';
                }
            });
        }
    }

    // Get a mini status indicator for the header
    getStatusIndicator() {
        const status = this.gateway.getStatus();
        return `
            <div class="ai-mini-status ${status.isReady ? 'ready' : 'not-ready'}" 
                onclick="app.switchTab('settingsTab')" title="AI: ${status.isReady ? status.provider + ' / ' + status.model : 'Not configured'}">
                <span class="mini-dot"></span>
                <span class="mini-label">AI: ${status.isReady ? 'On' : 'Off'}</span>
            </div>
        `;
    }
}

// Global instance
window.aiSettingsUI = new AISettingsUI();
