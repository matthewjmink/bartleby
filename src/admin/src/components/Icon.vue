<script>
import { h } from 'vue';
import { icons } from "feather-icons";

export default {
    name: 'icon',
    props: {
        name: {
            type: String,
            required: true,
        },
    },
    render() {
        const icon = icons[this.name];

        return h('svg', {
            ...icon.attrs,
            class: `icon ${icon.attrs.class}`,
            innerHTML: icon.contents,
        });
    },
}
</script>

<style scoped>
.icon {
    stroke: currentColor;
    height: 1em;
    width: auto;
    display: inline-block;
    vertical-align: text-bottom;
}
</style>
