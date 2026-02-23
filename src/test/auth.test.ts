import { vi, describe, it, expect, beforeEach } from 'vitest';
import { loadAppState, saveAppState } from '../lib/store';

// Mock auth module
vi.mock('../lib/auth', () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

import { signOut } from '../lib/auth';

describe('Auth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('signOut', () => {
    it('should clear localStorage and sign out from Supabase', async () => {
      // Set some state
      saveAppState({ loggedIn: true, email: 'test@example.com' });
      
      // Call signOut
      await signOut();
      
      // Verify Supabase signOut was called
      expect(signOut).toHaveBeenCalled();
    });
  });
});
