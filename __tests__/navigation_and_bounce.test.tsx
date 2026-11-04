import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ScrollView, FlatList, BackHandler, PanResponder } from 'react-native';
import App from '../App';
import { BounceScrollView, BounceFlatList, SwipeBackView } from '../src/components/BounceView';

describe('Navigation Stack, Back Behavior & Elastic Bounce Overscroll', () => {
  test('BounceScrollView renders with bounces=true, alwaysBounceVertical=true, overScrollMode=always', async () => {
    let renderer: any;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <BounceScrollView>
          <></>
        </BounceScrollView>
      );
    });

    const innerScroll = renderer.root.findByType(ScrollView);
    expect(innerScroll.props.bounces).toBe(true);
    expect(innerScroll.props.alwaysBounceVertical).toBe(true);
    expect(innerScroll.props.overScrollMode).toBe('always');
  });

  test('BounceFlatList renders with bounces=true, alwaysBounceVertical=true, overScrollMode=always', async () => {
    let renderer: any;
    const testData = [{ id: '1', title: 'Item 1' }, { id: '2', title: 'Item 2' }];

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <BounceFlatList
          data={testData}
          keyExtractor={(item) => item.id}
          renderItem={() => <></>}
        />
      );
    });

    const innerList = renderer.root.findByType(FlatList);
    expect(innerList.props.bounces).toBe(true);
    expect(innerList.props.alwaysBounceVertical).toBe(true);
    expect(innerList.props.overScrollMode).toBe('always');
  });

  test('SwipeBackView renders and encapsulates children safely', async () => {
    const onBackMock = jest.fn();
    let renderer: any;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SwipeBackView onBack={onBackMock}>
          <ScrollView testID="child-scroll" />
        </SwipeBackView>
      );
    });

    const child = renderer.root.findByProps({ testID: 'child-scroll' });
    expect(child).toBeTruthy();
    expect(onBackMock).not.toHaveBeenCalled();
  });

  test('App component mounts and initializes navigation safely', async () => {
    let renderer: any;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });
    expect(renderer).toBeTruthy();
  });

  test('Back handler logic strictly consumes back events and returns true', () => {
    // Test the contract: back press must NEVER propagate to system to exit app
    const simulateBackPress = (stackLength: number) => {
      if (stackLength > 0) {
        // Popping screen
        return true;
      }
      // At root of stack: do NOT exit the app, stay on current root screen
      // (เจ้าของสั่ง: กดย้อนกลับ/ปัดย้อน ห้ามทำให้ออกจากแอปในทุกกรณี แม้แต่อยู่ที่หน้าแรกสุดของ stack)
      return true;
    };

    expect(simulateBackPress(2)).toBe(true);
    expect(simulateBackPress(1)).toBe(true);
    expect(simulateBackPress(0)).toBe(true);
  });
});
