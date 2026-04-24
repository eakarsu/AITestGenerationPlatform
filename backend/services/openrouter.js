const https = require('https');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  }

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

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async generateTestCases(code, language, framework) {
    const systemPrompt = `You are an expert test engineer. Generate comprehensive test cases for the provided code.
    Return your response as a structured analysis with:
    - Test case name
    - Description
    - Test type (unit/integration/e2e)
    - Priority (high/medium/low)
    - Expected result
    - Test code
    Format your response clearly with sections separated by headers.`;

    const userMessage = `Generate test cases for the following ${language} code using ${framework}:\n\n${code}`;
    return this.chat(systemPrompt, userMessage);
  }

  async analyzeCode(code, language) {
    const systemPrompt = `You are an expert code analyst. Analyze the provided code for:
    - Code quality and maintainability
    - Testability score (1-100)
    - Complexity analysis
    - Potential issues
    - Recommendations for improvement
    - Suggested test strategies
    Provide a thorough, professional analysis.`;

    const userMessage = `Analyze this ${language} code:\n\n${code}`;
    return this.chat(systemPrompt, userMessage);
  }

  async detectBugs(code, language) {
    const systemPrompt = `You are an expert bug detection AI. Analyze the code for:
    - Potential bugs and defects
    - Logic errors
    - Edge cases not handled
    - Memory leaks
    - Security vulnerabilities
    - Race conditions
    - Null pointer issues
    Rate each bug by severity (critical/high/medium/low).`;

    const userMessage = `Detect potential bugs in this ${language} code:\n\n${code}`;
    return this.chat(systemPrompt, userMessage);
  }

  async generateApiTests(endpoint, method, requestBody, headers) {
    const systemPrompt = `You are an expert API test engineer. Generate comprehensive API test cases including:
    - Happy path tests
    - Error handling tests
    - Edge cases
    - Authentication tests
    - Rate limiting tests
    - Input validation tests
    Provide actual test code that can be executed.`;

    const userMessage = `Generate API tests for:\nEndpoint: ${endpoint}\nMethod: ${method}\nRequest Body: ${JSON.stringify(requestBody)}\nHeaders: ${JSON.stringify(headers)}`;
    return this.chat(systemPrompt, userMessage);
  }

  async generatePerformanceTests(config) {
    const systemPrompt = `You are an expert performance test engineer. Generate performance test scenarios including:
    - Load tests
    - Stress tests
    - Spike tests
    - Endurance tests
    Provide test configurations and expected thresholds.`;

    const userMessage = `Generate performance tests for:\n${JSON.stringify(config, null, 2)}`;
    return this.chat(systemPrompt, userMessage);
  }

  async generateSecurityTests(target) {
    const systemPrompt = `You are an expert security test engineer. Generate security test cases for:
    - SQL Injection
    - XSS (Cross-Site Scripting)
    - CSRF
    - Authentication bypass
    - Authorization flaws
    - Input validation
    - Data exposure
    Provide test cases with remediation suggestions.`;

    const userMessage = `Generate security tests for:\n${JSON.stringify(target, null, 2)}`;
    return this.chat(systemPrompt, userMessage);
  }

  async generateIntegrationTests(components) {
    const systemPrompt = `You are an expert integration test engineer. Generate integration test cases that verify:
    - Component interactions
    - Data flow between systems
    - API contract compliance
    - Database interactions
    - External service integrations
    Provide runnable test code.`;

    const userMessage = `Generate integration tests for these components:\n${JSON.stringify(components, null, 2)}`;
    return this.chat(systemPrompt, userMessage);
  }

  async generateRegressionTests(changes) {
    const systemPrompt = `You are an expert regression test engineer. Based on the code changes, generate regression test cases that:
    - Verify existing functionality still works
    - Cover affected areas
    - Test backward compatibility
    - Validate data migrations
    Prioritize tests by risk of regression.`;

    const userMessage = `Generate regression tests for these changes:\n${JSON.stringify(changes, null, 2)}`;
    return this.chat(systemPrompt, userMessage);
  }

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
