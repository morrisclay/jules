import { describe, it, expect, beforeAll, vi } from 'vitest';
// MSW server setup is now handled globally by src/mocks/vitest-setup.ts
import { MyMCP } from './index'; // The class we want to test
import { ZodError } from 'zod';

const DUMMY_API_KEY = 'test_api_key_123';

describe('MyMCP Attio Tools', () => {
  let agent: MyMCP;

  beforeAll(async () => {
    // Initialize the agent and its tools once
    // Mock Env and ExecutionContext as they are not directly used by these tools' logic
    // Ensure Env and ExecutionContext types are compatible if your MyMCP constructor uses them.
    // For Cloudflare Workers, Env is an object, ExecutionContext has specific methods.
    const mockEnv: any = {}; // Replace 'any' with a more specific Env type if available/needed
    const mockCtx: any = { // Replace 'any' with ExecutionContext if available/needed
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    };
    agent = new MyMCP(mockEnv, mockCtx);
    await agent.init(); // This registers the tools
    // Diagnostic logs removed as the issue is now understood
  });

  describe('attio_get_object_definition', () => {
    const toolName = 'attio_get_object_definition';

    it('should successfully retrieve object definition', async () => {
      const params = { attio_api_key: DUMMY_API_KEY, object_slug: 'valid_slug' };
      // Access the callback directly for unit testing
      const result = await (agent.server as any)._registeredTools[toolName].callback(params);
      
      expect(result.content[0].type).toBe('text');
      const expectedData = [{ api_slug: 'name', title: 'Name', type: 'text' }, { api_slug: 'deal_value', title: 'Deal Value', type: 'currency' }];
      expect(JSON.parse((result.content[0] as any).text)).toEqual(expectedData);
    });

    it('should handle errors from the Python API (e.g., 500 status)', async () => {
      const params = { attio_api_key: DUMMY_API_KEY, object_slug: 'error_slug' };
      const result = await (agent.server as any)._registeredTools[toolName].callback(params);

      expect(result.content[0].type).toBe('text');
      expect((result.content[0] as any).text).toContain('Error from Python API');
      expect((result.content[0] as any).text).toContain('Internal server error from mock');
      expect((result.content[0] as any).text).toContain('Status: 500');
    });
    
    it('should handle errors from the Python API (e.g., 404 status for non-existent slug)', async () => {
        const params = { attio_api_key: DUMMY_API_KEY, object_slug: 'nonexistent_slug' };
        const result = await (agent.server as any)._registeredTools[toolName].callback(params);
  
        expect(result.content[0].type).toBe('text');
        expect((result.content[0] as any).text).toContain('Error from Python API');
        expect((result.content[0] as any).text).toContain('Object slug not found by mock');
        expect((result.content[0] as any).text).toContain('Status: 404');
      });

    it('should fail validation for missing API key (Zod schema)', async () => {
      const params = { object_slug: 'valid_slug' }; // Missing attio_api_key
      // For Zod validation tests, we need to simulate how McpServer would call it,
      // which involves schema parsing before the callback.
      // The .execute method (if it existed publicly and did parsing) would be one way.
      // Or, we can test the schema directly.
      // However, the callback itself doesn't do Zod parsing; the MCP server does it before calling the callback.
      // So, to test Zod failure, we should check if McpServer's tool definition handles it.
      // This unit test setup, calling the callback directly, bypasses the McpServer's Zod parsing.
      // Let's assume McpServer's `tool()` registration and internal `execute` path handles Zod.
      // These specific tests will pass because the callback isn't doing the Zod validation.
      // To properly test Zod errors, we'd need to call the internal execution logic of McpServer
      // or trust that the McpServer itself is tested for this.
      // For now, these tests will show as "passing" because the callback doesn't throw ZodError.
      // We'll mark them as needing a different approach or acknowledge this limitation.
      const toolDefinition = (agent.server as any)._registeredTools[toolName];
      expect(() => toolDefinition.inputSchema.parse(params)).toThrow(ZodError);
    });

    it('should fail validation for missing object_slug (Zod schema)', async () => {
      const params = { attio_api_key: DUMMY_API_KEY }; // Missing object_slug
      const toolDefinition = (agent.server as any)._registeredTools[toolName];
      expect(() => toolDefinition.inputSchema.parse(params)).toThrow(ZodError);
    });
    
    it('should handle Python API reporting a missing API key (mocked 400)', async () => {
      // This test assumes the Python API itself could return a 400 if the key was empty/invalid
      // The MSW handler for /get_object_definition is set up to simulate this if no key is passed
      const params = { attio_api_key: '', object_slug: 'valid_slug' }; // API key is empty
      
      // Zod schema .min(1) for attio_api_key will be validated by McpServer before callback.
      // If we call the callback directly, it bypasses this.
      // If we want to test the Python API's response to an empty key, Zod must allow it.
      // Let's assume the callback is called with an empty key (hypothetically).
      const result = await (agent.server as any)._registeredTools[toolName].callback(params);

      expect(result.content[0].type).toBe('text');
      expect((result.content[0] as any).text).toContain('Error from Python API');
      expect((result.content[0] as any).text).toContain('API key is required by mock.');
    });
  });

  describe('attio_assert_deal', () => {
    const toolName = 'attio_assert_deal';

    it('should successfully assert a deal', async () => {
      const params = {
        attio_api_key: DUMMY_API_KEY,
        deal_attributes: { name: 'Test Deal', value: 1000 },
        matching_attribute: 'name',
      };
      const result = await (agent.server as any)._registeredTools[toolName].callback(params);

      expect(result.content[0].type).toBe('text');
      const expectedData = { id: 'record_id_123', object: 'deals', values: params.deal_attributes };
      expect(JSON.parse((result.content[0] as any).text)).toEqual(expectedData);
    });

    it('should handle errors from the Python API (e.g., 500 status)', async () => {
      const params = {
        attio_api_key: DUMMY_API_KEY,
        deal_attributes: { name: 'Test Deal causing error' },
        matching_attribute: 'error_match', // Triggers 500 in mock
      };
      const result = await (agent.server as any)._registeredTools[toolName].callback(params);

      expect(result.content[0].type).toBe('text');
      expect((result.content[0] as any).text).toContain('Error from Python API');
      expect((result.content[0] as any).text).toContain('Internal server error from mock during assert');
      expect((result.content[0] as any).text).toContain('Status: 500');
    });

    it('should fail validation for missing API key (Zod schema)', async () => {
      const params = {
        deal_attributes: { name: 'Test Deal' },
        matching_attribute: 'name',
      };
      const toolDefinition = (agent.server as any)._registeredTools[toolName];
      expect(() => toolDefinition.inputSchema.parse(params)).toThrow(ZodError);
    });

    it('should fail validation for missing deal_attributes (Zod schema)', async () => {
      const params = {
        attio_api_key: DUMMY_API_KEY,
        matching_attribute: 'name',
      };
      const toolDefinition = (agent.server as any)._registeredTools[toolName];
      expect(() => toolDefinition.inputSchema.parse(params)).toThrow(ZodError);
    });
    
    it('should fail validation for missing matching_attribute (Zod schema)', async () => {
        const params = {
          attio_api_key: DUMMY_API_KEY,
          deal_attributes: { name: 'Test Deal' },
        };
        const toolDefinition = (agent.server as any)._registeredTools[toolName];
        expect(() => toolDefinition.inputSchema.parse(params)).toThrow(ZodError);
      });

    it('should handle various deal_attributes data types', async () => {
        const params = {
          attio_api_key: DUMMY_API_KEY,
          deal_attributes: { 
            name: 'Complex Deal', 
            value: 123.45, 
            is_urgent: true, 
            closed_at: null,
            pipeline_id: "pipe_123"
          },
          matching_attribute: 'name',
        };
        const result = await (agent.server as any)._registeredTools[toolName].callback(params);
  
        expect(result.content[0].type).toBe('text');
        const responseData = JSON.parse((result.content[0]as any).text);
        expect(responseData.values).toEqual(params.deal_attributes);
      });

      it('should handle Python API reporting a missing API key (mocked 400)', async () => {
        const params = { 
            attio_api_key: '', // Empty API key
            deal_attributes: { name: 'Test Deal' },
            matching_attribute: 'name'
        };
        // This call bypasses McpServer's Zod validation of attio_api_key.min(1)
        // It directly tests the callback's behavior if it were to receive an empty key.
        const result = await (agent.server as any)._registeredTools[toolName].callback(params);
        expect(result.content[0].type).toBe('text');
        const textContent = (result.content[0] as any).text;
        expect(textContent).toContain('Error from Python API');
        expect(textContent).toContain('API key is required by mock.');
      });

      it('should handle Python API reporting missing deal_attributes (mocked 400)', async () => {
        const params = { 
            attio_api_key: DUMMY_API_KEY, 
            deal_attributes: {}, // Empty, but valid Zod record for the callback
            matching_attribute: 'name'
        };
        // This call bypasses McpServer's Zod validation (if any deeper than type for deal_attributes).
        // It directly tests the callback's behavior.
        // MSW handler for /assert_deal is configured to return error for empty deal_attributes.
        const result = await (agent.server as any)._registeredTools[toolName].callback(params);
        expect(result.content[0].type).toBe('text');
        const textContent = (result.content[0] as any).text;
        expect(textContent).toContain('Error from Python API');
        expect(textContent).toContain('Deal attributes are required by mock.');
        expect(textContent).toContain('Status: 400');
      });
  });
});
