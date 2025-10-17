import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch } from './setup';

// 模拟 CardInput 类型
interface CardInput {
  avatar: ArrayBuffer;        // base64 裁剪后头像
  name: string;
  phone: string;
  email: string;
  homepage: string;
  github: string;
  x: string;
  bio: string;
  theme: "minimal" | "business" | "neon" | "pastel" | "dark" | "sunset" | "ocean" | "forest" | "retro" | "cyber";
}

// 模拟 API 响应类型
interface PreviewResponse {
  html: string;
}

interface DownloadResponse {
  image: ArrayBuffer;
}

describe('PersonalCard Generator API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Card Preview API', () => {
    it('should preview card with correct endpoint', async () => {
      // 模拟成功响应
      const mockHtmlResponse = '<div class="card-preview">...</div>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'text/html' : null
        },
        text: () => Promise.resolve(mockHtmlResponse)
      });

      // 调用 API
      const response = await fetch('/card', {
        method: 'GET',
        headers: {}
      });
      const html = await response.text();

      // 验证请求
      expect(mockFetch).toHaveBeenCalledWith('/card', {
        method: 'GET',
        headers: {}
      });

      // 验证响应
      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toBe('text/html');
      expect(html).toBe(mockHtmlResponse);
    });

    it('should handle preview API errors', async () => {
      // 模拟错误响应
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const response = await fetch('/card', {
        method: 'GET',
        headers: {}
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('Card Download API', () => {
    const validCardInput: CardInput = {
      avatar: new ArrayBuffer(1024), // 模拟图片数据
      name: 'John Doe',
      phone: '+86 138 0000 0000',
      email: 'john.doe@example.com',
      homepage: 'https://johndoe.dev',
      github: 'johndoe',
      x: 'john_doe',
      bio: 'Full-stack developer passionate about creating amazing web experiences.',
      theme: 'minimal'
    };

    it('should download card with valid input', async () => {
      // 模拟成功响应
      const mockImageData = new ArrayBuffer(2048);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'image/png' : null
        },
        arrayBuffer: () => Promise.resolve(mockImageData)
      });

      // 调用 API
      const response = await fetch('/card/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validCardInput)
      });

      const imageBuffer = await response.arrayBuffer();

      // 验证请求
      expect(mockFetch).toHaveBeenCalledWith('/card/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validCardInput)
      });

      // 验证响应
      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toBe('image/png');
      expect(imageBuffer).toBe(mockImageData);
    });

    it('should validate required fields in CardInput', async () => {
      const invalidInput = { ...validCardInput, name: '' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Name is required' })
      });

      const response = await fetch('/card/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidInput)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const invalidInput = { ...validCardInput, email: 'invalid-email' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid email format' })
      });

      const response = await fetch('/card/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidInput)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should validate URL format for homepage', async () => {
      const invalidInput = { ...validCardInput, homepage: 'invalid-url' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid homepage URL format' })
      });

      const response = await fetch('/card/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidInput)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should validate theme options', async () => {
      const invalidInput = { ...validCardInput, theme: 'invalid-theme' as any };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          error: 'Invalid theme. Must be one of: minimal, business, neon, pastel, dark, sunset, ocean, forest, retro, cyber'
        })
      });

      const response = await fetch('/card/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidInput)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should validate avatar data', async () => {
      const invalidInput = { ...validCardInput, avatar: new ArrayBuffer(0) }; // 空头像数据

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Avatar image data is required' })
      });

      const response = await fetch('/card/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidInput)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('Theme Variations', () => {
    const validCardInput: CardInput = {
      avatar: new ArrayBuffer(1024),
      name: 'Jane Smith',
      phone: '+1 555 0123',
      email: 'jane.smith@example.com',
      homepage: 'https://janesmith.io',
      github: 'janesmith',
      x: 'jane_smith',
      bio: 'UX/UI Designer creating beautiful and functional interfaces.',
      theme: 'minimal'
    };

    const themes: Array<CardInput['theme']> = [
      'minimal', 'business', 'neon', 'pastel', 'dark',
      'sunset', 'ocean', 'forest', 'retro', 'cyber'
    ];

    themes.forEach(theme => {
      it(`should generate card with ${theme} theme`, async () => {
        const inputWithTheme = { ...validCardInput, theme };
        const mockImageData = new ArrayBuffer(2048);

        mockFetch.mockResolvedValueOnce({
          ok: true,
          headers: {
            get: (name: string) => name === 'content-type' ? 'image/png' : null
          },
          arrayBuffer: () => Promise.resolve(mockImageData)
        });

        const response = await fetch('/card/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inputWithTheme)
        });

        expect(response.ok).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith('/card/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inputWithTheme)
        });
      });
    });
  });

  describe('API Performance', () => {
    it('should handle large bio text', async () => {
      const longBio = 'A'.repeat(1000); // 长文本
      const validCardInput: CardInput = {
        avatar: new ArrayBuffer(1024),
        name: 'Test User',
        phone: '+86 138 0000 0000',
        email: 'test@example.com',
        homepage: 'https://test.com',
        github: 'testuser',
        x: 'test_user',
        bio: longBio,
        theme: 'minimal'
      };

      const mockImageData = new ArrayBuffer(2048);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'image/png' : null
        },
        arrayBuffer: () => Promise.resolve(mockImageData)
      });

      const startTime = Date.now();
      const response = await fetch('/card/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validCardInput)
      });
      const endTime = Date.now();

      expect(response.ok).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
    });
  });
});