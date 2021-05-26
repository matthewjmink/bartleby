const path = require('path');
const pkgRoot = require('pkg-dir').sync(process.cwd());

const outputRoot = path.join(pkgRoot, 'dist');
const websiteRoot = path.join(pkgRoot, 'src');
const pagesRoot = path.join(websiteRoot, 'pages');
const includesRoot = path.join(websiteRoot, 'includes');

module.exports = {
    pkgRoot,
    outputRoot,
    websiteRoot,
    pagesRoot,
    includesRoot,
};
