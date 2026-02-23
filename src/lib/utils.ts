// ============================================
// App Utils
// ============================================

// Get the app base URL for invite links
export function getAppBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://dinner.hk';
  }
  
  // Use current host if available
  const { location } = window;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return `http://localhost:${location.port || 3000}`;
  }
  
  return process.env.NEXT_PUBLIC_APP_URL || `https://${location.hostname}`;
}

// Generate invite link
export function getInviteLink(inviteCode: string): string {
  return `${getAppBaseUrl()}/j/${inviteCode}`;
}
