import { useUser } from '@auth0/nextjs-auth0/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Main } from '../components/main';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push('organizations');
    }
  }, [router, user]);
  return (
    <>
      <Head>
        <title>NAESB Smart Trade Platform</title>
        <meta name="description" content="NAESB Natural Gas Registry" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!isLoading && !user && <Main />}
    </>
  );
}
