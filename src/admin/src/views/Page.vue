<template>
    <div>
        <div class="mb-2">
            <router-link to="/pages"><icon name="chevron-left" />pages</router-link>
        </div>
        <h1 class="mb-4">
            <span class="mr-3">{{ page.name }}</span>
            <div :class="['dropdown d-inline-block', { show: showPagesDropdown }]" ref="pagesDropdown">
                <button class="btn btn-sm btn-secondary dropdown-toggle" @click="showPagesDropdown = !showPagesDropdown">switch page</button>
                <div :class="['dropdown-menu', { show: showPagesDropdown }]">
                    <router-link class="dropdown-item"
                            v-for="page in notActivePages"
                            :key="page.id"
                            :to="`/page/${page.slug}`">{{ page.name }}</router-link>
                </div>
            </div>
            <button class="btn btn-sm btn-success ml-2" @click="save()" v-show="unsavedContent.length > 0">
                <icon name="save" class="mr-1" />save all changes
            </button>
        </h1>
        <div>
            <h2>Content</h2>
            <div v-for="snippet in page.snippets" :key="snippet" class="mb-5">
                <h4>
                    {{ snippet.name }}
                    <button class="ml-2 btn btn-success btn-sm"
                            v-show="snippetsByKey[snippet.key] !== snippetsByKeyOld[snippet.key]"
                            @click="save(snippet.key)">
                        <icon class="mr-1" name="save" />Save
                    </button>
                </h4>
                <editor :id="`editor_${snippet.key}`"
                        api-key="no-api-key"
                        :init="editorConfig"
                        v-model="snippetsByKey[snippet.key]"
                        :ref="`editor${snippet.key}`" />
            </div>
        </div>
    </div>
</template>

<script>
import data from '../data';
import Editor from "@tinymce/tinymce-vue";
import Icon from "../components/Icon.vue";
import { captureSaveKey, isClickOutside } from "../utils";

const formatLinkDialog = () => {
    const dialog = document.querySelector('.tox-dialog');
    const form = dialog.querySelector('.tox-form');
    const formGroupsById = Array.from(dialog.querySelectorAll('.tox-form__group'))
        .reduce((mapped, formGroup) => {
            const label = formGroup.querySelector('.tox-label');
            const id = camelize(label.innerText);
            mapped[id] = { formGroup, label };
            return mapped;
        }, {});
    const linkListHelp = document.createElement('div');
    const urlHelp = document.createElement('div');

    linkListHelp.innerHTML = 'or <a href="#">use a custom URL</a> instead';
    urlHelp.innerHTML = 'or <a href="#">select a page from your site</a> instead';

    linkListHelp.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        formGroupsById.url.formGroup.style.display = 'block';
        formGroupsById.linkList.formGroup.style.display = 'none';
        formGroupsById.url.formGroup.querySelector('.tox-textfield').focus();
    });
    urlHelp.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        formGroupsById.url.formGroup.style.display = 'none';
        formGroupsById.linkList.formGroup.style.display = 'block';
        formGroupsById.linkList.formGroup.querySelector('button.tox-listbox').click();
    });

    dialog.classList.add('link-dialog');
    form.appendChild(formGroupsById.url.formGroup);
    formGroupsById.linkList.formGroup.appendChild(linkListHelp);
    formGroupsById.linkList.label.innerText = 'Select a Page';
    formGroupsById.url.formGroup.appendChild(urlHelp);
    formGroupsById.url.formGroup.style.display = 'none';
};

const getEditorConfig = function getEditorConfig() {
    return {
        menubar: false,
        plugins: [
            'lists link image charmap preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media paste code'
        ],
        toolbar:
            'undo redo | formatselect | bold italic | link unlink | \
            bullist numlist outdent indent | removeformat',
        anchor_top: false,
        anchor_bottom: false,
        target_list: false,
        link_title: false,
        link_list: [{ title: 'Contact Us', value: '#contact' }],
        relative_urls: false,
        remove_script_host: true,
        document_base_url: '',
        setup: (editor) => {
            editor.on('keydown', (e) => {
                const snippetId = editor.id.replace('editor_', '');

                if (!captureSaveKey(e) || !this.unsavedContent.includes(snippetId)) return;

                this.save(snippetId);
            });

            editor.on('OpenWindow', ({ dialog }) => {
                const data = dialog.getData();
                if (data.url === undefined) return;
                formatLinkDialog();
            });
        },
    };
}

export default {
    name: 'Page',
    components: { Editor, Icon },
    props: {
        page: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            snippetsByKey: data.snippets,
            snippetsByKeyOld: JSON.parse(JSON.stringify(data.snippets)),
            showPagesDropdown: false,
            editorConfig: getEditorConfig.call(this),
        };
    },
    computed: {
        notActivePages() {
            return data.pages.filter(({ slug }) => slug !== this.page.slug)
        },
        unsavedContent() {
            return Object.keys(this.snippetsByKey).filter(key => this.snippetsByKey[key] !== this.snippetsByKeyOld[key]);
        },
    },
    methods: {
        save() {
            console.log('saving...');
        },
        saveKeyHandler(e) {
            if (!captureSaveKey(e) || this.unsavedContent.length === 0) return;
            this.save();
        },
    },
    watch: {
        showPagesDropdown(showPagesDropdown) {
            if (showPagesDropdown) {
                this.clickOutsideHandler = (event) => {
                    if (isClickOutside(event, this.$refs.pagesDropdown)) {
                        this.showPagesDropdown = false;
                    }
                };
                document.addEventListener('click', this.clickOutsideHandler);
            } else {
                document.removeEventListener('click', this.clickOutsideHandler);
            }
        },
    },
    mounted() {
        document.addEventListener('keydown', this.saveKeyHandler);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.saveKeyHandler);
    },
    beforeRouteLeave() {
        this.showPagesDropdown = false;
    },
};
</script>
