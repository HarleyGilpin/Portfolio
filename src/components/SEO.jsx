import React from 'react';
// import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, type = 'website' }) => {
    const siteTitle = 'Harley Gilpin | Portfolio';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    React.useEffect(() => {
        document.title = fullTitle;

        const updateMeta = (name, content) => {
            let element = document.querySelector(`meta[name="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('name', name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        const updateOgMeta = (property, content) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('property', property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        if (description) {
            updateMeta('description', description);
            updateOgMeta('og:description', description);
        }
        updateOgMeta('og:title', fullTitle);
        updateOgMeta('og:type', type);

    }, [fullTitle, description, type]);

    return null;
};

export default SEO;
