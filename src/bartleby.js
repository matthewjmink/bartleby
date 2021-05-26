require('dotenv').config();
const ui = require('./ui');
const cms = require('./cms');

const capitalize = (str = '') => (str.length <= 1) ? str.toUpperCase() : `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`;
const slugToTitle = (str = '') => str.split('-').map(capitalize).join(' ');

const pageNameFromUrl = (url = '') => {
    const lastSlash = url.lastIndexOf('/');
    if (url === '/') return 'Home';
    if (lastSlash === -1) return slugToTitle(url);
    return slugToTitle(url.slice(lastSlash + 1));
}

const mapBuildDataForCMS = ({ pages, snippets }) => ({
    pages: pages.map(({ id, page: { url, slug, }, data }) => ({
        name: pageNameFromUrl(url),
        ...data,
        url,
        slug,
        id,
    })),
    snippets,
});

module.exports = {
    serve() {
        ui.serve();
    },
    async build() {
        cms.build(mapBuildDataForCMS(await ui.build()));
    },
    async serveAdmin() {
        cms.serve(mapBuildDataForCMS(await ui.build()));
    },
}
