// AI Gateway - Single entry point for all LLM calls
// Supports: OpenAI, Anthropic, Groq, Ollama, any OpenAI-compatible API
class AIGateway {
    constructor() {
        this.config = this.loadConfig();
        this.isEnabled = true;
        this.requestQueue = [];
        this.rateLimitDelay = 1000; // ms between requests
    }

    // Default config structure
    getDefaultConfig() {
        return {
            provider: 'openai', // openai, anthropic, groq, ollama, custom
            models: {
                openai: {
                    apiKey: '',
                    baseUrl: 'https://api.openai.com/v1',
                    model: 'gpt-4o',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                anthropic: {
                    apiKey: '',
                    baseUrl: 'https://api.anthropic.com/v1',
                    model: 'claude-sonnet-4-20250514',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                groq: {
                    apiKey: '',
                    baseUrl: 'https://api.groq.com/openai/v1',
                    model: 'llama-3.3-70b-versatile',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                ollama: {
                    apiKey: '',
                    baseUrl: 'http://localhost:11434/v1',
                    model: 'llama3',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                custom: {
                    apiKey: '',
                    baseUrl: '',
                    model: '',
                    maxTokens: 4096,
                    temperature: 0.7
                }
            },
            enabled: true,
            fallbackToTemplate: true, // If AI fails, use template-based generation
            streamResponses: true,
            retryAttempts: 2,
            timeout: 60000 // 60 seconds
        };
    }

    // Load config from localStorage
    loadConfig() {
        try {
            const saved = localStorage.getItem('ai_gateway_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all fields exist
                return { ...this.getDefaultConfig(), ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load AI config, using defaults:', e);
        }
        return this.getDefaultConfig();
    }

    // Save config to localStorage
    saveConfig(config) {
        this.config = { ...this.config, ...config };
        localStorage.setItem('ai_gateway_config', JSON.stringify(this.config));
    }

    // Get current provider settings
    getProviderConfig() {
        return this.config.models[this.config.provider] || this.config.models.openai;
    }

    // Switch provider
    setProvider(provider) {
        if (this.config.models[provider]) {
            this.config.provider = provider;
            this.saveConfig(this.config);
        }
    }

    // Set API key for current provider
    setApiKey(apiKey) {
        const provider = this.config.provider;
        this.config.models[provider].apiKey = apiKey;
        this.saveConfig(this.config);
    }

    // Set model for current provider
    setModel(model) {
        const provider = this.config.provider;
        this.config.models[provider].model = model;
        this.saveConfig(this.config);
    }

    // Check if AI is ready (has API key configured)
    isReady() {
        if (!this.config.enabled) return false;
        const providerConfig = this.getProviderConfig();
        // Ollama doesn't need API key
        if (this.config.provider === 'ollama') return true;
        return !!providerConfig.apiKey;
    }

    // Main chat completion call - OpenAI-compatible format
    async chatCompletion(messages, options = {}) {
        if (!this.isReady()) {
            throw new Error('AI Gateway not configured. Please add your API key in Settings.');
        }

        const providerConfig = this.getProviderConfig();
        const requestBody = this.buildRequestBody(messages, options, providerConfig);
        const headers = this.buildHeaders(providerConfig);
        const url = this.buildUrl(providerConfig);

        let attempts = 0;
        const maxAttempts = this.config.retryAttempts + 1;

        while (attempts < maxAttempts) {
            try {
                const response = await this.makeRequest(url, headers, requestBody);
                return this.parseResponse(response);
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    console.error('AI Gateway failed after retries:', error);
                    throw error;
                }
                // Wait before retry
                await this.delay(this.rateLimitDelay * attempts);
            }
        }
    }

    // Build request body based on provider
    buildRequestBody(messages, options, providerConfig) {
        const body = {
            model: options.model || providerConfig.model,
            messages: messages,
            max_tokens: options.maxTokens || providerConfig.maxTokens,
            temperature: options.temperature !== undefined ? options.temperature : providerConfig.temperature
        };

        // Add response format if JSON requested
        if (options.jsonMode) {
            body.response_format = { type: 'json_object' };
        }

        return body;
    }

    // Build headers based on provider
    buildHeaders(providerConfig) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.config.provider === 'anthropic') {
            headers['x-api-key'] = providerConfig.apiKey;
            headers['anthropic-version'] = '2023-06-01';
            headers['anthropic-dangerous-direct-browser-access'] = 'true';
        } else {
            // OpenAI-compatible format (works for OpenAI, Groq, Ollama, custom)
            if (providerConfig.apiKey) {
                headers['Authorization'] = `Bearer ${providerConfig.apiKey}`;
            }
        }

        return headers;
    }

    // Build URL based on provider
    buildUrl(providerConfig) {
        if (this.config.provider === 'anthropic') {
            return `${providerConfig.baseUrl}/messages`;
        }
        return `${providerConfig.baseUrl}/chat/completions`;
    }

    // Make the actual HTTP request
    async makeRequest(url, headers, body) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            // For Anthropic, transform the request format
            let requestBody = body;
            if (this.config.provider === 'anthropic') {
                requestBody = this.transformToAnthropicFormat(body);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Try again or switch to a faster model.');
            }
            throw error;
        }
    }

    // Transform OpenAI format to Anthropic format
    transformToAnthropicFormat(openaiBody) {
        const systemMessage = openaiBody.messages.find(m => m.role === 'system');
        const otherMessages = openaiBody.messages.filter(m => m.role !== 'system');

        const anthropicBody = {
            model: openaiBody.model,
            max_tokens: openaiBody.max_tokens || 4096,
            temperature: openaiBody.temperature
        };

        if (systemMessage) {
            anthropicBody.system = systemMessage.content;
        }

        anthropicBody.messages = otherMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
        }));

        return anthropicBody;
    }

    // Parse response based on provider
    parseResponse(response) {
        if (this.config.provider === 'anthropic') {
            return {
                content: response.content?.[0]?.text || '',
                usage: {
                    promptTokens: response.usage?.input_tokens || 0,
                    completionTokens: response.usage?.output_tokens || 0,
                    totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
                },
                model: response.model,
                provider: 'anthropic'
            };
        }

        // OpenAI-compatible format
        return {
            content: response.choices?.[0]?.message?.content || '',
            usage: {
                promptTokens: response.usage?.prompt_tokens || 0,
                completionTokens: response.usage?.completion_tokens || 0,
                totalTokens: response.usage?.total_tokens || 0
            },
            model: response.model,
            provider: this.config.provider
        };
    }

    // Convenience method: Generate text from a single prompt
    async generate(prompt, systemPrompt = '', options = {}) {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        return await this.chatCompletion(messages, options);
    }

    // Convenience method: Generate JSON response
    async generateJSON(prompt, systemPrompt = '', options = {}) {
        const jsonSystemPrompt = (systemPrompt || '') + '\n\nRespond ONLY with valid JSON. No markdown, no code fences, no explanation outside the JSON.';
        const result = await this.generate(prompt, jsonSystemPrompt, { ...options, jsonMode: true });

        try {
            // Try to parse the content as JSON
            let content = result.content.trim();
            // Remove markdown code fences if present
            if (content.startsWith('```')) {
                content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }
            result.parsed = JSON.parse(content);
        } catch (e) {
            console.warn('Failed to parse AI JSON response:', e);
            result.parsed = null;
        }

        return result;
    }

    // Streaming support (for real-time output)
    async streamCompletion(messages, onChunk, options = {}) {
        if (!this.isReady()) {
            throw new Error('AI Gateway not configured.');
        }

        const providerConfig = this.getProviderConfig();
        const requestBody = { ...this.buildRequestBody(messages, options, providerConfig), stream: true };
        const headers = this.buildHeaders(providerConfig);
        const url = this.buildUrl(providerConfig);

        // Anthropic streaming not supported in browser easily, fall back to non-stream
        if (this.config.provider === 'anthropic') {
            const result = await this.chatCompletion(messages, options);
            onChunk(result.content);
            return result;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Stream Error (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
                const data = line.replace('data: ', '');
                if (data === '[DONE]') break;

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content || '';
                    if (content) {
                        fullContent += content;
                        onChunk(content);
                    }
                } catch (e) {
                    // Skip unparseable chunks
                }
            }
        }

        return { content: fullContent, provider: this.config.provider };
    }

    // Utility: delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get available models for each provider
    getAvailableModels() {
        return {
            openai: [
                { id: 'gpt-4o', name: 'GPT-4o (Recommended)', context: '128K' },
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cheap)', context: '128K' },
                { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', context: '128K' },
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Budget)', context: '16K' }
            ],
            anthropic: [
                { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Recommended)', context: '200K' },
                { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', context: '200K' },
                { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)', context: '200K' }
            ],
            groq: [
                { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Free & Fast)', context: '128K' },
                { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Ultra Fast)', context: '128K' },
                { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context: '32K' },
                { id: 'gemma2-9b-it', name: 'Gemma 2 9B', context: '8K' }
            ],
            ollama: [
                { id: 'llama3', name: 'Llama 3 (Local)', context: '8K' },
                { id: 'mistral', name: 'Mistral (Local)', context: '32K' },
                { id: 'codellama', name: 'Code Llama (Local)', context: '16K' },
                { id: 'phi3', name: 'Phi-3 (Local, Small)', context: '4K' }
            ],
            custom: []
        };
    }

    // Get current status
    getStatus() {
        return {
            provider: this.config.provider,
            model: this.getProviderConfig().model,
            isReady: this.isReady(),
            isEnabled: this.config.enabled
        };
    }
}

// Global AI Gateway instance
window.aiGateway = new AIGateway();
