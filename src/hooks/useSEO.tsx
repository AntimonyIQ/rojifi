import SEO from '@/components/SEO';
import { seoConfig, SEOPageKey } from '@/config/seo';

interface UseSEOProps {
    page: SEOPageKey;
    customTitle?: string;
    customDescription?: string;
    customKeywords?: string;
}

export function useSEO({
    page,
    customTitle,
    customDescription,
    customKeywords
}: UseSEOProps) {
    const config = seoConfig[page];

    return (
        <SEO
            title={customTitle || config.title}
            description={customDescription || config.description}
            keywords={customKeywords || config.keywords}
            canonical={config.canonical}
        />
    );
}
