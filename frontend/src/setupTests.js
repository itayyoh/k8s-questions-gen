// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock axios globally for all tests
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
  })),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => 'ChevronDown',
  ChevronRight: () => 'ChevronRight', 
  RefreshCw: () => 'RefreshCw',
  BookOpen: () => 'BookOpen',
  Target: () => 'Target',
  CheckCircle: () => 'CheckCircle',
  XCircle: () => 'XCircle',
}));