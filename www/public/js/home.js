'use strict';

postXHR('album', {
    action: 'getCategoryNames',
}).then(function (data) {
    let app = new Vue({
        el: '#categories',
        data: {
            path: 'storage/photos_category/',
            repertories: data,
        },
        template: `<div id="categoryPhoto_div">
                    <div v-for="(repertory,index) in repertories" :key="repertory.index" class="categoryPhoto" @click="openCategory(index)">
                    <div class="category_div">
                    <img :src="imagePath(repertory)" width="auto" height="200px">
                    <p class="category_p">{{ categoryTitle(repertory.title) }}</p>
                    </div>
                    </div>
                    </div>`,
        methods: {
            imagePath(repertory) {
                return this.path + repertory['mini_photo'];
            },
            categoryTitle(title) {
                return title.substr(3);
            },
            openCategory(index) {
                window.location.href = 'album' + index;
            }
        }
    });
});



