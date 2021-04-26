import { icons } from "feather-icons";

export default {
    install(app) {
        Object.keys(icons)
            .forEach((iconKey) => {
                app.component(`icon-${iconKey}`, {
                    template: icons[iconKey].toSvg({ class: 'icon' }),
                });
            });
    }
};
