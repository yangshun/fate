import Stack, { VStack } from '@nkzw/stack';
import { useActionState, useState } from 'react';
import { useFateClient } from 'react-fate';
import { Button } from '../ui/Button.tsx';
import AuthClient from '../user/AuthClient.tsx';
import Card from './Card.tsx';
import H3 from './H3.tsx';
import Input from './Input.tsx';
import { PostView } from './PostCard.tsx';

export default function CreatePost() {
  const fate = useFateClient();
  const { data: session } = AuthClient.useSession();
  const user = session?.user;
  const [contentText, setCommentText] = useState('');
  const [titleText, setTitleText] = useState('');

  const [, createPost, isPending] = useActionState(async () => {
    const content = contentText.trim();
    const title = titleText.trim();

    if (!content || !title || !user) {
      return;
    }

    const result = await fate.mutations.post.add({
      input: { content, title },
      insert: 'before',
      optimistic: {
        author: {
          id: user.id,
          name: user.name,
        },
        comments: [],
        content,
        id: `optimistic:${Date.now().toString(36)}`,
        title,
      },
      view: PostView,
    });

    setCommentText('');

    return result;
  }, null);

  const commentingIsDisabled =
    isPending || titleText.trim().length === 0 || contentText.trim().length === 0;

  return (
    <Card>
      <VStack action={createPost} as="form" gap={16}>
        <H3>Create a Post</H3>
        <Input
          className="w-full"
          disabled={isPending}
          onChange={(event) => setTitleText(event.target.value)}
          placeholder="Post Title"
          value={titleText}
        />
        <textarea
          className="squircle border-input flex min-h-20 w-full border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900/40"
          disabled={isPending}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder={'Share your thoughts about fate...'}
          value={contentText}
        />
        <Stack end gap>
          <Button disabled={commentingIsDisabled} size="sm" type="submit" variant="secondary">
            Post comment
          </Button>
        </Stack>
      </VStack>
    </Card>
  );
}
