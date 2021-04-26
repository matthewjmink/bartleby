<template>
    <div class="wrapper">
        <nav class="main-menu py-3">
            <div class="nav-item">
                <router-link to="/pages" :class="['nav-link', { active: isPageRoute }]">Pages</router-link>
            </div>
            <div class="nav-item">
                <a href="#" class="nav-link">Reviews</a>
            </div>
            <div class="nav-item">
                <a href="#" class="nav-link">Galleries</a>
            </div>
        </nav>
        <main class="content p-3">
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css';

export default {
    computed: {
        isPageRoute() {
            return this.$router.currentRoute.value.path.indexOf('/page') === 0;
        },
    },
}
</script>

<style>
:root {
    --blue: #2F4472;
    --teal: #99EDD5;
    --light-blue-1: #4EBDD2;
    --light-blue-2: #007990;
    --dark-blue: #010F21;
    --light-gray: #F2F4F5;
    --link-color-light: var(--light-blue-1);
    --link-color-dark: var(--light-blue-2);
    --success: #27be61;
    --danger: #d43333;
    --warning: #e9a920;
    --menu-width: 240px;
    --font-family: Palatino, Palatino Linotype, Palatino LT STD, Book Antiqua, Georgia, serif;
}
body {
    color: #333;
    background: var(--light-gray);
    font-family: var(--font-family);
}
.dropdown-toggle.no-toggle-icon::before,
.dropdown-toggle.no-toggle-icon::after {
    display: none;
}
.dropdown-item.active,
.dropdown-item:active {
    background-color: var(--link-color-dark);
}
.tox-statusbar__branding,
.tox-notifications-container {
    display: none !important;
}
.vld-icon {
    text-align: center;
}
@media (min-width: 992px) {
    .cropper-point {
        transform: scale(3);
    }
}
.wrapper {
    position: relative;
    padding-left: var(--menu-width);
}
.main-menu {
    background: var(--dark-blue);
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: var(--menu-width);
}
a {
    color: var(--link-color-dark);
    transition: color .15s linear;
}
a:hover {
    color: var(--link-color-light);
}
.main-menu .nav-link {
    color: #fff;
    font-size: 1.25rem;
    padding: .75rem 1.25rem;
    border-left: 3px solid transparent;
    transition: all .15s ease-in-out;
}
.main-menu .nav-link:not(.active):hover {
    background: rgba(78, 188, 210, 0.15);
}
.main-menu .nav-link.active {
    background: var(--light-blue-2);
    border-left-color: var(--light-blue-1);
}
.content-type-list {
    font-size: 1.25rem;
}
</style>
