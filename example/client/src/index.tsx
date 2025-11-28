import './App.css';
import Stack from '@nkzw/stack';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { FateClient } from 'react-fate';
import { BrowserRouter, Route, Routes } from 'react-router';
import { fate } from './lib/fate.tsx';
import CategoryRoute from './routes/CategoryRoute.tsx';
import HomeRoute from './routes/HomeRoute.tsx';
import PostRoute from './routes/PostRoute.tsx';
import SearchRoute from './routes/SearchRoute.tsx';
import SignInRoute from './routes/SignInRoute.tsx';
import Card from './ui/Card.tsx';
import Error from './ui/Error.tsx';
import Header from './ui/Header.tsx';
import Section from './ui/Section.tsx';

const App = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="min-h-[calc(100vh-206px)]">
        <Header />
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Section>
              <Card>
                <Error error={error} />
              </Card>
            </Section>
          )}
        >
          <Suspense
            fallback={
              <Section>
                <Stack center className="animate-pulse text-gray-500 italic" verticalPadding={48}>
                  Thinking…
                </Stack>
              </Section>
            }
          >
            <Routes>
              <Route element={<HomeRoute />} path="/" />
              <Route element={<PostRoute />} path="/post/:id" />
              <Route element={<CategoryRoute />} path="/category/:id" />
              <Route element={<SearchRoute />} path="/search" />
              <Route element={<SignInRoute />} path="/login" />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FateClient client={fate}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FateClient>
  </StrictMode>,
);
