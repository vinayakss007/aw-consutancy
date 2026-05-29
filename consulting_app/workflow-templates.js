// Pre-built Workflow Templates for common consulting scenarios
// Each template defines the full pipeline: trigger → agents → steps → review

class WorkflowTemplates {
    constructor() {
        this.engine = window.workflowEngine;
        this.templates = this.defineTemplates();
    }

    defineTemplates() {
        return [
            this.businessDiagnostic(),
            this.strategyEngagement(),
            this.complianceAudit(),
            this.marketEntryAdvisory(),
            this.technologyAssessment(),
            this.financialHealthCheck(),
            this.operationsOptimization(),
            this.proposalGeneration(),
            this.clientOnboarding(),
            this.quickInsightSprint()
        ];
    }

    // ========== TEMPLATE 1: BUSINESS DIAGNOSTIC ==========
    businessDiagnostic() {
        return this.engine.createWorkflow({
            name: 'Full Business Diagnostic',
            description: 'Complete business health assessment: data collection → research → multi-dimension analysis → scoring → recommendations → manager review',
            category: 'diagnostic',
            isTemplate: true,
            estimatedDuration: '2-3 hours AI + human review',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'company_size', 'key_challenges'] },
            reviewRequired: true,
            steps: [
                this.engine.createStep({ name: 'Design Assessment Questions', order: 1, agent: 'data_collector', action: 'generate', outputType: 'json', instructions: 'Create a comprehensive diagnostic questionnaire tailored to this business. Include questions on: revenue model, operations, technology, team, finances, customers, and growth. 25-30 questions grouped by category.' }),
                this.engine.createStep({ name: 'Industry Research', order: 2, agent: 'researcher', action: 'research', instructions: 'Research the industry landscape, key benchmarks, competitive dynamics, regulatory environment, and technology trends relevant to this business. Provide specific data points.' }),
                this.engine.createStep({ name: 'Business Analysis', order: 3, agent: 'analyst', action: 'analyze', instructions: 'Analyze all gathered data. Score the business on 9 dimensions (1-10): Digital Maturity, Operational Efficiency, Financial Health, Market Position, Team & Leadership, Growth Potential, Customer Satisfaction, Innovation Readiness, Compliance & Risk. Provide justification for each score.' }),
                this.engine.createStep({ name: 'Strategic Recommendations', order: 4, agent: 'strategist', action: 'generate', instructions: 'Based on the analysis, develop 7-10 prioritized recommendations. For each: what to do, why, expected impact, effort level, timeline, dependencies, and success metrics. Include 3 quick wins for the first 30 days.' }),
                this.engine.createStep({ name: 'Financial Validation', order: 5, agent: 'financial_analyst', action: 'analyze', instructions: 'Validate the business case for the top 5 recommendations. Calculate estimated ROI, payback period, and required investment. Flag any financially unrealistic suggestions.' }),
                this.engine.createStep({ name: 'Write Final Report', order: 6, agent: 'report_writer', action: 'compile', instructions: 'Compile everything into a professional diagnostic report with: Executive Summary, Scoring Dashboard, Key Findings, Recommendations (prioritized), Implementation Roadmap, and Next Steps. Format in professional HTML.' }),
                this.engine.createStep({ name: 'Quality Review', order: 7, agent: 'reviewer', action: 'review', outputType: 'json', instructions: 'Review the final report for quality, accuracy, completeness, and client-readiness. Score 1-10 and list any required fixes.' })
            ]
        });
    }

    // ========== TEMPLATE 2: STRATEGY ENGAGEMENT ==========
    strategyEngagement() {
        return this.engine.createWorkflow({
            name: 'Strategy Development',
            description: 'Full strategic advisory: market research → competitive analysis → strategy formulation → roadmap → financial modeling',
            category: 'strategy',
            isTemplate: true,
            estimatedDuration: '3-4 hours AI + human review',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'strategic_question', 'constraints'] },
            reviewRequired: true,
            steps: [
                this.engine.createStep({ name: 'Market & Competitive Research', order: 1, agent: 'researcher', action: 'research', instructions: 'Deep research on market size, growth trends, competitive landscape, customer segments, and emerging opportunities. Include 5+ specific competitors with positioning analysis.' }),
                this.engine.createStep({ name: 'SWOT & Situation Analysis', order: 2, agent: 'analyst', action: 'analyze', outputType: 'json', instructions: 'Conduct full SWOT analysis. Include Porter\'s Five Forces assessment. Identify the 3 most critical strategic choices the business faces.' }),
                this.engine.createStep({ name: 'Strategy Options', order: 3, agent: 'strategist', action: 'generate', instructions: 'Develop 3 distinct strategic options with pros/cons for each. Recommend the preferred option with clear reasoning. Include build vs. buy vs. partner analysis where relevant.' }),
                this.engine.createStep({ name: 'Financial Modeling', order: 4, agent: 'financial_analyst', action: 'generate', instructions: 'Build a 3-year financial model for the recommended strategy. Include revenue projections, cost structure, investment requirements, and break-even analysis. Show conservative/base/optimistic scenarios.' }),
                this.engine.createStep({ name: 'Implementation Roadmap', order: 5, agent: 'strategist', action: 'generate', instructions: 'Create a detailed 12-month implementation roadmap with quarterly milestones, resource requirements, risk mitigation, and governance structure.' }),
                this.engine.createStep({ name: 'Client Adaptation', order: 6, agent: 'client_advisor', action: 'review', instructions: 'Review all recommendations through the client lens. Adapt language, consider internal politics, suggest delivery approach, and prepare anticipated objection responses.' }),
                this.engine.createStep({ name: 'Compile Strategy Document', order: 7, agent: 'compiler', action: 'compile', instructions: 'Assemble into a board-ready strategy document: Executive Summary, Market Context, Strategic Options, Recommended Strategy, Financial Case, Implementation Roadmap, Risks & Mitigations.' }),
                this.engine.createStep({ name: 'Final Quality Check', order: 8, agent: 'reviewer', action: 'review', outputType: 'json' })
            ]
        });
    }

    // ========== TEMPLATE 3: COMPLIANCE AUDIT ==========
    complianceAudit() {
        return this.engine.createWorkflow({
            name: 'Compliance & Risk Audit',
            description: 'Regulatory gap analysis → risk assessment → remediation roadmap',
            category: 'compliance',
            isTemplate: true,
            estimatedDuration: '2-3 hours AI',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'jurisdiction', 'current_certifications'] },
            reviewRequired: true,
            steps: [
                this.engine.createStep({ name: 'Regulatory Landscape Mapping', order: 1, agent: 'researcher', action: 'research', instructions: 'Map all applicable regulations for this business in their jurisdiction. Include: data privacy (DPDP/GDPR), industry-specific regulations, labor laws, tax compliance, environmental, and sector certifications.' }),
                this.engine.createStep({ name: 'Compliance Gap Analysis', order: 2, agent: 'compliance_officer', action: 'analyze', outputType: 'json', instructions: 'Identify gaps between current state and regulatory requirements. Score each gap by: severity (1-5), likelihood of enforcement (1-5), financial exposure, and time to remediate.' }),
                this.engine.createStep({ name: 'Risk Assessment', order: 3, agent: 'compliance_officer', action: 'analyze', instructions: 'Comprehensive risk register: operational, financial, legal, reputational, and strategic risks. Include probability, impact, and risk score for each.' }),
                this.engine.createStep({ name: 'Remediation Roadmap', order: 4, agent: 'strategist', action: 'generate', instructions: 'Create prioritized remediation plan: immediate actions (0-30 days), short-term (30-90 days), and long-term (90-365 days). Include resource requirements and estimated costs.' }),
                this.engine.createStep({ name: 'Compliance Report', order: 5, agent: 'report_writer', action: 'compile', instructions: 'Professional compliance report with: Executive Summary, Regulatory Overview, Gap Analysis Table, Risk Register, Remediation Roadmap, Investment Required, and Compliance Calendar.' }),
                this.engine.createStep({ name: 'Review', order: 6, agent: 'reviewer', action: 'review', outputType: 'json' })
            ]
        });
    }

    // ========== TEMPLATE 4: MARKET ENTRY ==========
    marketEntryAdvisory() {
        return this.engine.createWorkflow({
            name: 'Market Entry Advisory',
            description: 'New market evaluation → entry strategy → go-to-market plan → financial projections',
            category: 'strategy',
            isTemplate: true,
            estimatedDuration: '3-4 hours AI',
            trigger: { type: 'manual', requiredInputs: ['customer', 'target_market', 'current_markets', 'budget', 'timeline'] },
            reviewRequired: true,
            steps: [
                this.engine.createStep({ name: 'Market Research', order: 1, agent: 'researcher', action: 'research', instructions: 'Research target market: size, growth, segments, regulations, cultural factors, competitive intensity, distribution channels, and entry barriers. Include country-specific insights if international.' }),
                this.engine.createStep({ name: 'Competitor & Landscape Analysis', order: 2, agent: 'analyst', action: 'analyze', instructions: 'Map existing players: market share, positioning, pricing, strengths/weaknesses. Identify white spaces and underserved segments. Assess competitive response risk.' }),
                this.engine.createStep({ name: 'Entry Strategy Options', order: 3, agent: 'strategist', action: 'generate', instructions: 'Develop 3+ entry strategy options: organic growth, partnership/JV, acquisition, franchise, digital-first, etc. Score each on: speed, cost, risk, control, scalability.' }),
                this.engine.createStep({ name: 'GTM Plan', order: 4, agent: 'strategist', action: 'generate', instructions: 'Detailed go-to-market plan for recommended option: target customer profile, value proposition, pricing strategy, channel strategy, marketing plan, sales approach, and first 100 customers plan.' }),
                this.engine.createStep({ name: 'Financial Projections', order: 5, agent: 'financial_analyst', action: 'generate', instructions: '3-year financial model for market entry: investment required, revenue ramp, cost structure, break-even point, and cash flow projections. Show multiple scenarios.' }),
                this.engine.createStep({ name: 'Risk & Mitigation', order: 6, agent: 'compliance_officer', action: 'analyze', instructions: 'Identify market entry risks: regulatory, competitive, operational, financial, cultural. Provide mitigation strategy for each.' }),
                this.engine.createStep({ name: 'Final Report', order: 7, agent: 'compiler', action: 'compile' }),
                this.engine.createStep({ name: 'Manager Review', order: 8, agent: 'reviewer', action: 'review', outputType: 'json' })
            ]
        });
    }

    // ========== TEMPLATE 5: TECHNOLOGY ASSESSMENT ==========
    technologyAssessment() {
        return this.engine.createWorkflow({
            name: 'Technology Readiness Assessment',
            description: 'Current state audit → gap analysis → technology roadmap → vendor evaluation',
            category: 'technology',
            isTemplate: true,
            estimatedDuration: '2-3 hours AI',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'current_systems', 'pain_points'] },
            reviewRequired: true,
            steps: [
                this.engine.createStep({ name: 'Technology Landscape Research', order: 1, agent: 'researcher', action: 'research', instructions: 'Research relevant technology solutions, trends, and best-in-class implementations for this industry. Include automation opportunities, AI/ML applications, and emerging technologies.' }),
                this.engine.createStep({ name: 'Current State Assessment', order: 2, agent: 'analyst', action: 'analyze', outputType: 'json', instructions: 'Score current technology maturity across: Infrastructure, Applications, Data & Analytics, Security, Integration, User Experience, Automation, and Innovation. 1-10 scale with justification.' }),
                this.engine.createStep({ name: 'Gap Analysis & Opportunities', order: 3, agent: 'analyst', action: 'analyze', instructions: 'Identify gaps between current state and industry best practice. Map automation opportunities. Quantify potential efficiency gains.' }),
                this.engine.createStep({ name: 'Technology Roadmap', order: 4, agent: 'strategist', action: 'generate', instructions: 'Create 18-month technology roadmap in 3 phases. For each initiative: description, priority, estimated cost, expected benefit, dependencies, and implementation timeline.' }),
                this.engine.createStep({ name: 'Budget & ROI', order: 5, agent: 'financial_analyst', action: 'generate', instructions: 'Investment analysis for the roadmap. Total budget by phase, expected ROI by initiative, and TCO comparison (current vs. proposed).' }),
                this.engine.createStep({ name: 'Final Report', order: 6, agent: 'report_writer', action: 'compile' }),
                this.engine.createStep({ name: 'Review', order: 7, agent: 'reviewer', action: 'review', outputType: 'json' })
            ]
        });
    }

    // ========== TEMPLATE 6: FINANCIAL HEALTH CHECK ==========
    financialHealthCheck() {
        return this.engine.createWorkflow({
            name: 'Financial Health Check',
            description: 'Unit economics → profitability analysis → cash flow optimization → growth funding strategy',
            category: 'financial',
            isTemplate: true,
            estimatedDuration: '2 hours AI',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'revenue', 'costs', 'growth_rate'] },
            reviewRequired: true,
            steps: [
                this.engine.createStep({ name: 'Industry Benchmarking', order: 1, agent: 'researcher', action: 'research', instructions: 'Gather financial benchmarks for this industry: typical margins, CAC/LTV ratios, growth rates, burn rates, and funding patterns.' }),
                this.engine.createStep({ name: 'Unit Economics Analysis', order: 2, agent: 'financial_analyst', action: 'analyze', instructions: 'Deep dive into unit economics: revenue per customer, cost to serve, contribution margin, CAC, LTV, payback period. Compare to benchmarks.' }),
                this.engine.createStep({ name: 'Profitability Levers', order: 3, agent: 'financial_analyst', action: 'generate', instructions: 'Identify top 10 levers to improve profitability. Quantify potential impact of each. Rank by ease of implementation vs. impact.' }),
                this.engine.createStep({ name: 'Cash Flow Optimization', order: 4, agent: 'financial_analyst', action: 'generate', instructions: 'Analyze cash flow patterns. Identify optimization opportunities: payment terms, inventory management, subscription vs. one-time, and working capital improvements.' }),
                this.engine.createStep({ name: 'Financial Report', order: 5, agent: 'report_writer', action: 'compile', instructions: 'Create financial health report with scorecards, benchmarking tables, and prioritized improvement actions.' }),
                this.engine.createStep({ name: 'Review', order: 6, agent: 'reviewer', action: 'review', outputType: 'json' })
            ]
        });
    }

    // ========== TEMPLATE 7: OPERATIONS OPTIMIZATION ==========
    operationsOptimization() {
        return this.engine.createWorkflow({
            name: 'Operations Optimization',
            description: 'Process mapping → bottleneck identification → automation opportunities → improvement roadmap',
            category: 'operations',
            isTemplate: true,
            estimatedDuration: '2-3 hours AI',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'processes', 'pain_points', 'team_size'] },
            reviewRequired: true,
            steps: [
                this.engine.createStep({ name: 'Process Data Collection', order: 1, agent: 'data_collector', action: 'generate', outputType: 'json', instructions: 'Design a process audit questionnaire covering: core processes, handoffs, cycle times, error rates, tools used, manual steps, and team responsibilities.' }),
                this.engine.createStep({ name: 'Best Practice Research', order: 2, agent: 'researcher', action: 'research', instructions: 'Research operational best practices for this industry. Include lean/six sigma benchmarks, automation case studies, and KPI standards.' }),
                this.engine.createStep({ name: 'Bottleneck Analysis', order: 3, agent: 'analyst', action: 'analyze', instructions: 'Identify top bottlenecks, waste points, and inefficiencies. Quantify time/cost impact of each. Map dependencies and root causes.' }),
                this.engine.createStep({ name: 'Automation & Improvement Plan', order: 4, agent: 'strategist', action: 'generate', instructions: 'For each identified issue: recommended solution, automation potential, effort vs. impact, implementation approach, and expected improvement metrics.' }),
                this.engine.createStep({ name: 'ROI Calculation', order: 5, agent: 'financial_analyst', action: 'generate', instructions: 'Calculate ROI for top 5 improvement initiatives. Include: current cost, projected savings, implementation cost, and payback period.' }),
                this.engine.createStep({ name: 'Operations Report', order: 6, agent: 'report_writer', action: 'compile' }),
                this.engine.createStep({ name: 'Review', order: 7, agent: 'reviewer', action: 'review', outputType: 'json' })
            ]
        });
    }

    // ========== TEMPLATE 8: PROPOSAL GENERATION ==========
    proposalGeneration() {
        return this.engine.createWorkflow({
            name: 'Consulting Proposal Generator',
            description: 'Research prospect → design engagement → write proposal → review & polish',
            category: 'sales',
            isTemplate: true,
            estimatedDuration: '1 hour AI',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'service_type', 'budget_range'] },
            reviewRequired: true,
            steps: [
                this.engine.createStep({ name: 'Prospect Research', order: 1, agent: 'researcher', action: 'research', instructions: 'Research the prospect: company background, recent news, likely pain points, growth stage, and decision-making style.' }),
                this.engine.createStep({ name: 'Engagement Design', order: 2, agent: 'strategist', action: 'generate', instructions: 'Design the consulting engagement: scope, methodology, deliverables, timeline, team composition, and pricing structure. Tailor to the client\'s needs and budget.' }),
                this.engine.createStep({ name: 'Write Proposal', order: 3, agent: 'report_writer', action: 'generate', instructions: 'Write a professional consulting proposal: Executive Summary, Understanding of Needs, Proposed Approach, Deliverables, Timeline, Team, Investment, Terms, and Why ABetWorks.' }),
                this.engine.createStep({ name: 'Client Tone Check', order: 4, agent: 'client_advisor', action: 'review', instructions: 'Review proposal for client fit. Adjust tone, check pricing sensitivity, and add relationship-building elements.' }),
                this.engine.createStep({ name: 'Final Review', order: 5, agent: 'reviewer', action: 'review', outputType: 'json' })
            ]
        });
    }

    // ========== TEMPLATE 9: CLIENT ONBOARDING ==========
    clientOnboarding() {
        return this.engine.createWorkflow({
            name: 'New Client Onboarding',
            description: 'Kickoff prep → data collection plan → initial assessment → engagement plan',
            category: 'operations',
            isTemplate: true,
            estimatedDuration: '1-2 hours AI',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'engagement_type', 'stakeholders'] },
            reviewRequired: false,
            steps: [
                this.engine.createStep({ name: 'Client Background Research', order: 1, agent: 'researcher', action: 'research', instructions: 'Quick research on the client: company overview, industry position, recent developments, and key people.' }),
                this.engine.createStep({ name: 'Data Collection Plan', order: 2, agent: 'data_collector', action: 'generate', outputType: 'json', instructions: 'Create a data request list: what documents/data to request from the client, interview schedule for stakeholders, and self-assessment questionnaire.' }),
                this.engine.createStep({ name: 'Initial Hypothesis', order: 3, agent: 'analyst', action: 'generate', instructions: 'Based on industry and client profile, generate initial hypotheses about likely issues and opportunities. These will be validated during discovery.' }),
                this.engine.createStep({ name: 'Engagement Plan', order: 4, agent: 'strategist', action: 'generate', instructions: 'Create detailed engagement plan: week-by-week activities, milestones, deliverables, client touchpoints, and risk mitigation. Include kickoff meeting agenda.' }),
                this.engine.createStep({ name: 'Compile Kickoff Pack', order: 5, agent: 'compiler', action: 'compile', instructions: 'Assemble into a kickoff package: engagement overview, data request, interview schedule, timeline, and initial questions for the client.' })
            ]
        });
    }

    // ========== TEMPLATE 10: QUICK INSIGHT SPRINT ==========
    quickInsightSprint() {
        return this.engine.createWorkflow({
            name: 'Quick Insight Sprint (30 min)',
            description: 'Rapid analysis → key insights → top 3 actions. Fast, focused, actionable.',
            category: 'diagnostic',
            isTemplate: true,
            estimatedDuration: '15-30 minutes AI',
            trigger: { type: 'manual', requiredInputs: ['customer', 'industry', 'specific_question'] },
            reviewRequired: false,
            steps: [
                this.engine.createStep({ name: 'Rapid Research', order: 1, agent: 'researcher', action: 'research', instructions: 'Quick research: 5-7 key data points relevant to the question. Industry benchmarks and best practices. 10 minutes of focused research.' }),
                this.engine.createStep({ name: 'Quick Analysis', order: 2, agent: 'analyst', action: 'analyze', instructions: 'Rapid analysis: What\'s the core issue? What does data say? What are the 3 most important insights? Keep it focused and concise.' }),
                this.engine.createStep({ name: 'Action Brief', order: 3, agent: 'strategist', action: 'generate', instructions: 'Provide exactly 3 actionable recommendations. For each: what to do (1 sentence), why (1 sentence), expected impact (1 sentence). Include 1 immediate action for today.' })
            ]
        });
    }

    // ========== TEMPLATE ACCESS ==========

    // Get all templates
    getAllTemplates() {
        return this.templates;
    }

    // Get template by category
    getByCategory(category) {
        return this.templates.filter(t => t.category === category);
    }

    // Get template by name
    getByName(name) {
        return this.templates.find(t => t.name === name);
    }

    // Install a template (copy to workflow engine as usable workflow)
    installTemplate(templateIndex) {
        const template = this.templates[templateIndex];
        if (!template) return null;

        const workflow = { ...template, isTemplate: false, id: 'wf_' + Date.now() };
        this.engine.workflows.push(workflow);
        this.engine.saveWorkflow(workflow);
        return workflow;
    }

    // Get template categories
    getCategories() {
        return [...new Set(this.templates.map(t => t.category))];
    }
}

// Global instance
window.workflowTemplates = new WorkflowTemplates();
