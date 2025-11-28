import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router';
import Stack, { VStack } from '@nkzw/stack';
import { Button } from '../ui/Button.tsx';
import Card from '../ui/Card.tsx';
import H3 from '../ui/H3.tsx';
import Input from '../ui/Input.tsx';
import AuthClient from './AuthClient.tsx';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { data: session } = AuthClient.useSession();

  const signIn = async (event: FormEvent) => {
    event.preventDefault();

    await AuthClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: () => {},
        onRequest: () => {},
        onSuccess: () => {},
      },
    );
  };

  if (session) {
    return <Navigate replace to="/" />;
  }

  return (
    <>
      <H3>Sign In</H3>
      <Card>
        <Stack gap vertical>
          <VStack as="form" gap={12} onSubmit={signIn}>
            <Input
              className="w-48"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              type="email"
              value={email}
            />
            <Input
              className="w-48"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              type="password"
              value={password}
            />
            <div>
              <Button type="submit" variant="outline">
                Sign In
              </Button>
            </div>
          </VStack>
        </Stack>
      </Card>
    </>
  );
}
