// Escape Markdown so customer-supplied text (names, emails, project details)
// renders literally in Linear instead of as links, images, or formatting.
export function escapeMarkdown(value) {
    return String(value ?? '').replace(/[\\`*_{}[\]()#+\-.!|<>~]/g, '\\$&');
}
