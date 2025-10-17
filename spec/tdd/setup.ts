import { vi } from 'vitest';

// 全局 fetch 模拟
const mockFetch = vi.fn();
global.fetch = mockFetch;

// 导出 mock 供测试使用
export { mockFetch };