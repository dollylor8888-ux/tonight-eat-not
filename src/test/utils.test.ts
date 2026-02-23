import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Utils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getInviteLink', () => {
    it('should generate invite link with code', async () => {
      const { getInviteLink } = await import('../lib/utils');
      
      const link = getInviteLink('ABC123');
      
      expect(link).toContain('/j/ABC123');
    });

    it('should use different base URL in dev', async () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost', port: '3000' },
        writable: true,
      });
      
      const { getInviteLink } = await import('../lib/utils');
      
      const link = getInviteLink('ABC123');
      
      expect(link).toContain('localhost');
      
      Object.defineProperty(window, 'location', { value: {}, writable: true });
    });

    it('should handle empty code', async () => {
      const { getInviteLink } = await import('../lib/utils');
      
      const link = getInviteLink('');
      
      expect(link).toBe('/j/');
    });
  });

  describe('getAppBaseUrl', () => {
    it('should return a valid URL', async () => {
      const { getAppBaseUrl } = await import('../lib/utils');
      
      const url = getAppBaseUrl();
      
      expect(url).toBeTruthy();
      expect(url.startsWith('http')).toBe(true);
    });
  });
});
