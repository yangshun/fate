import Stack, { VStack } from '@nkzw/stack';
import { ConnectionRef, useListView, useRequest, ViewRef } from 'react-fate';
import { Link } from 'react-router';
import { Button } from '../ui/Button.tsx';
import Card from '../ui/Card.tsx';
import CategoryCard, { CategoryView } from '../ui/CategoryCard.tsx';
import EventCard, { EventView } from '../ui/EventCard.tsx';
import H2 from '../ui/H2.tsx';
import { PostCard, PostView } from '../ui/PostCard.tsx';
import Section from '../ui/Section.tsx';
import UserCard from '../ui/UserCard.tsx';
import AuthClient from '../user/AuthClient.tsx';

const PostConnectionView = {
  args: { first: 3 },
  items: {
    node: PostView,
  },
  pagination: {
    hasNext: true,
  },
} as const;

const PostFeed = ({ posts: postsRef }: { posts: ConnectionRef<'Post'> }) => {
  const [posts, loadNext] = useListView(PostConnectionView, postsRef);

  return posts.length ? (
    <VStack gap={16}>
      <H2 className="pl-5">Latest posts</H2>
      <VStack gap={32}>
        {posts.map(({ node }) => (
          <PostCard key={node.id} post={node} />
        ))}
        {loadNext ? (
          <Stack center>
            <Button onClick={loadNext} variant="ghost">
              Load more posts
            </Button>
          </Stack>
        ) : null}
      </VStack>
    </VStack>
  ) : null;
};

const CategoryFeed = ({ categories }: { categories: Array<ViewRef<'Category'>> }) =>
  categories.length ? (
    <VStack gap={16}>
      <H2 className="pl-5">Explore by theme</H2>
      <VStack gap={24}>
        {categories.map((category) => (
          <CategoryCard category={category} key={category.id} />
        ))}
      </VStack>
    </VStack>
  ) : null;

const EventFeed = ({ events }: { events: Array<ViewRef<'Event'>> }) =>
  events.length ? (
    <VStack gap={16}>
      <H2 className="pl-5">Events</H2>
      <VStack gap={24}>
        {events.map((event) => (
          <EventCard event={event} key={event.id} />
        ))}
      </VStack>
    </VStack>
  ) : null;

const request = {
  categories: {
    root: CategoryView,
    type: 'Category',
  },
  events: {
    root: EventView,
    type: 'Event',
  },
  posts: {
    root: PostConnectionView,
    type: 'Post',
  },
} as const;

export default function HomeRoute() {
  const { data: session } = AuthClient.useSession();
  const user = session?.user;
  const { categories, events, posts } = useRequest(request);

  return (
    <Section gap={32}>
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-stretch">
        <Card className=" border border-white/20 bg-linear-to-r from-blue-500 to-sky-500 dark:from-blue-600 dark:to-sky-600 text-white">
          <VStack className="py-2 lg:py-4 lg:px-2" gap={16}>
            <Stack alignCenter gap={12} wrap>
              <span className="squircle bg-white/20 px-2 py-1 text-xs font-semibold uppercase tracking-widest">
                <span className="lowercase italic">fate</span> demo
              </span>
            </Stack>
            <div className="space-y-3">
              <h1 className="text-balance text-3xl font-semibold leading-tight lg:text-4xl">
                fate is a modern data client for React and tRPC inspired by Relay and GraphQL.
              </h1>
              <p className="text-white/80 text-sm lg:text-base">
                fate combines view composition, normalized caching, data masking, Async React
                features, and tRPC&apos;s type safety.
              </p>
            </div>
            <Stack alignCenter gap={12} wrap>
              {!user && (
                <>
                  <Button asChild size="sm" variant="secondary">
                    <Link className="squircle px-4 py-2 text-sm font-semibold" to="/login">
                      Login
                    </Link>
                  </Button>
                  <span className="text-white/80 text-sm">Sign in to post comments.</span>
                </>
              )}
            </Stack>
          </VStack>
        </Card>
        <UserCard user={user ?? null} />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start" id="feed">
        <PostFeed posts={posts} />
        <VStack gap={24}>
          <CategoryFeed categories={categories} />
          <EventFeed events={events} />
        </VStack>
      </div>
    </Section>
  );
}
