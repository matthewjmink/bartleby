process.env.BARTLEBY_ROUTE_IMPORTS;

const routes = process.env.BARTLEBY_ROUTES || [];
const routerView = document.querySelector('#content');
let currentRoute;

function getRoute(path) {
    return routes.find(route => route.path === path);
}

function loadRoute(route) {
    if (!route) return;

    const previousRoute = currentRoute;
    currentRoute = route;

    const { template, component = () => { }, slug } = route;

    // TODO: Export event hooks to tie into router events
    // beforeRouteUpdate();

    document.title = route.meta.title;
    document.querySelector('meta[name="description"]').setAttribute("content", route.meta.description);

    // TODO: Investigate whether a functional approach could improve performance with the help of caching route elements
    routerView.innerHTML = template;

    if (previousRoute) {
        document.body.classList.remove(`page-${previousRoute.slug}`);
    }
    document.body.classList.add(`page-${slug}`);

    document.body.scrollIntoView();
    component();
}

export function goTo(path) {
    const route = getRoute(path);
    history.pushState(null, null, path);
    loadRoute(route);
}

const handleLinkClick = function handleLinkClick(e, link) {
    const { pathname, hash } = link;

    if (hash) {
        e.preventDefault();
        const scrollTo = document.querySelector(hash);
        if (scrollTo) {
            // TODO: Export event hooks to tie into router events
            // beforeRouteInline();
            scrollTo.scrollIntoView({ behavior: 'smooth' });
        }
        return;
    }

    if (!pathname) return;

    const route = getRoute(pathname);

    if (!route) return;

    e.preventDefault();

    link.blur();

    if (pathname === location.pathname) return;

    goTo(pathname);
}

document.addEventListener('click', (e) => {
    const { target } = e;
    const link = target.tagName.toLowerCase() === 'A' ? target : target.closest('a');

    if (!link) return;

    handleLinkClick(e, link);
});

window.addEventListener('popstate', () => {
    loadRoute(getRoute(location.pathname));
});

currentRoute = getRoute(location.pathname);


export { routes };
