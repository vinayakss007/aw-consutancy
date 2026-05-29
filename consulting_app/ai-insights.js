// AI Insights Engine - Industry analysis, scoring, benchmarking, smart recommendations
class AIInsightsEngine {
    constructor() {
        this.gateway = window.aiGateway;
    }

    // Analyze industry and provide benchmarks
    async getIndustryBenchmarks(industry, metrics = {}) {
        const systemPrompt = `You are an industry research analyst with deep knowledge of business benchmarks across all sectors. Provide realistic, data-backed industry benchmarks. Format response as JSON.`;

        const prompt = `Provide industry benchmarks for the "${industry}" sector. Include typical ranges for:
- Revenue growth rate (%)
- Profit margins (%)
- Customer acquisition cost
- Customer retention rate
- Employee productivity metrics
- Digital maturity score
- Key operational KPIs specific to this industry

${metrics && Object.keys(metrics).length > 0 ? `\nCompany's current metrics for comparison:\n${JSON.stringify(metrics, null, 2)}` : ''}

Return JSON: { "industry": "", "benchmarks": { "metric_name": { "low": "", "median": "", "top_quartile": "", "unit": "" } }, "industryInsights": ["insight1", "insight2"], "keyRisks": ["risk1", "risk2"] }`;

        const result = await this.gateway.generateJSON(prompt, systemPrompt);
        return result.parsed || { error: 'Failed to generate benchmarks', raw: result.content };
    }

    // Generate SWOT analysis from business data
    async generateSWOT(customerData, formData) {
        const systemPrompt = `You are a strategic consultant. Generate a detailed SWOT analysis. Be specific to the business and industry - no generic statements. Format as JSON.`;

        const prompt = `Generate SWOT analysis for:
Business: ${customerData.companyName}
Industry: ${customerData.industry}
Data: ${JSON.stringify(formData, null, 2)}

Return JSON: { "strengths": [{"point": "", "impact": "High/Medium/Low"}], "weaknesses": [{"point": "", "impact": ""}], "opportunities": [{"point": "", "timeframe": ""}], "threats": [{"point": "", "severity": ""}], "strategicImplications": "" }`;

        const result = await this.gateway.generateJSON(prompt, systemPrompt);
        return result.parsed || { error: 'Failed to generate SWOT', raw: result.content };
    }

    // Generate competitive analysis
    async analyzeCompetitiveLandscape(industry, companyInfo, competitors = []) {
        const systemPrompt = `You are a market research strategist. Analyze the competitive landscape and provide positioning insights. Format response in HTML with tables.`;

        const prompt = `Analyze competitive landscape for:
Company: ${companyInfo.companyName}
Industry: ${industry}
${competitors.length > 0 ? `Known competitors: ${competitors.join(', ')}` : 'Identify likely competitors based on industry and profile.'}

Company profile: ${JSON.stringify(companyInfo, null, 2)}

Provide:
1. Competitive positioning map (describe quadrants)
2. Key differentiators to develop
3. Competitive threats to address
4. Market gaps/opportunities
5. Recommended competitive strategy`;

        const result = await this.gateway.generate(prompt, systemPrompt, { maxTokens: 2048 });
        return result.content;
    }

    // Generate smart form questions based on industry
    async generateFormQuestions(industry, assessmentType = 'general') {
        const systemPrompt = `You are a consulting diagnostic designer. Generate assessment questions that will reveal the most critical business insights. Questions should be specific, measurable, and actionable. Return as JSON.`;

        const prompt = `Generate 15-20 diagnostic questions for a ${assessmentType} assessment of a ${industry} business.

Group questions into categories. Each question should have:
- The question text
- Field type (text, number, select, textarea, rating)
- Options (if select type)
- Why this question matters (brief note)

Return JSON: { "title": "", "description": "", "categories": [{ "name": "", "questions": [{ "id": "", "question": "", "type": "", "options": [], "required": true, "helpText": "" }] }] }`;

        const result = await this.gateway.generateJSON(prompt, systemPrompt, { maxTokens: 3000 });
        return result.parsed || { error: 'Failed to generate questions', raw: result.content };
    }

    // Analyze data patterns and anomalies
    async analyzeDataPatterns(data, context = '') {
        const systemPrompt = `You are a data analyst. Identify patterns, anomalies, correlations, and insights from business data. Be specific with numbers and percentages. Format as HTML.`;

        const prompt = `Analyze this business data and identify key patterns:\n\n${JSON.stringify(data, null, 2)}\n\n${context ? `Context: ${context}` : ''}\n\nProvide:\n1. Key patterns identified\n2. Anomalies or concerns\n3. Correlations between data points\n4. Actionable insights\n5. Areas needing more data`;

        const result = await this.gateway.generate(prompt, systemPrompt, { maxTokens: 2048 });
        return result.content;
    }

    // Generate improvement roadmap
    async generateRoadmap(customerData, currentState, targetState, timeframe = '12 months') {
        const systemPrompt = `You are a transformation consultant. Create a realistic, phased improvement roadmap. Include dependencies, milestones, resource needs, and success metrics. Format as HTML with a timeline.`;

        const prompt = `Create a ${timeframe} improvement roadmap for ${customerData.companyName} (${customerData.industry}).

Current State:
${JSON.stringify(currentState, null, 2)}

Target State:
${JSON.stringify(targetState, null, 2)}

Include:
- Phased approach (3-4 phases)
- Monthly milestones
- Resource/budget estimates
- Risk factors per phase
- Quick wins (first 30 days)
- Success metrics for each phase`;

        const result = await this.gateway.generate(prompt, systemPrompt, { maxTokens: 3000 });
        return result.content;
    }

    // Generate ROI analysis for recommendations
    async calculateROI(recommendation, businessContext) {
        const systemPrompt = `You are a financial analyst. Calculate estimated ROI for business recommendations. Be realistic and show your assumptions. Format as JSON.`;

        const prompt = `Calculate ROI for this recommendation:
Recommendation: ${recommendation}
Business: ${JSON.stringify(businessContext, null, 2)}

Return JSON: { "recommendation": "", "investment": { "amount": "", "breakdown": [] }, "returns": { "year1": "", "year2": "", "year3": "" }, "paybackPeriod": "", "assumptions": [], "risks": [], "confidence": "High/Medium/Low" }`;

        const result = await this.gateway.generateJSON(prompt, systemPrompt);
        return result.parsed || { error: 'Failed to calculate ROI', raw: result.content };
    }

    // Country-specific consulting advice
    async getCountrySpecificAdvice(country, industry, challenge) {
        const systemPrompt = `You are an international business consultant with expertise in regulatory environments, cultural business norms, and market conditions across different countries. Provide specific, actionable advice.`;

        const prompt = `Provide country-specific consulting advice:
Country: ${country}
Industry: ${industry}
Challenge: ${challenge}

Include:
1. Regulatory considerations specific to this country
2. Cultural business norms to follow
3. Common pitfalls for this industry in this market
4. Recommended approach/methodology adaptations
5. Key contacts/resources to leverage
6. Pricing/billing norms for this market`;

        const result = await this.gateway.generate(prompt, systemPrompt, { maxTokens: 2048 });
        return result.content;
    }

    // Auto-fill template with AI-generated content
    async autoFillTemplate(template, customerData, formData) {
        const systemPrompt = `You are filling in a consulting template with relevant, specific content based on the business data provided. Replace each placeholder with appropriate professional content. Return the filled content as HTML.`;

        let templateContent = '';
        if (template.sections) {
            template.sections.forEach(section => {
                templateContent += `\n[Section: ${section.name}]\n${section.content}\n`;
            });
        }

        const prompt = `Fill this consulting template for ${customerData.companyName} (${customerData.industry}):

Template:
${templateContent}

Business Data:
${JSON.stringify(formData, null, 2)}

Customer Info:
${JSON.stringify(customerData, null, 2)}

Replace all {{placeholders}} with specific, relevant content. Add professional insights where appropriate. Maintain the template structure.`;

        const result = await this.gateway.generate(prompt, systemPrompt, { maxTokens: 4096 });
        return result.content;
    }

    // Generate email/proposal from report
    async generateProposal(customerData, serviceOffering, reportSummary = '') {
        const systemPrompt = `You are a business development consultant writing a consulting proposal. Be professional, specific, and persuasive. Include clear deliverables, timeline, pricing structure, and terms. Format as HTML.`;

        const prompt = `Generate a consulting proposal:
Client: ${customerData.companyName} (${customerData.industry})
Contact: ${customerData.contactName}
Service: ${serviceOffering}
${reportSummary ? `\nBased on diagnostic findings:\n${reportSummary}` : ''}

Include:
1. Executive Summary (why they need this)
2. Proposed Approach (methodology)
3. Deliverables (specific outputs)
4. Timeline (week-by-week)
5. Team & Expertise
6. Investment (pricing structure)
7. Terms & Next Steps`;

        const result = await this.gateway.generate(prompt, systemPrompt, { maxTokens: 3000 });
        return result.content;
    }

    // Quick insight bullets from any data
    async quickInsights(data, context = '') {
        const systemPrompt = `You are a senior analyst. Provide 5-7 quick, actionable insight bullets from this data. Each bullet should be specific, quantified where possible, and immediately useful. Format as HTML unordered list.`;

        const prompt = `Quick insights from this data:\n${JSON.stringify(data, null, 2)}\n${context ? `Context: ${context}` : ''}`;

        const result = await this.gateway.generate(prompt, systemPrompt, {
            maxTokens: 1024,
            temperature: 0.6
        });

        return result.content;
    }
}

// Global instance
window.aiInsights = new AIInsightsEngine();
