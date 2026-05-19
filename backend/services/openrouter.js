const https = require('https');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = 'anthropic/claude-3-5-sonnet-20241022';
  }

  // ─── parseAIJson ───────────────────────────────────────────────────────────
  parseAIJson(text) {
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) {}
    const stripped = text.replace(/```json\n?|```\n?/g, '').trim();
    try { return JSON.parse(stripped); } catch (_) {}
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
    return null;
  }

  // ─── Core chat with 30s timeout ───────────────────────────────────────────
  async chat(systemPrompt, userMessage) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 4000,
        temperature: 0.7
      });

      const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Test Generation Platform'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.error) {
              reject(new Error(parsed.error.message || 'OpenRouter API error'));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error('Failed to parse OpenRouter response'));
          }
        });
      });

      const timeout = setTimeout(() => {
        req.destroy();
        reject(new Error('OpenRouter request timed out after 30 seconds'));
      }, 30000);

      req.on('error', (err) => { clearTimeout(timeout); reject(err); });
      req.on('close', () => clearTimeout(timeout));
      req.write(data);
      req.end();
    });
  }

  // ─── Generate Test Cases ───────────────────────────────────────────────────
  async generateTestCases(code, language, framework) {
    const systemPrompt = `You are an expert test engineer. Generate comprehensive test cases for the provided code. Always respond with valid JSON only.`;

    const userMessage = `Generate test cases for the following ${language} code using ${framework}:

\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON:
{
  "test_cases": [
    {"name": string, "description": string, "code": string, "type": "unit|integration|e2e", "priority": "high|medium|low"}
  ],
  "testability_score": number (0-100),
  "complexity_score": number (0-100),
  "coverage_estimate": number (0-100),
  "recommendations": [string]
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Analyze Code ──────────────────────────────────────────────────────────
  async analyzeCode(code, language) {
    const systemPrompt = `You are an expert code analyst. Always respond with valid JSON only.`;

    const userMessage = `Analyze this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON:
{
  "testability_score": number (0-100),
  "complexity_score": number (0-100),
  "quality_score": number (0-100),
  "issues": [{"type": string, "description": string, "severity": "critical|high|medium|low"}],
  "recommendations": [string],
  "test_strategies": [string]
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Detect Bugs ──────────────────────────────────────────────────────────
  async detectBugs(code, language) {
    const systemPrompt = `You are an expert bug detection AI. Always respond with valid JSON only.`;

    const userMessage = `Detect potential bugs in this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON:
{
  "bugs": [
    {"severity": "critical|high|medium|low", "description": string, "line_number": number, "fix_suggestion": string}
  ],
  "total_bugs": number,
  "critical_count": number,
  "high_count": number,
  "summary": string
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Generate API Tests ───────────────────────────────────────────────────
  async generateApiTests(endpoint, method, requestBody, headers) {
    const systemPrompt = `You are an expert API test engineer. Always respond with valid JSON only.`;

    const userMessage = `Generate API tests for:
Endpoint: ${endpoint}
Method: ${method}
Request Body: ${JSON.stringify(requestBody)}
Headers: ${JSON.stringify(headers)}

Return ONLY valid JSON:
{
  "tests": [
    {"name": string, "description": string, "type": "happy_path|error|edge_case|auth|validation", "code": string, "expected_status": number}
  ],
  "coverage_areas": [string],
  "recommendations": [string]
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Generate Performance Tests ───────────────────────────────────────────
  async generatePerformanceTests(config) {
    const systemPrompt = `You are an expert performance test engineer. Always respond with valid JSON only.`;

    const userMessage = `Generate performance tests for:
${JSON.stringify(config, null, 2)}

Return ONLY valid JSON:
{
  "tests": [
    {"type": "load|stress|spike|endurance", "description": string, "config": object, "thresholds": object, "code": string}
  ],
  "recommendations": [string]
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Generate Security Tests ──────────────────────────────────────────────
  async generateSecurityTests(target) {
    const systemPrompt = `You are an expert security test engineer. Always respond with valid JSON only.`;

    const userMessage = `Generate security tests for:
${JSON.stringify(target, null, 2)}

Return ONLY valid JSON:
{
  "tests": [
    {"type": string, "description": string, "code": string, "vulnerability_type": string, "remediation": string}
  ],
  "vulnerability_count": number,
  "critical_vulnerabilities": number,
  "recommendations": [string]
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Generate Integration Tests ───────────────────────────────────────────
  async generateIntegrationTests(components) {
    const systemPrompt = `You are an expert integration test engineer. Always respond with valid JSON only.`;

    const userMessage = `Generate integration tests for these components:
${JSON.stringify(components, null, 2)}

Return ONLY valid JSON:
{
  "tests": [
    {"name": string, "description": string, "components_tested": [string], "code": string}
  ],
  "coverage_areas": [string],
  "recommendations": [string]
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Generate Regression Tests ────────────────────────────────────────────
  async generateRegressionTests(changes) {
    const systemPrompt = `You are an expert regression test engineer. Always respond with valid JSON only.`;

    const userMessage = `Generate regression tests for these changes:
${JSON.stringify(changes, null, 2)}

Return ONLY valid JSON:
{
  "tests": [
    {"name": string, "description": string, "risk_level": "critical|high|medium|low", "code": string, "affected_areas": [string]}
  ],
  "priority_order": [string],
  "recommendations": [string]
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Mutation Score Analysis ──────────────────────────────────────────────
  async analyzeMutationScore(sourceCode, testCode, language) {
    const systemPrompt = `You are a mutation testing expert. Always respond with valid JSON only.`;

    const userMessage = `Analyze mutation kill rate for this ${language} test against its source code.

Source Code:
\`\`\`${language}
${sourceCode.slice(0, 3000)}
\`\`\`

Test Code:
\`\`\`${language}
${testCode.slice(0, 3000)}
\`\`\`

Return ONLY valid JSON:
{
  "mutation_score": number (0-100, percentage of mutations the tests would catch),
  "weak_assertions": [string],
  "missing_edge_cases": [string],
  "strong_test_areas": [string],
  "improvement_suggestions": [string]
}`;
    return this.chat(systemPrompt, userMessage);
  }

  // ─── Format response ──────────────────────────────────────────────────────
  formatResponse(apiResponse) {
    if (!apiResponse || !apiResponse.choices || !apiResponse.choices[0]) {
      return { content: 'No response generated', model: this.model, usage: {} };
    }

    const choice = apiResponse.choices[0];
    return {
      content: choice.message?.content || '',
      model: apiResponse.model || this.model,
      usage: {
        promptTokens: apiResponse.usage?.prompt_tokens || 0,
        completionTokens: apiResponse.usage?.completion_tokens || 0,
        totalTokens: apiResponse.usage?.total_tokens || 0
      },
      finishReason: choice.finish_reason || 'unknown',
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = new OpenRouterService();
