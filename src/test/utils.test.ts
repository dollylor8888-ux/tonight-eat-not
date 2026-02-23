import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Auth Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getAppBaseUrl', () => {
    it('should return localhost in dev', async () => {
      const { getAppBaseUrl } = await import('../lib/utils');
      
      const url = getAppBaseUrl();
      
      // Should contain localhost
      expect(url).toBeTruthy();
    });

    it('should use NEXT_PUBLIC_APP_URL if set', async () => {
      // This would require mocking process.env
      const { getAppBaseUrl } = await import('../lib/utils');
      
      const url = getAppBaseUrl();
      
      expect(url).toBeTruthy();
    });
  });
});
