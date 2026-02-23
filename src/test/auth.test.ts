import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire auth module
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    }),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('should handle invalid credentials', async () => {
      const { signInWithEmail } = await import('../lib/auth');
      
      const result = await signInWithEmail('invalid', 'wrong');
      
      // Should return error or null user
      expect(result.error).toBeTruthy();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', async () => {
      const { getCurrentUser } = await import('../lib/auth');
      
      const user = await getCurrentUser();
      
      expect(user).toBeNull();
    });
  });
});
