// AI Report Generator - AI generates full consulting reports, diagnostics, recommendations
class AIReportGenerator {
    constructor() {
        this.gateway = window.aiGateway;
    }

    // System prompt for consulting report generation
    getSystemPrompt(reportType) {
        const basePrompt = `You are a senior management consultant at ABetWorks Consulting. You generate professional, actionable consulting reports. Your outputs should be:
- Data-driven with specific metrics and benchmarks
- Actionable with clear next steps and timelines
- Professional tone suitable for C-suite presentation
- Structured with clear sections, headers, and bullet points
- Include industry-specific insights and recommendations

Format your response in clean HTML with proper headings (h3, h4), paragraphs, bullet points (ul/li), and tables where appropriate.`;

        const typePrompts = {
            diagnostic: `${basePrompt}\n\nYou are generating a BUSINESS DIAGNOSTIC report. Analyze the business data provided and identify strengths, weaknesses, opportunities, threats, and provide a scored assessment (1-10) for each business area.`,
            
            strategy: `${basePrompt}\n\nYou are generating a STRATEGY RECOMMENDATION report. Based on the business data, provide strategic recommendations with priority levels (High/Medium/Low), estimated ROI, implementation timeline, and resource requirements.`,
            
            operations: `${basePrompt}\n\nYou are generating an OPERATIONS ASSESSMENT report. Analyze operational data and identify bottlenecks, inefficiencies, automation opportunities, and provide a process improvement roadmap.`,
            
            financial: `${basePrompt}\n\nYou are generating a FINANCIAL ANALYSIS report. Analyze financial data, identify unit economics issues, provide benchmarking against industry standards, and recommend optimization strategies.`,
            
            technology: `${basePrompt}\n\nYou are generating a TECHNOLOGY READINESS report. Assess current tech stack, digital maturity, automation opportunities, and provide a technology roadmap with budget estimates.`,
            
            market: `${basePrompt}\n\nYou are generating a MARKET ANALYSIS report. Analyze market position, competitive landscape, customer segments, and provide go-to-market recommendations.`,
            
            compliance: `${basePrompt}\n\nYou are generating a COMPLIANCE & RISK report. Identify regulatory gaps, risk factors, and provide a compliance roadmap with priority actions.`,
            
            general: basePrompt
        };

        return typePrompts[reportType] || typePrompts.general;
    }

    // Generate a full consulting report from data
    async generateReport(customerData, formData, reportType = 'diagnostic', options = {}) {
        const systemPrompt = this.getSystemPrompt(reportType);
        
        const userPrompt = this.buildReportPrompt(customerData, formData, reportType);

        try {
            const result = await this.gateway.generate(userPrompt, systemPrompt, {
                maxTokens: options.maxTokens || 4096,
                temperature: options.temperature || 0.7
            });

            return {
                content: result.content,
                metadata: {
                    provider: result.provider,
                    model: result.model,
                    tokens: result.usage,
                    reportType: reportType,
                    generatedAt: new Date().toISOString(),
                    customer: customerData.companyName
                },
                editable: true // AI output is always editable
            };
        } catch (error) {
            console.error('AI Report generation failed:', error);
            throw error;
        }
    }

    // Build the prompt for report generation
    buildReportPrompt(customerData, formData, reportType) {
        let prompt = `Generate a comprehensive ${reportType} consulting report for the following business:\n\n`;
        
        prompt += `## Company Information\n`;
        prompt += `- Company: ${customerData.companyName || 'Unknown'}\n`;
        prompt += `- Contact: ${customerData.contactName || 'Unknown'}\n`;
        prompt += `- Industry: ${customerData.industry || 'Unknown'}\n`;
        
        if (customerData.email) prompt += `- Email: ${customerData.email}\n`;
        if (customerData.phone) prompt += `- Phone: ${customerData.phone}\n`;

        if (formData && Object.keys(formData).length > 0) {
            prompt += `\n## Business Data Collected\n`;
            for (const [key, value] of Object.entries(formData)) {
                if (value && value.toString().trim()) {
                    // Clean up the key name for readability
                    const cleanKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                    prompt += `- ${cleanKey}: ${value}\n`;
                }
            }
        }

        prompt += `\n## Report Requirements\n`;
        prompt += `- Provide specific, actionable recommendations\n`;
        prompt += `- Include industry benchmarks where relevant\n`;
        prompt += `- Score each area assessed (1-10)\n`;
        prompt += `- Prioritize recommendations (High/Medium/Low)\n`;
        prompt += `- Include estimated timeline for implementation\n`;
        prompt += `- Format in professional HTML suitable for client presentation\n`;

        return prompt;
    }

