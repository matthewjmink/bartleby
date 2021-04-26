export const captureSaveKey = (e) => {
    const { metaKey, key } = e;
    const isSaveKey = key === 's' && metaKey;

    if (!isSaveKey) return false;

    e.preventDefault();

    return true;
};

export const isClickOutside = (event, elements, { handleKeyup = true } = {}) => {
    const {
        type,
        key,
        target,
        composedPath = () => null,
        path = composedPath.call(event),
    } = event;

    if (type !== 'click' && (!handleKeyup || key !== 'Tab')) return false;

    const containers = Array.isArray(elements) ? elements : [elements];
    const isInsideAnyContainer = containers.some((container) => {
        if (container.contains(document.activeElement)) return true;
        return (path && path.includes(container)) || container.contains(target);
    });

    return !isInsideAnyContainer;
};
