import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description = "Bankey is the gamified financial literacy platform for Gen Z. Level up your money skills, track expenses, and earn real rewards.",
    name = "Bankey",
    type = "website",
    image = "https://your-domain.com/og-image.png", // TODO: meaningful default image
    url = window.location.href
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title} | Bankey</title>
            <meta name='description' content={description} />

            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            {/* End Twitter tags */}
        </Helmet>
    );
};
