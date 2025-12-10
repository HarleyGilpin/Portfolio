import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, name, type }) => {
    return (
        <Helmet>
            { /* Standard metadata tags */}
            <title>{title} | Harley Gilpin</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />

            { /* Facebook tags */}
            <meta property="og:type" content={type || 'website'} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />

            { /* Twitter tags */}
            <meta name="twitter:creator" content={name || 'Harley Gilpin'} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};

export default SEO;
