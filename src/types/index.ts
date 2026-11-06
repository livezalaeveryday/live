export interface User {
  id: string;
  email: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  credits: number;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  isFollowerOfMe?: boolean;
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
  isOfficial?: boolean; // @live is official platform character
  isOwner?: boolean; // Owned by current logged-in user

  // Owner presentation model (ตัวละครคือสิ่งที่เจ้าของเลือกมานำเสนอ ใต้บัญชีเจ้าของ)
  ownerId: string;
  ownerName: string;
  ownerHandle?: string;
  ownerAvatarUrl?: string;
  ownerFollowerCount?: number;
  isOwnerFollowing?: boolean;
  isOwnerFollowerOfMe?: boolean;

  // Followers and follow status
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowerOfMe: boolean;

  dna: CharacterDNA;
}

export interface Post {
  id: string;

  // Post author is the OWNER (User) — 'เจ้าของโพสต์ในนามตัวเอง'
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl: string;
  ownerHandle?: string;
  isOfficialOwner?: boolean;

  // Selected character showcased in this post — 'เลือกตัวละครของตัวเองมาโพสต์ลงฟีด เพื่ออวด'
  characterId: string;
  character: Character;

  content: string;
  imageUrl?: string;
  aspectRatio?: number; // สัดส่วนจริงของภาพ (width / height) แสดงเต็มภาพไม่ตัดขอบ
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

export type BuildFlavor = 'direct' | 'play';

