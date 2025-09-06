import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
}

export default function SEO({
    title,
    description,
    keywords = "rojifi, finance, digital finance, financial services",
    canonical,
    ogTitle,
    ogDescription,
    ogImage = "https://www.rojifi.com/og-image.jpg",
    ogType = "website",
    twitterCard = "summary_large_image",
    twitterTitle,
    twitterDescription,
    twitterImage,
}: SEOProps) {
    const fullTitle = `${title} | Rojifi`;
    const siteUrl = "https://www.rojifi.com";

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Canonical URL */}
            {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="Rojifi" />
            {canonical && <meta property="og:url" content={`${siteUrl}${canonical}`} />}

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
            <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
            <meta name="twitter:image" content={twitterImage || ogImage} />

            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="author" content="Rojifi" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Favicon and App Icons */}
            <link rel="icon" type="image/png" href="/favicon.png" />
            <link rel="apple-touch-icon" href="/favicon.png" />

            {/* Language */}
            <html lang="en" />
        </Helmet>
    );
}
