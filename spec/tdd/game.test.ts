import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch } from './setup';

// 新增数据类型定义
interface CardResponse {
  html: string;
  layout: CardLayout;
}

interface CardLayout {
  type: "horizontal-compact";
  sections: CardSections;
}

interface CardSections {
  header: HeaderSection;
  content: ContentSection;
  footer: FooterSection;
}

interface HeaderSection {
  avatar: {
    position: "left";
    size: "small" | "medium" | "large";
  };
  contacts: {
    name: string;
    phone?: string;
    email?: string;
    homepage?: string;
    arrangement: "vertical";
  };
}

interface ContentSection {
  bio: string;
  alignment: "left" | "center" | "right";
  maxLines?: number;
}

interface FooterSection {
  socialLinks: SocialLink[];
  arrangement: "horizontal";
  spacing: "small" | "medium" | "large";
}

interface SocialLink {
  platform: "github" | "x" | "linkedin" | "website";
  url: string;
  username: string;
}

describe('PersonalCard Generator Compact Layout API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Compact Preview API', () => {
    it('should preview compact card with correct endpoint', async () => {
      // 模拟成功响应
      const mockCardResponse: CardResponse = {
        html: '<div class="card-compact">...</div>',
        layout: {
          type: "horizontal-compact",
          sections: {
            header: {
              avatar: {
                position: "left",
                size: "medium"
              },
              contacts: {
                name: "John Doe",
                phone: "+86 138 0000 0000",
                email: "john@example.com",
                arrangement: "vertical"
              }
            },
            content: {
              bio: "Software Developer",
              alignment: "left"
            },
            footer: {
              socialLinks: [
                {
                  platform: "github",
                  url: "https://github.com/johndoe",
                  username: "johndoe"
                }
              ],
              arrangement: "horizontal",
              spacing: "medium"
            }
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        },
        json: () => Promise.resolve(mockCardResponse)
      });

      // 调用 API
      const response = await fetch('/card/preview/compact', {
        method: 'GET',
        headers: {}
      });
      const data = await response.json();

      // 验证请求
      expect(mockFetch).toHaveBeenCalledWith('/card/preview/compact', {
        method: 'GET',
        headers: {}
      });

      // 验证响应
      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(data).toEqual(mockCardResponse);
    });

    it('should handle compact preview API errors', async () => {
      // 模拟错误响应
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const response = await fetch('/card/preview/compact', {
        method: 'GET',
        headers: {}
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    it('should validate compact preview response structure', async () => {
      // 模拟不完整的响应
      const invalidResponse = {
        html: '<div>incomplete</div>'
        // 缺少 layout 字段
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        },
        json: () => Promise.resolve(invalidResponse)
      });

      const response = await fetch('/card/preview/compact', {
        method: 'GET',
        headers: {}
      });
      const data = await response.json();

      // 验证响应结构不完整
      expect(data.layout).toBeUndefined();
    });
  });

  describe('Compact Download API', () => {
    const validCardInput = {
      avatar: new ArrayBuffer(1024),
      name: 'Jane Smith',
      phone: '+1 555 0123',
      email: 'jane@example.com',
      homepage: 'https://janesmith.io',
      github: 'janesmith',
      x: 'jane_smith',
      bio: 'UX Designer',
      theme: 'minimal'
    };

    it('should download compact card with valid input', async () => {
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
      const response = await fetch('/card/download/compact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validCardInput)
      });

      const imageBuffer = await response.arrayBuffer();

      // 验证请求
      expect(mockFetch).toHaveBeenCalledWith('/card/download/compact', {
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

    it('should handle compact download API validation errors', async () => {
      const invalidInput = { ...validCardInput, name: '' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Name is required for compact layout' })
      });

      const response = await fetch('/card/download/compact', {
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

  describe('Card Layout Models Validation', () => {
    it('should validate horizontal-compact layout type', async () => {
      const mockResponse = {
        html: '<div>compact card</div>',
        layout: {
          type: 'horizontal-compact',
          sections: {
            header: {
              avatar: { position: 'left', size: 'medium' },
              contacts: { name: 'Test User', arrangement: 'vertical' }
            },
            content: { bio: 'Test bio', alignment: 'left' },
            footer: { socialLinks: [], arrangement: 'horizontal', spacing: 'medium' }
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      });

      const response = await fetch('/card/preview/compact', {
        method: 'GET',
        headers: {}
      });
      const data = await response.json();

      expect(data.layout.type).toBe('horizontal-compact');
    });

    it('should validate header section structure', async () => {
      const mockResponse = {
        html: '<div>header test</div>',
        layout: {
          type: 'horizontal-compact',
          sections: {
            header: {
              avatar: {
                position: 'left',
                size: 'large'
              },
              contacts: {
                name: 'Test Name',
                phone: '+1234567890',
                email: 'test@example.com',
                arrangement: 'vertical'
              }
            },
            content: { bio: 'Test', alignment: 'center' },
            footer: { socialLinks: [], arrangement: 'horizontal', spacing: 'small' }
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      });

      const response = await fetch('/card/preview/compact', {
        method: 'GET',
        headers: {}
      });
      const data = await response.json();

      expect(data.layout.sections.header.avatar.position).toBe('left');
      expect(data.layout.sections.header.avatar.size).toBe('large');
      expect(data.layout.sections.header.contacts.arrangement).toBe('vertical');
    });

    it('should validate social links structure', async () => {
      const mockResponse = {
        html: '<div>social test</div>',
        layout: {
          type: 'horizontal-compact',
          sections: {
            header: {
              avatar: { position: 'left', size: 'medium' },
              contacts: { name: 'Test', arrangement: 'vertical' }
            },
            content: { bio: 'Test', alignment: 'left' },
            footer: {
              socialLinks: [
                {
                  platform: 'github',
                  url: 'https://github.com/test',
                  username: 'testuser'
                },
                {
                  platform: 'x',
                  url: 'https://twitter.com/test',
                  username: 'testx'
                }
              ],
              arrangement: 'horizontal',
              spacing: 'large'
            }
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      });

      const response = await fetch('/card/preview/compact', {
        method: 'GET',
        headers: {}
      });
      const data = await response.json();

      expect(data.layout.sections.footer.socialLinks).toHaveLength(2);
      expect(data.layout.sections.footer.socialLinks[0].platform).toBe('github');
      expect(data.layout.sections.footer.socialLinks[1].platform).toBe('x');
    });
  });

  describe('Avatar Size Validation', () => {
    const avatarSizes: Array<"small" | "medium" | "large"> = ["small", "medium", "large"];

    avatarSizes.forEach(size => {
      it(`should support ${size} avatar size in compact layout`, async () => {
        const mockResponse = {
          html: `<div>avatar size ${size}</div>`,
          layout: {
            type: 'horizontal-compact',
            sections: {
              header: {
                avatar: { position: 'left', size: size },
                contacts: { name: 'Test', arrangement: 'vertical' }
              },
              content: { bio: 'Test', alignment: 'left' },
              footer: { socialLinks: [], arrangement: 'horizontal', spacing: 'medium' }
            }
          }
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve(mockResponse)
        });

        const response = await fetch('/card/preview/compact', {
          method: 'GET',
          headers: {}
        });
        const data = await response.json();

        expect(data.layout.sections.header.avatar.size).toBe(size);
      });
    });
  });

  describe('Content Alignment Validation', () => {
    const alignments: Array<"left" | "center" | "right"> = ["left", "center", "right"];

    alignments.forEach(alignment => {
      it(`should support ${alignment} text alignment in compact layout`, async () => {
        const mockResponse = {
          html: `<div>alignment ${alignment}</div>`,
          layout: {
            type: 'horizontal-compact',
            sections: {
              header: {
                avatar: { position: 'left', size: 'medium' },
                contacts: { name: 'Test', arrangement: 'vertical' }
              },
              content: {
                bio: `Test bio with ${alignment} alignment`,
                alignment: alignment,
                maxLines: 3
              },
              footer: { socialLinks: [], arrangement: 'horizontal', spacing: 'medium' }
            }
          }
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve(mockResponse)
        });

        const response = await fetch('/card/preview/compact', {
          method: 'GET',
          headers: {}
        });
        const data = await response.json();

        expect(data.layout.sections.content.alignment).toBe(alignment);
      });
    });
  });
});