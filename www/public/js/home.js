'use strict';

postXHR('album', {
    action: 'getCategoryNames',
}).then(function (data) {
    let app = new Vue({
        el: '#categories',
        data: {
            path: RELATIVE_PATH.storage + 'photos_category/',
            repertories: data,
            categorySelected: null,
        },
        template: `<div id="categoryPhoto_div">
                        <div v-for="(repertory,index) in repertories" :key="repertory.index" class="categoryPhoto">
                            <div class="category_div">
                                <img :src="imagePath(repertory)" :class="{displayed: index === categorySelected}" width="auto" height="200px" @touchend="openCategory(index)">
                                <div class="wrapper" @click="openCategory(index)" @mouseover="showCategoryImage(index) "@mouseout="changeAnglePolaroid(index)">
                                   <div class="category_background"></div> 
                                   <p class="category_p">{{ categoryTitle(repertory.title) }}</p>
                                </div>
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
            },
            changeAnglePolaroid(index) {
                this.categorySelected = null;
                document.querySelectorAll('.category_div img')
                    .forEach((element, key) => {
                        if (key !== index) {
                            element.style.setProperty('--angle-polaroid', Math.round(Math.random() * 4 - 1) + 'deg');
                        }
                    });
            },
            showCategoryImage(index) {
                this.categorySelected = index;
            }
        }
    });
});



