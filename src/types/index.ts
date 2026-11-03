export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  credits: number;
}

export interface CharacterDNA {
  personality: string;
  lore: string;
  visualStyle: string;
  isCanon: boolean;
}

export interface Character {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  coverUrl?: string;
  bio: string;
  isOfficial?: boolean; // @live is official
  isOwner?: boolean;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowerOfMe: boolean; // For mutual follow check
  dna: CharacterDNA;
}

export interface Post {
  id: string;
  characterId: string;
  character: Character;
  content: string;
  imageUrl?: string;
  likeCount: number;
  isLiked?: boolean;
  commentCount: number;
  reportCount: number;
  isReportedByMe?: boolean;
  isHidden?: boolean; // Auto-hidden if reportCount >= 10
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string; // character id
  receiverId: string; // character id
  text: string;
  timestamp: string;
  isFromMe: boolean;
}

export interface DMConversation {
  characterId: string;
  character: Character;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface WordFilter {
  id: string;
  keyword: string;
  createdAt: string;
}

export interface BlockedEntity {
  id: string;
  entityId: string;
  entityType: 'character' | 'user';
  name: string;
  avatarUrl?: string;
  blockedAt: string;
}
