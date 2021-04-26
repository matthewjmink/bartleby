require('dotenv').config();
const ui = require('./ui');
const cms = require('./cms');

const pageNameFromSlug = (slug = '') => {
    const lastDash = slug.lastIndexOf('-');
    if (lastDash === -1) return slug;
    return slug.slice(lastDash);
}


module.exports = {
    serve() {
        ui.serve();
    },
    async build() {
        const { pages, snippets } = await ui.build();
        cms.build({
            pages: pages
                .filter(({ data }) => data.snippets)
                .map(({ id, page: { url, slug, }, data }) => ({
                    name: pageNameFromSlug(slug),
                    ...data,
                    url,
                    slug,
                    id,
                })),
            snippets,
        });
    }
}