    // Generate executive summary from a full report
    async generateExecutiveSummary(reportContent, customerData) {
        const systemPrompt = `You are a senior consultant. Summarize the following consulting report into a concise executive summary (3-5 bullet points max, plus 1 paragraph overview). Format in HTML.`;
        
        const prompt = `Summarize this report for ${customerData.companyName}:\n\n${reportContent}`;

        const result = await this.gateway.generate(prompt, systemPrompt, {
            maxTokens: 1024,
            temperature: 0.5
        });

        return result.content;
    }

    // Generate recommendations from data
    async generateRecommendations(customerData, formData, industry) {
        const systemPrompt = `You are a consulting strategist. Generate 5-7 specific, actionable recommendations for this business. Each recommendation should include: title, description, priority (High/Medium/Low), estimated impact, timeline, and effort level. Format as HTML with a table.`;

        const prompt = `Business: ${customerData.companyName}\nIndustry: ${industry || customerData.industry}\n\nData:\n${JSON.stringify(formData, null, 2)}\n\nProvide strategic recommendations.`;

        const result = await this.gateway.generate(prompt, systemPrompt, {
            maxTokens: 2048,
            temperature: 0.7
        });

        return result.content;
    }

    // Score a business based on collected data
    async scoreBusiness(customerData, formData, scoringCriteria = null) {
        const systemPrompt = `You are a business assessment expert. Score this business on multiple dimensions. Return a JSON object with scores (1-10) for each area, plus an overall score and brief justification for each.`;

        const defaultCriteria = [
            'Digital Maturity', 'Operational Efficiency', 'Financial Health',
            'Market Position', 'Team & Leadership', 'Growth Potential',
            'Customer Satisfaction', 'Innovation Readiness', 'Compliance & Risk'
        ];

        const criteria = scoringCriteria || defaultCriteria;
        
        const prompt = `Score this business on these dimensions: ${criteria.join(', ')}\n\nBusiness: ${customerData.companyName}\nIndustry: ${customerData.industry}\n\nData collected:\n${JSON.stringify(formData, null, 2)}\n\nReturn JSON: { "scores": { "dimension": { "score": number, "justification": "brief reason" } }, "overallScore": number, "topStrengths": [], "topWeaknesses": [] }`;

        const result = await this.gateway.generateJSON(prompt, systemPrompt);
        return result.parsed || { error: 'Failed to generate scores', raw: result.content };
    }

    // Generate action plan from report
    async generateActionPlan(reportContent, customerData, timeframe = '90 days') {
        const systemPrompt = `You are a consulting project manager. Create a detailed action plan from this report. Break it into weekly/monthly milestones with specific deliverables, owners, and success criteria. Format as HTML with a timeline table.`;

        const prompt = `Create a ${timeframe} action plan for ${customerData.companyName} based on this report:\n\n${reportContent}`;

        const result = await this.gateway.generate(prompt, systemPrompt, {
            maxTokens: 2048,
            temperature: 0.6
        });

        return result.content;
    }

    // Stream report generation with live output
    async streamReport(customerData, formData, reportType, onChunk) {
        const systemPrompt = this.getSystemPrompt(reportType);
        const userPrompt = this.buildReportPrompt(customerData, formData, reportType);

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        return await this.gateway.streamCompletion(messages, onChunk, {
            maxTokens: 4096,
            temperature: 0.7
        });
    }
}

// Global instance
window.aiReportGenerator = new AIReportGenerator();
