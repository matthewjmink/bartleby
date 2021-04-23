<template>
    <h1>{{ msg }}</h1>
    <button @click="state.count++">count is: {{ state.count }}</button>
</template>

<script>
import { reactive } from 'vue';

export default {
    name: 'HelloWorld',
    props: {
        msg: String
    },
    setup() {
        const state = reactive({ count: 0 });
        return { state };
    },
};
</script>
