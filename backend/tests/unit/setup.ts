// test/unit/setup.ts
import { vi } from 'vitest';

// Mock all external config modules
vi.mock('../../src/config/database', () => import('../__mocks__/config/database'));
vi.mock('../../src/config/redis', () => import('../__mocks__/config/redis'));
vi.mock('../../src/config/s3', () => import('../__mocks__/config/s3'));
vi.mock('../../src/config/imagekit', () => import('../__mocks__/config/imagekit'));
vi.mock('@neondatabase/serverless', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue({ query: vi.fn(), release: vi.fn() }),
    query: vi.fn(),
  })),
}));

// Define mocks for utility functions
vi.mock('../../src/utils/deadline', () => ({
  DEFAULT_SUBMISSION_DEADLINE: '2026-09-05T12:00:00+05:30',
  getSubmissionDeadline: vi.fn(() => '2026-09-05T12:00:00+05:30'),
  isDeadlinePassed: vi.fn(() => false),
}));

// Global mock for multer
vi.mock('multer', () => ({
  default: vi.fn().mockReturnValue({
    single: vi.fn().mockReturnValue((req: any, res: any, next: any) => next()),
    array: vi.fn().mockReturnValue((req: any, res: any, next: any) => next()),
  }),
}));