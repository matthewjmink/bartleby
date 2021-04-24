const matter = require('gray-matter');
const nunjucks = require('nunjucks');
const addCustomTag = require('./customTag');
const path = require('path');
const glob = require('glob').sync;
const bs = require('browser-sync').create();
const fs = require('fs-extra');
const rollup = require('rollup');
const rollupReplace = require('@rollup/plugin-replace');
const { createFilter } = require('@rollup/pluginutils');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { getSnippets } = require('./db');
const pkgRoot = require('pkg-dir').sync();

const projectConfigPath = path.join(pkgRoot, 'bartleby.config.js');
const projectConfig = fs.existsSync(projectConfigPath) ? require(projectConfigPath) : {};

const websiteRoot = path.join(pkgRoot, 'src');
const pagesRoot = path.join(websiteRoot, 'pages');
const includesRoot = path.join(websiteRoot, 'includes');
const outputRoot = path.join(pkgRoot, 'dist');

const globalData = glob(path.join(pagesRoot, '_data', '*.js')).reduce((mapped, file) => ({
    ...mapped,
    [path.parse(file).name]: require(file),
}), {});

const snippetKeys = new Set();
const snippetsByKey = new Map();

const getPagePathMeta = (inputPath) => {
    const { dir, name } = path.parse(inputPath.replace(path.join(pagesRoot, '/'), ''));
    const parentDir = path.basename(dir);
    const url = (name !== 'index' && name !== parentDir)
        ? path.join(path.sep, dir, name)
        : path.join(path.sep, dir);
    const outputPath = path.join(outputRoot, url, 'index.html');
    const slug = url.slice(1).replace(/\s/g, '').split(path.sep).join('-') || 'home';
    const jsInputPath = (jsPath => (fs.existsSync(jsPath) ? jsPath : undefined))(path.join(pagesRoot, dir, `${name}.js`));
    const js = jsInputPath ? path.join(url, `${slug.split('-').pop()}.js`) : undefined;
    const jsOutputPath = jsInputPath ? path.join(outputRoot, js) : undefined;

    return {
        inputPath,
        outputPath,
        url,
        slug,
        js,
        jsInputPath,
        jsOutputPath,
    };
};

const registerSnippets = (keys = []) => {
    keys.forEach((key) => {
        snippetKeys.add(key);
    });
};

const createPageFromPath = (inputPath) => {
    const { content: template, data } = matter(fs.readFileSync(inputPath, 'utf-8'));
    const page = getPagePathMeta(inputPath);
    const id = page.slug
        .split('-')
        .map((part, i) => (i === 0) ? part : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
        .join('');

    registerSnippets(data.snippets);

    return {
        id,
        page,
        template,
        data,
    };
};

const pages = glob(path.join(pagesRoot, '**/*.html')).map(createPageFromPath);
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader([includesRoot, path.join(websiteRoot, 'assets')]));
const customTags = {
    ...projectConfig.customTags,
    pageClass() {
        const { url, slug } = this;
        return (url === '/') ? 'page-home' : `page-${slug}`;
    },
    snippet(snippetKey) {
        const snippet = snippetsByKey.get(snippetKey)
        if (!snippetsByKey.has(snippetKey)) {
            console.error(`Invalid snippet key "${snippetKey}". Make sure you register your snippet in the page front matter.`);
        }
        return snippet;
    },
};
const hooks = {
    beforeBuild() { },
    afterCompilePages() { },
    afterBuildPages() { },
    afterBuild() { },
    ...projectConfig.hooks,
};

Object
    .keys(customTags)
    .forEach((tagName) => {
        addCustomTag(env, tagName, customTags[tagName]);
    });

const compilePages = () => {
    pages.forEach((pageObj) => {
        const { template, data, page } = pageObj;
        const compiledTemplate = env.renderString(template, {
            ...globalData,
            ...data,
            page,
        });
        pageObj.compiledTemplate = compiledTemplate;
    });
};

const buildPages = () => {
    pages.forEach(({ page, data: pageData, compiledTemplate }) => {
        const { layout = 'layout' } = pageData;
        const compiledPage = env.render(`${layout}.html`, {
            ...globalData,
            ...pageData,
            page,
            content: compiledTemplate,
        });
        fs.ensureFileSync(page.outputPath);
        fs.writeFileSync(page.outputPath, compiledPage);
    });
};

