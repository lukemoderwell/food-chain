import '../styles/globals.css';
import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';
import type { AppProps } from 'next/app';
import type { Database } from '../types/supabase';

export default function App({ Component, pageProps }: AppProps) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return <Component {...pageProps} supabase={supabase} />;
} 