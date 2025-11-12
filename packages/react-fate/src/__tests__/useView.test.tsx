/**
 * @vitest-environment happy-dom
 */

import { createClient, view } from '@nkzw/fate';
import { act, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';
import { FateClient } from '../context.tsx';
import { useView } from '../useView.tsx';

// @ts-expect-error React 🤷‍♂️
global.IS_REACT_ACT_ENVIRONMENT = true;

type User = { __typename: 'User'; id: string; name: string };

type Post = {
  __typename: 'Post';
  author: User | null;
  content: string;
  id: string;
};

test('updates when nested entities change', () => {
  const client = createClient({
    transport: {
      async fetchById() {
        return [];
      },
    },
    types: [
      {
        fields: { author: { type: 'User' } },
        type: 'Post',
      },
      { type: 'User' },
    ],
  });

  const normalizeEntity = (
    client as unknown as {
      normalizeEntity: (
        type: string,
        record: Record<string, unknown>,
        select?: Set<string>,
      ) => string;
    }
  ).normalizeEntity.bind(client);

  const userSelection = new Set(['id', 'name']);
  const postSelection = new Set(['id', 'content', 'author.id', 'author.name']);

  normalizeEntity(
    'User',
    {
      __typename: 'User',
      id: 'user-1',
      name: 'Apple',
    },
    userSelection,
  );

  normalizeEntity(
    'Post',
    {
      __typename: 'Post',
      author: {
        __typename: 'User',
        id: 'user-1',
        name: 'Apple',
      },
      content: 'Hello',
      id: 'post-1',
    },
    postSelection,
  );

  const PostView = view<Post>()({
    author: {
      id: true,
      name: true,
    },
    content: true,
    id: true,
  });

  const postRef = client.ref<Post>('Post', 'post-1', PostView);

  const renders: Array<string | null | undefined> = [];

  const Component = () => {
    const post = useView(PostView, postRef);
    const name = post.author ? post.author.name : null;
    renders.push(name);
    return <span>{name}</span>;
  };

  const container = document.createElement('div');
  const root = createRoot(container);

  act(() => {
    root.render(
      <FateClient client={client}>
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      </FateClient>,
    );
  });

  expect(container.textContent).toBe('Apple');

  act(() => {
    normalizeEntity(
      'User',
      {
        __typename: 'User',
        id: 'user-1',
        name: 'Banana',
      },
      userSelection,
    );
  });

  expect(container.textContent).toBe('Banana');
  expect(renders[0]).toBe('Apple');
  expect(renders.at(-1)).toBe('Banana');
});
