import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadAppState, saveAppState, clearAppState } from '../lib/store';

describe('Store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('loadAppState', () => {
    it('should return default state when localStorage is empty', () => {
      const state = loadAppState();
      
      expect(state.loggedIn).toBe(false);
      expect(state.familyId).toBe(null);
      expect(state.familyName).toBe(null);
      expect(state.userId).toBe(null);
    });

    it('should return stored state from localStorage', () => {
      const mockState = {
        loggedIn: true,
        phone: null,
        email: 'test@example.com',
        userId: 'user_123',
        familyId: 'fam_456',
        familyName: '陳家',
        memberId: 'mem_789',
        displayName: '媽媽',
        isOwner: true,
        role: '媽媽',
      };
      
      localStorage.setItem('dinner_app_state_v1', JSON.stringify(mockState));
      
      const state = loadAppState();
      
      expect(state.loggedIn).toBe(true);
      expect(state.email).toBe('test@example.com');
      expect(state.familyName).toBe('陳家');
    });
  });

  describe('saveAppState', () => {
    it('should save partial state to localStorage', () => {
      const result = saveAppState({ loggedIn: true, email: 'test@example.com' });
      
      expect(result.loggedIn).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should merge with existing state', () => {
      const initialState = {
        loggedIn: true,
        phone: null,
        email: 'old@example.com',
        userId: null,
        familyId: null,
        familyName: null,
        memberId: null,
        displayName: null,
        isOwner: false,
        role: null,
      };
      
      localStorage.setItem('dinner_app_state_v1', JSON.stringify(initialState));
      
      const result = saveAppState({ email: 'new@example.com', familyName: '陳家' });
      
      expect(result.email).toBe('new@example.com');
      expect(result.familyName).toBe('陳家');
      expect(result.loggedIn).toBe(true); // preserved
    });
  });

  describe('clearAppState', () => {
    it('should clear state from localStorage', () => {
      localStorage.setItem('dinner_app_state_v1', JSON.stringify({ loggedIn: true }));
      
      clearAppState();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('dinner_app_state_v1');
    });
  });
});
