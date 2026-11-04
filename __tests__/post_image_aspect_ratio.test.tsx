import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Image } from 'react-native';
import { PostCard } from '../src/components/PostCard';
import { AppProvider } from '../src/context/AppContext';
import { initialPosts } from '../src/api/mockData';

describe('Post Image Aspect Ratio & Full Display (No Cropping)', () => {
  test('PostCard renders image with resizeMode="contain" and dynamic aspectRatio', async () => {
    // post_102 has horizontal aspect ratio (1.777)
    const horizontalPost = initialPosts.find((p) => p.id === 'post_102')!;
    let renderer: any;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AppProvider>
          <PostCard post={horizontalPost} />
        </AppProvider>
      );
    });

    const images = renderer.root.findAllByType(Image);
    const postImg = images.find(
      (img: any) => img.props.source && img.props.source.uri === horizontalPost.imageUrl
    );
    expect(postImg).toBeTruthy();
    expect(postImg.props.resizeMode).toBe('contain');

    // Style contains dynamic aspect ratio matching the post image
    const flatStyle = Array.isArray(postImg.props.style)
      ? Object.assign({}, ...postImg.props.style)
      : postImg.props.style;
    expect(flatStyle.aspectRatio).toBeCloseTo(1.777, 2);
    // Strict requirement: must NOT have a fixed height
    expect(flatStyle.height).toBeUndefined();
  });

  test('PostCard correctly adapts frame for vertical/portrait images without cropping', async () => {
    // post_104 has portrait aspect ratio (0.75)
    const portraitPost = initialPosts.find((p) => p.id === 'post_104')!;
    let renderer: any;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AppProvider>
          <PostCard post={portraitPost} />
        </AppProvider>
      );
    });

    const images = renderer.root.findAllByType(Image);
    const postImg = images.find(
      (img: any) => img.props.source && img.props.source.uri === portraitPost.imageUrl
    );
    expect(postImg).toBeTruthy();
    expect(postImg.props.resizeMode).toBe('contain');

    const flatStyle = Array.isArray(postImg.props.style)
      ? Object.assign({}, ...postImg.props.style)
      : postImg.props.style;
    expect(flatStyle.aspectRatio).toBeCloseTo(0.75, 2);
    expect(flatStyle.height).toBeUndefined();
  });

  test('PostCard correctly adapts frame for square images without cropping', async () => {
    // post_103 has square aspect ratio (1.0)
    const squarePost = initialPosts.find((p) => p.id === 'post_103')!;
    let renderer: any;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AppProvider>
          <PostCard post={squarePost} />
        </AppProvider>
      );
    });

    const images = renderer.root.findAllByType(Image);
    const postImg = images.find(
      (img: any) => img.props.source && img.props.source.uri === squarePost.imageUrl
    );
    expect(postImg).toBeTruthy();
    expect(postImg.props.resizeMode).toBe('contain');

    const flatStyle = Array.isArray(postImg.props.style)
      ? Object.assign({}, ...postImg.props.style)
      : postImg.props.style;
    expect(flatStyle.aspectRatio).toBe(1.0);
    expect(flatStyle.height).toBeUndefined();
  });

  test('PostCard correctly adapts frame for tall vertical 9:16 images without cropping', async () => {
    // post_106 has tall vertical aspect ratio (0.5625)
    const tallPost = initialPosts.find((p) => p.id === 'post_106')!;
    let renderer: any;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AppProvider>
          <PostCard post={tallPost} />
        </AppProvider>
      );
    });

    const images = renderer.root.findAllByType(Image);
    const postImg = images.find(
      (img: any) => img.props.source && img.props.source.uri === tallPost.imageUrl
    );
    expect(postImg).toBeTruthy();
    expect(postImg.props.resizeMode).toBe('contain');

    const flatStyle = Array.isArray(postImg.props.style)
      ? Object.assign({}, ...postImg.props.style)
      : postImg.props.style;
    expect(flatStyle.aspectRatio).toBeCloseTo(0.5625, 3);
    expect(flatStyle.height).toBeUndefined();
  });
});
