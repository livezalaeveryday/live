import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { FlatList, Text } from 'react-native';
import { FeedScreen } from '../src/screens/FeedScreen';
import { ProfileScreen } from '../src/screens/ProfileScreen';
import { AppProvider } from '../src/context/AppContext';
import { AuthProvider } from '../src/context/AuthContext';

jest.setTimeout(20000);

describe('Infinite Scroll & Automated Pagination (Feed & Profile)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test('FeedScreen renders BounceFlatList with onEndReached and onEndReachedThreshold=0.4', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthProvider>
          <AppProvider>
            <FeedScreen onOpenCreatePost={jest.fn()} onSelectCharacter={jest.fn()} />
          </AppProvider>
        </AuthProvider>
      );
    });

    const flatList = renderer.root.findByType(FlatList);
    expect(flatList).toBeTruthy();
    expect(typeof flatList.props.onEndReached).toBe('function');
    expect(flatList.props.onEndReachedThreshold).toBe(0.4);

    // Verify STRICT RULE: NO manual "โหลดเพิ่มเติม" button exists in the component tree
    const textNodes = renderer.root.findAllByType(Text);
    const hasManualLoadMoreButton = textNodes.some((node: any) => {
      const val = node.props.children;
      return typeof val === 'string' && (val.includes('โหลดเพิ่มเติม') || val.includes('Load More'));
    });
    expect(hasManualLoadMoreButton).toBe(false);
  });

  test('FeedScreen automatically paginates when onEndReached is triggered', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthProvider>
          <AppProvider>
            <FeedScreen onOpenCreatePost={jest.fn()} onSelectCharacter={jest.fn()} />
          </AppProvider>
        </AuthProvider>
      );
    });

    let flatList = renderer.root.findByType(FlatList);
    const initialItemCount = flatList.props.data.length;
    expect(initialItemCount).toBe(4); // PAGE_SIZE = 4

    // Trigger infinite scroll near bottom
    await ReactTestRenderer.act(async () => {
      flatList.props.onEndReached();
    });

    // Advance simulated timer for network pagination
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(700);
    });

    flatList = renderer.root.findByType(FlatList);
    expect(flatList.props.data.length).toBeGreaterThan(initialItemCount);
  });

  test('ProfileScreen renders BounceFlatList with onEndReached for Profile Feed', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthProvider>
          <AppProvider>
            <ProfileScreen onOpenWordFilters={jest.fn()} onOpenBlockedList={jest.fn()} />
          </AppProvider>
        </AuthProvider>
      );
    });

    const flatList = renderer.root.findByType(FlatList);
    expect(flatList).toBeTruthy();
    expect(typeof flatList.props.onEndReached).toBe('function');
    expect(flatList.props.onEndReachedThreshold).toBe(0.4);

    // Verify STRICT RULE: NO manual "โหลดเพิ่มเติม" button exists in the profile screen
    const textNodes = renderer.root.findAllByType(Text);
    const hasManualLoadMoreButton = textNodes.some((node: any) => {
      const val = node.props.children;
      return typeof val === 'string' && (val.includes('โหลดเพิ่มเติม') || val.includes('Load More'));
    });
    expect(hasManualLoadMoreButton).toBe(false);
  });

  test('ProfileScreen automatically paginates profile posts when onEndReached is triggered', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthProvider>
          <AppProvider>
            <ProfileScreen onOpenWordFilters={jest.fn()} onOpenBlockedList={jest.fn()} />
          </AppProvider>
        </AuthProvider>
      );
    });

    let flatList = renderer.root.findByType(FlatList);
    const initialItemCount = flatList.props.data.length;
    expect(initialItemCount).toBe(3); // PROFILE_PAGE_SIZE = 3

    // Trigger infinite scroll near bottom of profile feed
    await ReactTestRenderer.act(async () => {
      flatList.props.onEndReached();
    });

    // Advance simulated timer for network pagination
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(700);
    });

    flatList = renderer.root.findByType(FlatList);
    expect(flatList.props.data.length).toBeGreaterThan(initialItemCount);
  });
});
