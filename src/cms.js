const { createServer, build } = require('vite');
const vue = require('@vitejs/plugin-vue');
const path = require('path');
const pkgRoot = require('pkg-dir').sync();

const viteConfig = {
    configFile: false,
    root: path.join(__dirname, 'admin'),
    base: '/admin/',
    plugins: [vue()],
    build: { outDir: path.join(pkgRoot, 'dist/admin') },
};

const serveCMS = async () => {
    const server = await createServer(viteConfig);
    await server.listen();
};

const buildCMS = async () => {
    await build(viteConfig);
};

module.exports = {
    serve: serveCMS,
    build: buildCMS,
};
