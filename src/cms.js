const { createServer, build } = require('vite');
const vue = require('@vitejs/plugin-vue');
const path = require('path');
const { saveFile } = require('./file-service');
const { outputRoot } = require('./utils');

const adminRoot = path.join(__dirname, 'admin');

// TODO: Add ability to customize the CMS branding (logo, name, colors, etc)
const getViteConfig = (buildData, write = true) => ({
    configFile: false,
    root: adminRoot,
    base: '/admin/',
    plugins: [vue()],
    build: {
        write,
        outDir: path.join(outputRoot, 'admin')
    },
    define: { buildData: JSON.stringify(buildData) }
});

const serveCMS = async (websiteData) => {
    const server = await createServer(getViteConfig(websiteData));
    await server.listen();
};

const buildCMS = async (websiteData) => {
    const buildResult = await build(getViteConfig(websiteData));
    await Promise.all(buildResult.output.map(({ fileName, type, source, code = source }) => saveFile(path.join('admin', fileName), code)));
};

module.exports = {
    serve: serveCMS,
    build: buildCMS,
};
