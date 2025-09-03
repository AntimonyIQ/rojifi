// app/layout.tsx
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { Providers } from '@/components/Providers';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';

const figtree = Figtree({ subsets: ['latin'], display: 'swap', variable: '--font-figtree' });

export const metadata: Metadata = {
    title: 'Rojifi - Breaking Barriers in Cross-Border Transactions',
    description: 'Empower your business to pay and collect local and international currencies across 80+ countries worldwide with our advanced financial services.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.png" type="image/svg+xml" />
                <Script
                    id="microsoft-clarity"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","sux79h5ejj");`,
                    }}
                />
            </head>
            <body className={`${figtree.variable} font-sans`}>
                <Providers>
                    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
                        {children}
                        <Toaster richColors position="top-right" />
                    </ThemeProvider>
                </Providers>
                <Analytics />
            </body>
        </html>
    );
}
