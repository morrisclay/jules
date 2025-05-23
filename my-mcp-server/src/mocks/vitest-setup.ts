// src/mocks/vitest-setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './server'; // MSW server instance

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
