<template>
    <div>
        <h1>Pages</h1>
        <table class="table table-light rounded border content-type-list">
            <thead class="thead-light">
                <tr>
                    <th>Name</th>
                    <th>URL</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="page in pages" :key="page.id">
                    <td>
                        <router-link :to="`/page/${page.slug}`" v-if="page.snippets">{{ page.name }}</router-link>
                        <span v-else>{{ page.name }}</span>
                    </td>
                    <td>{{ page.url }}</td>
                    <td><router-link :to="`/page/${page.slug}`"><icon name="edit" /></router-link></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import Icon from "../components/Icon.vue";

export default {
    name: 'Pages',
    components: { Icon },
    setup: () => ({
        pages: [...buildData.pages].sort(({ slug }) => (slug === 'home' ? -1 : 0)),
    }),
}
</script>

<style>

</style>
