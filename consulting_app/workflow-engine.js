// Workflow Engine - Full consulting pipeline automation
// Issue → Agent Assignment → Research → Data Gathering → Report → Review → Delivery
class WorkflowEngine {
    constructor() {
        this.workflows = [];
        this.activeRuns = [];
        this.gateway = window.aiGateway;
    }

    // ========== WORKFLOW DEFINITION ==========

    // Create a new workflow template
    createWorkflow(config) {
        const workflow = {
            id: 'wf_' + Date.now(),
            name: config.name || 'Untitled Workflow',
            description: config.description || '',
            trigger: config.trigger || { type: 'manual' }, // manual, issue_type, schedule
            steps: config.steps || [],
            reviewRequired: config.reviewRequired !== false,
            managerAgent: config.managerAgent || 'manager',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isTemplate: config.isTemplate || false,
            category: config.category || 'general',
            estimatedDuration: config.estimatedDuration || '1-2 hours'
        };
        return workflow;
    }

    // Create a workflow step
    createStep(config) {
        return {
            id: 'step_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: config.name || 'Untitled Step',
            order: config.order || 0,
            agent: config.agent || 'analyst', // Which agent role handles this
            action: config.action || 'research', // research, analyze, generate, review, compile, deliver
            instructions: config.instructions || '',
            inputFrom: config.inputFrom || null, // Previous step ID or 'trigger'
            outputTo: config.outputTo || null, // Next step ID or 'final'
            outputType: config.outputType || 'text', // text, json, report, scorecard, data
            requiresApproval: config.requiresApproval || false,
            timeout: config.timeout || 60000, // ms
            retryOnFail: config.retryOnFail || true,
            maxRetries: config.maxRetries || 2,
            conditions: config.conditions || null, // Conditional execution
            dataGathering: config.dataGathering || null // What data to collect
        };
    }

    // ========== WORKFLOW EXECUTION ==========

    // Start a workflow run
    async startWorkflow(workflowId, triggerData = {}) {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (!workflow) throw new Error('Workflow not found: ' + workflowId);

        const run = {
            id: 'run_' + Date.now(),
            workflowId: workflowId,
            workflowName: workflow.name,
            status: 'running', // running, paused, completed, failed, review_pending
            triggerData: triggerData,
            startedAt: new Date().toISOString(),
            completedAt: null,
            currentStepIndex: 0,
            stepResults: {},
            finalOutput: null,
            managerReview: null,
            logs: [],
            errors: []
        };

        this.activeRuns.push(run);
        this.log(run, 'Workflow started: ' + workflow.name);

        // Execute steps sequentially
        try {
            for (let i = 0; i < workflow.steps.length; i++) {
                run.currentStepIndex = i;
                const step = workflow.steps[i];

                this.log(run, `Step ${i + 1}/${workflow.steps.length}: ${step.name} [Agent: ${step.agent}]`);

                // Check conditions
                if (step.conditions && !this.evaluateConditions(step.conditions, run)) {
                    this.log(run, `Step skipped (conditions not met): ${step.name}`);
                    run.stepResults[step.id] = { status: 'skipped', reason: 'conditions_not_met' };
                    continue;
                }

                // Execute the step
                const result = await this.executeStep(step, run, workflow);
                run.stepResults[step.id] = result;

                if (result.status === 'failed') {
                    run.errors.push({ step: step.name, error: result.error });
                    if (!step.retryOnFail) {
                        run.status = 'failed';
                        this.log(run, 'Workflow failed at step: ' + step.name);
                        break;
                    }
                }

                // Check if approval needed before continuing
                if (step.requiresApproval) {
                    run.status = 'paused';
                    this.log(run, 'Waiting for approval at step: ' + step.name);
                    return run; // Pause execution, will resume when approved
                }
            }

            // All steps complete - run manager review if required
            if (workflow.reviewRequired && run.status !== 'failed') {
                run.status = 'review_pending';
                this.log(run, 'All steps complete. Sending for manager AI review...');
                run.managerReview = await this.runManagerReview(run, workflow);
                this.log(run, 'Manager review complete.');
            }

            // Compile final output
            if (run.status !== 'failed') {
                run.finalOutput = await this.compileFinalOutput(run, workflow);
                run.status = 'completed';
                run.completedAt = new Date().toISOString();
                this.log(run, 'Workflow completed successfully.');
            }

        } catch (error) {
            run.status = 'failed';
            run.errors.push({ step: 'execution', error: error.message });
            this.log(run, 'Workflow failed: ' + error.message);
        }

        return run;
    }

