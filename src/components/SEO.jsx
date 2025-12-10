import React from 'react';

const SEO = ({ title, description, keywords, name, type }) => {
    React.useEffect(() => {
        document.title = `${title} | Harley Gilpin`;
    }, [title]);

    return (
        <>
            { /* Meta tags - React 19 should hoist these, but if not, they sit in the component tree.
                 For now, we'll keep them here.*/ }
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
        </>
    );
};

export default SEO;
