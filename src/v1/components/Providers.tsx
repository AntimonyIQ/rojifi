'use client';

import { Provider } from 'react-redux';

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={{} as any}>{children}</Provider>;
}