const buildJs = async () => {
    const pageJs = glob(path.join(pagesRoot, '**/*.js'), { ignore: path.join(pagesRoot, '_data/*') })
        .reduce((mapped, jsPath) => {
            const { slug } = getPagePathMeta(jsPath);
            mapped[slug] = jsPath;
            return mapped;
        }, {});
    const routerPages = pages
        .filter(({ data }) => !data.routerExclude)
        .map(({ id, data, compiledTemplate, page: { outputPath, slug, url } }) => ({
            id,
            url,
            data,
            compiledTemplate,
            slug,
            outputPath,
            js: pageJs[slug],
        }));
    const routerPagesWithJs = routerPages.filter(({ js }) => !!js);
    const routerImports = routerPagesWithJs.reduce((imports, { id, js }) => `${imports}import ${id}Component from '${js}';\n`, '');
    const routerRoutes = JSON.stringify(routerPages.map(({ id, slug, url, js, data, compiledTemplate }) => ({
        slug,
        path: url,
        template: compiledTemplate,
        component: !js ? undefined : `ROUTER_COMPONENT:${id}Component`,
        meta: {
            title: `${data.title || globalData.seo.defaultTitle}${globalData.seo.baseTitle}`,
            description: data.description || globalData.seo.defaultDescription,
        }
    }))).replace(/"ROUTER_COMPONENT:([^"]*)"/g, '$1');
    const rollupRouterJsFilter = createFilter(routerPagesWithJs.map(({ js }) => js));

    const bundle = await rollup.rollup({
        input: path.join(websiteRoot, 'main.js'),
        plugins: [
            nodeResolve(),
            rollupReplace({
                'process.env.BARTLEBY_ROUTE_IMPORTS': routerImports,
                'process.env.BARTLEBY_ROUTES': routerRoutes,
            }),
            {
                transform(code, id) {
                    if (!rollupRouterJsFilter(id)) return;
                    return { code: `export default () => {\n${code}\n}` };
                }
            }
        ],
    });

    await bundle.write({
        format: 'iife',
        file: path.join(outputRoot, 'main.js')
    });

    // TODO: Use Promise.all() to build these concurrently
    routerPagesWithJs.forEach(async ({ outputPath, slug, js }) => {
        const bundle = await rollup.rollup({ input: js });

        await bundle.write({
            format: 'iife',
            file: path.join(path.dirname(outputPath), `${path.basename(slug)}.js`),
        });
        await bundle.close();
    });

    // closes the bundle
    await bundle.close();
}

const copyStaticAssets = async () => {
    const outputAssets = path.join(outputRoot, 'assets');
    if (fs.existsSync(outputAssets)) {
        await fs.emptyDir(outputAssets);
    }
    fs.copySync(path.join(websiteRoot, 'assets', 'images'), path.join(outputAssets, 'images'), { recursive: true });
    fs.copySync(path.join(websiteRoot, 'assets', 'favicon.ico'), path.join(outputRoot, 'favicon.ico'));
}

const getBuildData = () => {
    return {
        pages,
        snippets: Object.fromEntries(snippetsByKey),
    }
}

const build = async () => {
    await hooks.beforeBuild();
    compilePages();
    await hooks.afterCompilePages(pages);
    await buildJs();
    buildPages();
    await hooks.afterBuildPages();
    copyStaticAssets();
    await hooks.afterBuild(getBuildData());
};

const init = async () => {
    const snippets = await getSnippets(snippetKeys);

    snippets.forEach(({ contentKey, contentValue }) => {
        snippetsByKey.set(contentKey, contentValue);
    });
};

module.exports = {
    build: async () => {
        await init();
        await build();
        return getBuildData();
    },
    serve: async () => {
        await init();
        await build();

        const watchFilesHandler = (event, file) => {
            clearTimeout(watchFilesHandler.timeout);
            watchFilesHandler.queue.push({ event, file });
            watchFilesHandler.timeout = setTimeout(async () => {
                watchFilesHandler.queue.forEach((item) => {
                    if (path.extname(item.file) === '.html' && item.file.includes(pagesRoot)) {
                        const { url } = getPagePathMeta(file);
                        const pageIndex = pages.findIndex(({ page }) => page.url === url);
                        if (item.event === 'unlink') {
                            pages.splice(pageIndex, 1);
                        } else {
                            const newPage = createPageFromPath(item.file);
                            // Add the new page to the pages array
                            if (item.event === 'add') pages.push(createPageFromPath(item.file));
                            // Replace the old page data with the new
                            else pages.splice(pageIndex, 1, newPage);

                        }
                    }
                });
                watchFilesHandler.queue = [];
                await build();
                bs.reload();
            }, 100);
        };
        watchFilesHandler.queue = [];
        watchFilesHandler.timeout = undefined;

        bs.watch(path.join(websiteRoot, '**/*.{css,scss,html,js}'), { ignoreInitial: true }, watchFilesHandler);
        bs.watch(path.join(websiteRoot, 'assets', '**/*.{png,jpg,gif}'), { ignoreInitial: true }, copyStaticAssets);

        bs.init({ server: outputRoot });
    }
};
