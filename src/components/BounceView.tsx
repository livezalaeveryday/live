import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  ScrollViewProps,
  FlatListProps,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface SwipeBackViewProps {
  onBack: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
}

/**
 * SwipeBackView:
 * ตรวจจับการปัดนิ้วจากขอบซ้ายจอ (Edge Swipe Back) ทั้งบน iOS และ Android
 * เมื่อผู้ใช้ปัดจากขอบซ้าย (pageX <= 50) ไปทางขวา (> 50px หรือ flick)
 * จะสั่ง pop หน้าจอกลับไปหน้าที่แล้วใน stack
 * กดย้อนกลับหรือปัดย้อนที่หน้าย่อยจะไม่หลุดออกจากแอป
 */
export const SwipeBackView: React.FC<SwipeBackViewProps> = ({
  onBack,
  children,
  style,
  enabled = true,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        if (!enabled) return false;
        // เริ่มจากขอบซ้ายจอไม่เกิน 50px และปัดไปทางขวาด้วยมุมแนวนอน
        const isFromLeftEdge = evt.nativeEvent.pageX <= 50;
        const isHorizontalSwipe =
          gestureState.dx > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return isFromLeftEdge && isHorizontalSwipe;
      },
      onPanResponderGrant: () => {
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 60 || gestureState.vx > 0.45) {
          Animated.timing(translateX, {
            toValue: 400,
            duration: 160,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            onBack();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            velocity: gestureState.vx,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={[styles.flex1, style]} {...panResponder.panHandlers}>
      <Animated.View style={[styles.flex1, { transform: [{ translateX }] }]}>
        {children}
      </Animated.View>
    </View>
  );
};

/**
 * BounceScrollView:
 * ScrollView ที่รองรับเอฟเฟกต์เด้งแบบยืดหยุ่น (bounce / overscroll) ทั้งบน Android และ iOS
 * บน iOS ใช้ native UIKit bounces + alwaysBounceVertical
 * บน Android เสริม spring physics pan-responder เมื่อเลื่อนชนขอบบนหรือขอบล่าง
 */
export const BounceScrollView: React.FC<ScrollViewProps> = (props) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const isAtTop = useRef(true);
  const isAtBottom = useRef(false);
  const dragMode = useRef<'top' | 'bottom' | null>(null);
  const layoutHeight = useRef(0);
  const contentHeight = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (Platform.OS !== 'android') return false;
        if (props.horizontal) return false;

        // หากอยู่ที่ขอบบนแล้วลากลง
        if (
          isAtTop.current &&
          gestureState.dy > 6 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2
        ) {
          dragMode.current = 'top';
          return true;
        }
        // หากอยู่ที่ขอบล่างแล้วลากขึ้น
        if (
          isAtBottom.current &&
          gestureState.dy < -6 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2
        ) {
          dragMode.current = 'bottom';
          return true;
        }
        return false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (dragMode.current === 'top') {
          translateY.setValue(Math.max(0, gestureState.dy * 0.42));
        } else if (dragMode.current === 'bottom') {
          translateY.setValue(Math.min(0, gestureState.dy * 0.42));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        dragMode.current = null;
        Animated.spring(translateY, {
          toValue: 0,
          velocity: gestureState.vy,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        dragMode.current = null;
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    layoutHeight.current = layoutMeasurement.height;
    contentHeight.current = contentSize.height;

    isAtTop.current = contentOffset.y <= 1;
    isAtBottom.current =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 2;

    props.onScroll?.(e);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    layoutHeight.current = e.nativeEvent.layout.height;
    checkBounds();
    props.onLayout?.(e);
  };

  const handleContentSizeChange = (w: number, h: number) => {
    contentHeight.current = h;
    checkBounds();
    props.onContentSizeChange?.(w, h);
  };

  const checkBounds = () => {
    if (contentHeight.current <= layoutHeight.current) {
      isAtTop.current = true;
      isAtBottom.current = true;
    }
  };

  return (
    <View style={styles.flex1} {...panResponder.panHandlers}>
      <Animated.View style={[styles.flex1, { transform: [{ translateY }] }]}>
        <ScrollView
          {...props}
          bounces={true}
          alwaysBounceVertical={!props.horizontal}
          alwaysBounceHorizontal={Boolean(props.horizontal)}
          overScrollMode="always"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onLayout={handleLayout}
          onContentSizeChange={handleContentSizeChange}
        />
      </Animated.View>
    </View>
  );
};

/**
 * BounceFlatList:
 * FlatList ที่รองรับเอฟเฟกต์เด้งแบบยืดหยุ่น (bounce / overscroll) ทั้งบน Android และ iOS
 * บน iOS ใช้ native UIKit bounces + alwaysBounceVertical
 * บน Android เสริม spring physics pan-responder เมื่อเลื่อนชนขอบบนหรือขอบล่าง
 */
export function BounceFlatList<T>(props: FlatListProps<T>): React.ReactElement {
  const translateY = useRef(new Animated.Value(0)).current;
  const isAtTop = useRef(true);
  const isAtBottom = useRef(false);
  const dragMode = useRef<'top' | 'bottom' | null>(null);
  const layoutHeight = useRef(0);
  const contentHeight = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (Platform.OS !== 'android') return false;
        if (props.horizontal) return false;

        // หากอยู่ที่ขอบบนแล้วลากลง
        if (
          isAtTop.current &&
          gestureState.dy > 6 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2
        ) {
          dragMode.current = 'top';
          return true;
        }
        // หากอยู่ที่ขอบล่างแล้วลากขึ้น
        if (
          isAtBottom.current &&
          gestureState.dy < -6 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2
        ) {
          dragMode.current = 'bottom';
          return true;
        }
        return false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (dragMode.current === 'top') {
          translateY.setValue(Math.max(0, gestureState.dy * 0.42));
        } else if (dragMode.current === 'bottom') {
          translateY.setValue(Math.min(0, gestureState.dy * 0.42));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        dragMode.current = null;
        Animated.spring(translateY, {
          toValue: 0,
          velocity: gestureState.vy,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        dragMode.current = null;
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    layoutHeight.current = layoutMeasurement.height;
    contentHeight.current = contentSize.height;

    isAtTop.current = contentOffset.y <= 1;
    isAtBottom.current =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 2;

    props.onScroll?.(e);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    layoutHeight.current = e.nativeEvent.layout.height;
    checkBounds();
    props.onLayout?.(e);
  };

  const handleContentSizeChange = (w: number, h: number) => {
    contentHeight.current = h;
    checkBounds();
    props.onContentSizeChange?.(w, h);
  };

  const checkBounds = () => {
    if (contentHeight.current <= layoutHeight.current) {
      isAtTop.current = true;
      isAtBottom.current = true;
    }
  };

  return (
    <View style={styles.flex1} {...panResponder.panHandlers}>
      <Animated.View style={[styles.flex1, { transform: [{ translateY }] }]}>
        <FlatList
          {...props}
          bounces={true}
          alwaysBounceVertical={!props.horizontal}
          alwaysBounceHorizontal={Boolean(props.horizontal)}
          overScrollMode="always"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onLayout={handleLayout}
          onContentSizeChange={handleContentSizeChange}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
