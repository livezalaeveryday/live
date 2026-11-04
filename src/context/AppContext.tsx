import React, { createContext, useContext, useState } from 'react';
import { Post, Character, WordFilter, BlockedEntity, DMConversation, DirectMessage, BuildFlavor } from '../types';
import { initialCharacters, initialPosts, initialWordFilters, initialBlockedEntities, initialConversations, initialCurrentUser } from '../api/mockData';
import { FlavorConfig, FLAVOR_CONFIGS, DEFAULT_FLAVOR } from '../config/flavor';

interface AppContextType {
  posts: Post[];
  characters: Character[];
  myCharacters: Character[];
  wordFilters: WordFilter[];
  blockedEntities: BlockedEntity[];
  conversations: DMConversation[];
  activeCharacter: Character; // Character identity currently posting
  flavor: BuildFlavor;
  flavorConfig: FlavorConfig;
  setFlavor: (flavor: BuildFlavor) => void;
  setActiveCharacter: (char: Character) => void;
  createPost: (content: string, imageUrl?: string) => void;
  likePost: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;
  blockCharacter: (character: Character) => void;
  unblockEntity: (entityId: string) => void;
  toggleFollow: (characterId: string) => { success: boolean; message?: string };
  addWordFilter: (keyword: string) => void;
  removeWordFilter: (id: string) => void;
  filterText: (text: string) => string;
  getFilteredPosts: () => Post[];
  sendMessage: (receiverId: string, text: string) => boolean;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [wordFilters, setWordFilters] = useState<WordFilter[]>(initialWordFilters);
  const [blockedEntities, setBlockedEntities] = useState<BlockedEntity[]>(initialBlockedEntities);
  const [conversations, setConversations] = useState<DMConversation[]>(initialConversations);
  const [flavor, setFlavor] = useState<BuildFlavor>(DEFAULT_FLAVOR);
  const flavorConfig = FLAVOR_CONFIGS[flavor];

  // Default active character is ท่านยม (User's owned character)
  const myChars = characters.filter((c) => c.isOwner);
  const [activeCharacter, setActiveCharacter] = useState<Character>(myChars[0] || initialCharacters[1]);

  // Word filter engine
  const filterText = (text: string): string => {
    let result = text;
    for (const filter of wordFilters) {
      if (!filter.keyword) continue;
      const regex = new RegExp(filter.keyword, 'gi');
      result = result.replace(regex, '***');
    }
    return result;
  };

  // Follow / Unfollow logic with permanent @live rule
  const toggleFollow = (characterId: string): { success: boolean; message?: string } => {
    const target = characters.find((c) => c.id === characterId);
    if (!target) return { success: false, message: 'ไม่พบตัวละคร' };

    // PERMANENT RULE: @live is locked mutual auto-follow, cannot be unfollowed!
    if (target.isOfficial || target.handle === '@live') {
      return {
        success: false,
        message: 'กฎถาวรระบบ: สมาชิกทุกคนติดตาม @live แบบสองทางโดยอัตโนมัติ และไม่สามารถยกเลิกได้',
      };
    }

    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id === characterId) {
          const nextState = !c.isFollowing;
          return {
            ...c,
            isFollowing: nextState,
            followerCount: nextState ? c.followerCount + 1 : Math.max(0, c.followerCount - 1),
          };
        }
        return c;
      })
    );

    return { success: true };
  };

  // Create post: Owner posts in their own name, showcasing the selected character!
  const createPost = (content: string, imageUrl?: string) => {
    const newPost: Post = {
      id: 'post_' + Date.now(),
      ownerId: initialCurrentUser.id,
      ownerName: initialCurrentUser.name,
      ownerAvatarUrl: initialCurrentUser.avatarUrl || 'https://livezala.com/media/avatar/default',
      ownerHandle: initialCurrentUser.handle || '@foolish_max',
      isOfficialOwner: false,
      characterId: activeCharacter.id,
      character: activeCharacter,
      content,
      imageUrl,
      likeCount: 0,
      commentCount: 0,
      reportCount: 0,
      createdAt: 'เมื่อสักครู่',
    };
    setPosts([newPost, ...posts]);
  };

  const likePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likeCount: isLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1),
          };
        }
        return p;
      })
    );
  };

  // Report logic: Auto-hide if reportCount reaches 10
  const reportPost = (postId: string, _reason: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newReportCount = p.reportCount + 1;
          const isHidden = newReportCount >= 10;
          return {
            ...p,
            reportCount: newReportCount,
            isReportedByMe: true,
            isHidden,
          };
        }
        return p;
      })
    );
  };

  // Block user / character logic
  const blockCharacter = (char: Character) => {
    const newBlock: BlockedEntity = {
      id: 'block_' + Date.now(),
      entityId: char.id,
      entityType: 'character',
      name: char.name,
      avatarUrl: char.avatarUrl,
      blockedAt: new Date().toISOString(),
    };
    setBlockedEntities([...blockedEntities, newBlock]);
  };

  const unblockEntity = (entityId: string) => {
    setBlockedEntities((prev) => prev.filter((b) => b.entityId !== entityId));
  };

  // Add / remove personal word filter
  const addWordFilter = (keyword: string) => {
    if (!keyword.trim()) return;
    const item: WordFilter = {
      id: 'wf_' + Date.now(),
      keyword: keyword.trim(),
      createdAt: new Date().toISOString(),
    };
    setWordFilters([...wordFilters, item]);
  };

  const removeWordFilter = (id: string) => {
    setWordFilters((prev) => prev.filter((w) => w.id !== id));
  };

  // Filtered posts for the feed: excludes blocked entities and auto-hidden posts (>=10 reports)
  const getFilteredPosts = (): Post[] => {
    const blockedIds = new Set(blockedEntities.map((b) => b.entityId));
    return posts.filter((p) => {
      if (p.isHidden || p.reportCount >= 10) return false;
      if (blockedIds.has(p.characterId)) return false;
      return true;
    });
  };

  // Send Direct Message (only allowed if mutual follow)
  const sendMessage = (receiverId: string, text: string): boolean => {
    const receiver = characters.find((c) => c.id === receiverId);
    if (!receiver) return false;

    // Check mutual follow
    if (!receiver.isFollowing || !receiver.isFollowerOfMe) {
      return false;
    }

    const updatedConvs = [...conversations];
    const existingIndex = updatedConvs.findIndex((cv) => cv.characterId === receiverId);

    if (existingIndex >= 0) {
      updatedConvs[existingIndex] = {
        ...updatedConvs[existingIndex],
        lastMessage: text,
        lastMessageTime: 'เมื่อสักครู่',
      };
    } else {
      updatedConvs.unshift({
        characterId: receiverId,
        character: receiver,
        lastMessage: text,
        lastMessageTime: 'เมื่อสักครู่',
        unreadCount: 0,
      });
    }

    setConversations(updatedConvs);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        posts,
        characters,
        myCharacters: myChars,
        wordFilters,
        blockedEntities,
        conversations,
        activeCharacter,
        flavor,
        flavorConfig,
        setFlavor,
        setActiveCharacter,
        createPost,
        likePost,
        reportPost,
        blockCharacter,
        unblockEntity,
        toggleFollow,
        addWordFilter,
        removeWordFilter,
        filterText,
        getFilteredPosts,
        sendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
