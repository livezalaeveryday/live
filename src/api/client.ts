import { Post, Character, User, DirectMessage, DMConversation, WordFilter, BlockedEntity } from '../types';

/**
 * Base API client for Livezala Mobile Application
 * Bridges with the backend service (designed by Back-End engineer in FSD-30)
 * Gracefully switches between live API and mock fallback.
 */

const API_BASE_URL = 'https://livezala.com/api';

class ApiClient {
  private token: string | null = null;
  private useMock: boolean = true; // Defaults to true until server endpoint is live

  setToken(token: string | null) {
    this.token = token;
  }

  setMockMode(enable: boolean) {
    this.useMock = enable;
  }

  async googleMobileLogin(googleIdToken: string): Promise<{ token: string; user: User }> {
    if (this.useMock) {
      return {
        token: 'mock_jwt_session_token_' + Date.now(),
        user: {
          id: 'acc_480797d5b53ac41c9f0c',
          email: 'foolish.max@gmail.com',
          name: 'ไลฟ์สาระ ไปวันๆ',
          avatarUrl: 'https://livezala.com/media/avatar/acc_480797d5b53ac41c9f0c?v=3',
          credits: 1250,
        },
      };
    }

    const res = await fetch(`${API_BASE_URL}/auth/mobile/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: googleIdToken }),
    });
    if (!res.ok) throw new Error('Google Sign-In failed');
    return res.json();
  }

  async getFeed(): Promise<Post[]> {
    if (this.useMock) {
      // Returns from AppContext state
      return [];
    }
    const res = await fetch(`${API_BASE_URL}/app/feed`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.json();
  }

  async createPost(characterId: string, content: string, imageUrl?: string): Promise<Post> {
    if (this.useMock) {
      throw new Error('Managed in AppContext in mock mode');
    }
    const res = await fetch(`${API_BASE_URL}/app/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ characterId, content, imageUrl }),
    });
    return res.json();
  }

  async reportPost(postId: string, reason: string): Promise<{ success: boolean; isHidden: boolean }> {
    if (this.useMock) {
      return { success: true, isHidden: false };
    }
    const res = await fetch(`${API_BASE_URL}/app/posts/${postId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  }
}

export const apiClient = new ApiClient();
