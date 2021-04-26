const { createServer, build } = require('vite');
const vue = require('@vitejs/plugin-vue');
const path = require('path');
const { ensureFileSync } = require('fs-extra');
const { writeFileSync } = require('fs');
const pkgRoot = require('pkg-dir').sync();

const viteConfig = {
    configFile: false,
    root: path.join(__dirname, 'admin'),
    base: '/admin/',
    plugins: [vue()],
    build: { outDir: path.join(pkgRoot, 'dist/admin') },
};

const injectWebsiteData = (websiteData) => {
    const dataFilePath = path.resolve(__dirname, './admin/src/data.js');
    ensureFileSync(dataFilePath);
    writeFileSync(dataFilePath, `export default ${JSON.stringify(websiteData, null, '    ')}`);
};

const serveCMS = async (websiteData) => {
    const server = await createServer(viteConfig);
    await server.listen();
};

const buildCMS = async (websiteData) => {
    injectWebsiteData(websiteData);
    await build(viteConfig);
};

module.exports = {
    serve: serveCMS,
    build: buildCMS,
};