    // Execute a single step
    async executeStep(step, run, workflow) {
        const agentRole = window.agentRoles?.getRole(step.agent);
        if (!agentRole) {
            return { status: 'failed', error: `Agent role not found: ${step.agent}` };
        }

        // Build context from previous steps
        const context = this.buildStepContext(step, run);

        // Build the prompt for this step
        const prompt = this.buildStepPrompt(step, context, run.triggerData);
        const systemPrompt = agentRole.systemPrompt + '\n\n' + (step.instructions || '');

        let attempts = 0;
        const maxAttempts = step.retryOnFail ? step.maxRetries + 1 : 1;

        while (attempts < maxAttempts) {
            try {
                let result;

                if (step.outputType === 'json') {
                    result = await this.gateway.generateJSON(prompt, systemPrompt, {
                        maxTokens: 4096,
                        temperature: agentRole.temperature || 0.7
                    });
                    return {
                        status: 'completed',
                        output: result.parsed || result.content,
                        raw: result.content,
                        tokens: result.usage,
                        agent: step.agent,
                        timestamp: new Date().toISOString()
                    };
                } else {
                    result = await this.gateway.generate(prompt, systemPrompt, {
                        maxTokens: 4096,
                        temperature: agentRole.temperature || 0.7
                    });
                    return {
                        status: 'completed',
                        output: result.content,
                        tokens: result.usage,
                        agent: step.agent,
                        timestamp: new Date().toISOString()
                    };
                }
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    return { status: 'failed', error: error.message, attempts: attempts };
                }
                await this.delay(2000 * attempts); // Exponential backoff
            }
        }
    }

    // Build context from previous step results
    buildStepContext(currentStep, run) {
        let context = '';

        // Add trigger data
        if (run.triggerData) {
            context += '## Trigger Data\n';
            if (typeof run.triggerData === 'object') {
                for (const [key, value] of Object.entries(run.triggerData)) {
                    context += `- ${key}: ${value}\n`;
                }
            } else {
                context += run.triggerData + '\n';
            }
            context += '\n';
        }

        // Add results from previous steps
        const completedSteps = Object.entries(run.stepResults).filter(([id, r]) => r.status === 'completed');
        if (completedSteps.length > 0) {
            context += '## Previous Step Results\n\n';
            completedSteps.forEach(([stepId, result]) => {
                context += `### ${result.agent} output:\n${typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2)}\n\n`;
            });
        }

        return context;
    }

    // Build prompt for a step
    buildStepPrompt(step, context, triggerData) {
        let prompt = '';

        switch (step.action) {
            case 'research':
                prompt = `Research the following topic thoroughly:\n\n${context}\n\nProvide detailed findings with data points, benchmarks, and sources.`;
                break;
            case 'analyze':
                prompt = `Analyze the following data and information:\n\n${context}\n\nProvide a structured analysis with key findings, patterns, and implications.`;
                break;
            case 'generate':
                prompt = `Generate the following deliverable based on this context:\n\n${context}\n\n${step.instructions}`;
                break;
            case 'review':
                prompt = `Review the following work for quality, accuracy, and completeness:\n\n${context}\n\nProvide specific feedback, corrections, and improvement suggestions.`;
                break;
            case 'compile':
                prompt = `Compile and structure all the following information into a cohesive final deliverable:\n\n${context}\n\nFormat as a professional consulting document in HTML.`;
                break;
            case 'score':
                prompt = `Score and evaluate the following:\n\n${context}\n\nReturn JSON with scores (1-10) for each dimension.`;
                break;
            default:
                prompt = `${step.instructions}\n\nContext:\n${context}`;
        }

        return prompt;
    }

    // Manager AI review
    async runManagerReview(run, workflow) {
        const managerRole = window.agentRoles?.getRole('manager');
        if (!managerRole) {
            return { status: 'skipped', reason: 'No manager role configured' };
        }

        // Compile all step outputs for review
        let reviewContent = `# Workflow Review: ${workflow.name}\n\n`;
        reviewContent += `## Trigger Data\n${JSON.stringify(run.triggerData, null, 2)}\n\n`;
        reviewContent += `## Step Results\n\n`;

        Object.entries(run.stepResults).forEach(([stepId, result]) => {
            if (result.status === 'completed') {
                reviewContent += `### ${result.agent} (${stepId})\n`;
                reviewContent += typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2);
                reviewContent += '\n\n---\n\n';
            }
        });

        const prompt = `You are the Managing Consultant reviewing this workflow output. 
Evaluate for:
1. Quality and accuracy of analysis
2. Actionability of recommendations  
3. Completeness (any gaps?)
4. Professional tone and presentation
5. Client-readiness

Provide:
- Overall quality score (1-10)
- Specific feedback per section
- Required changes (if any)
- Final approval status: APPROVED, NEEDS_REVISION, or REJECTED

Context to review:
${reviewContent}`;

        try {
            const result = await this.gateway.generateJSON(prompt, managerRole.systemPrompt, {
                maxTokens: 2048,
                temperature: 0.5
            });

            return {
                status: 'completed',
                review: result.parsed || result.content,
                raw: result.content,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { status: 'failed', error: error.message };
        }
    }

    // Compile final output from all steps
    async compileFinalOutput(run, workflow) {
        const compilerRole = window.agentRoles?.getRole('compiler');
        const systemPrompt = compilerRole?.systemPrompt || 'You compile consulting deliverables into professional, client-ready documents. Format in clean HTML.';

        let allContent = '';
        Object.entries(run.stepResults).forEach(([stepId, result]) => {
            if (result.status === 'completed') {
                allContent += `\n\n${typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2)}`;
            }
        });

        // Add manager review notes if available
        if (run.managerReview?.review) {
            allContent += `\n\n## Manager Notes\n${JSON.stringify(run.managerReview.review, null, 2)}`;
        }

        const prompt = `Compile all the following consulting work into a single, professional, client-ready document. Structure it with clear sections, executive summary at the top, and action items at the bottom. Format in HTML.\n\n${allContent}`;

        try {
            const result = await this.gateway.generate(prompt, systemPrompt, { maxTokens: 8192 });
            return { content: result.content, compiledAt: new Date().toISOString() };
        } catch (error) {
            // If compilation fails, just concatenate raw outputs
            return { content: allContent, compiledAt: new Date().toISOString(), note: 'Raw compilation (AI compile failed)' };
        }
    }

    // ========== WORKFLOW MANAGEMENT ==========

    // Save workflow to storage
    async saveWorkflow(workflow) {
        const existing = this.workflows.findIndex(w => w.id === workflow.id);
        if (existing >= 0) {
            this.workflows[existing] = workflow;
        } else {
            this.workflows.push(workflow);
        }
        localStorage.setItem('consulting_workflows', JSON.stringify(this.workflows));
    }

    // Load all workflows from storage
    loadWorkflows() {
        try {
            const saved = localStorage.getItem('consulting_workflows');
            this.workflows = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.workflows = [];
        }
        return this.workflows;
    }

    // Delete workflow
    deleteWorkflow(workflowId) {
        this.workflows = this.workflows.filter(w => w.id !== workflowId);
        localStorage.setItem('consulting_workflows', JSON.stringify(this.workflows));
    }

    // Resume a paused workflow
    async resumeWorkflow(runId, approved = true) {
        const run = this.activeRuns.find(r => r.id === runId);
        if (!run || run.status !== 'paused') return null;

        if (!approved) {
            run.status = 'failed';
            run.errors.push({ step: 'approval', error: 'Rejected by user' });
            return run;
        }

        run.status = 'running';
        // Continue from next step
        const workflow = this.workflows.find(w => w.id === run.workflowId);
        // Re-run remaining steps... (simplified - in production would pick up exactly where left off)
        return run;
    }

    // ========== UTILITIES ==========

    evaluateConditions(conditions, run) {
        if (!conditions) return true;
        // Simple condition evaluation
        if (conditions.requirePreviousSuccess) {
            const prevResults = Object.values(run.stepResults);
            return prevResults.every(r => r.status === 'completed' || r.status === 'skipped');
        }
        return true;
    }

    log(run, message) {
        run.logs.push({ timestamp: new Date().toISOString(), message: message });
        console.log(`[Workflow ${run.id}] ${message}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get run status summary
    getRunSummary(runId) {
        const run = this.activeRuns.find(r => r.id === runId);
        if (!run) return null;

        const totalSteps = Object.keys(run.stepResults).length;
        const completed = Object.values(run.stepResults).filter(r => r.status === 'completed').length;
        const failed = Object.values(run.stepResults).filter(r => r.status === 'failed').length;

        return {
            id: run.id,
            name: run.workflowName,
            status: run.status,
            progress: `${completed}/${totalSteps}`,
            failed: failed,
            startedAt: run.startedAt,
            completedAt: run.completedAt,
            hasReview: !!run.managerReview,
            reviewStatus: run.managerReview?.review?.approvalStatus || 'pending'
        };
    }
}

// Global instance
window.workflowEngine = new WorkflowEngine();
