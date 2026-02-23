import { vi, describe, it, expect, beforeEach } from 'vitest';
import { loadAppState, saveAppState } from '../lib/store';

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
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost', port: '3000' },
        writable: true,
      });
      
      const { getInviteLink } = await import('../lib/utils');
      
      const link = getInviteLink('ABC123');
      
      expect(link).toContain('localhost:3000');
      
      // Restore
      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });
  });
});
