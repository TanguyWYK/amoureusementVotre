'use strict';

const TIME_LONG_CLICK = 1000;
const TIME_FAST_CHANGE = 300;
const TIME_NORMAL_CHANGE = 2500;

postXHR('album', {
    action: 'getPhotoNames',
    albumId: document.getElementById('album').dataset.album,
}).then(function (data) {
    let album = new Vue({
        el: '#album',
        data: {
            path: data.path,
            path_mini: data.path_mini,
            selectedPhoto: 0,
            photos: data.photos,
            numberOfPhotos: data.photos.length,
            timer: null,
            scroll: false,
            clickPosition: 0,
            albumElement: null,
            clickButton_time: null,
            clickButton_change: 1,
            idButtonDown: false,
            diaporama_play: false,
            isFullScreen: false,
        },
        template: `<div>
                        <div id="photoDisplayed">
                            <img :src="photoSelectedPath" width="auto" height="800px">
                        </div>
                        <div id="diaporamaControls">
                            <div id="leftButton" @click="beginAlbum">${icons('backward', '12x12')}</div>
                            <div :class="{locked: selectedPhoto===0}" @click="changePhoto(-1)" @mousedown="mouseDownOnButton(-1)" @mouseup="mouseUpOnButton" @mouseleave="mouseUpOnButton">${icons('previous', '12x12')}</div>
                            <div :class="{played: diaporama_play}" @click="startDiaporama">${icons('play', '12x12')}</div>
                            <div @click="stopDiaporama">${icons('stop', '12x12')}</div>
                            <div :class="{locked: selectedPhoto===numberOfPhotos-1}" @click="changePhoto(1)" @mousedown="mouseDownOnButton(1)" @mouseup="mouseUpOnButton" @mouseleave="mouseUpOnButton">${icons('next', '12x12')}</div>
                            <div id="homeButton" @click="goToCategories">${icons('home', '12x12')}</div>
                            <div id="rightButton" @click="endAlbum">${icons('forward', '12x12')}</div>
                        </div>
                        <div id="album_div" @mousedown="mouseDownOnAlbum" @mousemove="mouseMoveOnAlbum" @mouseup="mouseUpOnAlbum" @mouseleave="mouseUpOnAlbum">
                            <div v-for="(photo,index) in photos" :key="photo.index" class="miniPhoto" :class="{selected: index===getSelectedPhoto}" @click="openPhoto(index)">
                                <img :src="imagePathMini(photo)" width="auto" height="100px">
                            </div>
                        </div>
                   </div>`,
        computed: {
            photoSelectedPath() {
                return this.path + this.photos[this.selectedPhoto];
            },
            getSelectedPhoto() {
                return this.selectedPhoto;
            }
        },
        mounted() {
            let self = this;
            window.addEventListener('keydown', e => {
                if(e.key === 'ArrowLeft'){
                    self.changePhoto(-1);
                }else if(e.key === 'ArrowRight'){
                    self.changePhoto(1);
                }else if(e.key === 'd'){
                    self.deletePhoto();
                }
            });
        },
        methods: {
            goToCategories(){
                window.location = 'home'
            },
            deletePhoto(){
                postXHR('album', {
                    action: 'deletePhoto',
                    path: this.photoSelectedPath,
                    path_mini : this.imagePathMini(this.photos[this.selectedPhoto]),
                }).then(()=>{
                    this.changePhoto(1);
                });
            },
            imagePathMini(photoName) {
                let extension = photoName.split('.').pop();
                let name = photoName.replace(/\.[^/.]+$/, '') + '_mini';
                return this.path_mini + name + '.' + extension;
            },
            openPhoto(index) {
                let imageElement = document.querySelector('#photoDisplayed img');
                imageElement.classList.remove('fade-in-and-out');
                setTimeout(() => {
                    this.selectedPhoto = index;
                    imageElement.classList.add('fade-in-and-out');
                }, 0);
            },
            changePhoto(change) {
                let imageElement = document.querySelector('#photoDisplayed img');
                imageElement.classList.remove('fade-in-and-out');
                let offsetX = 152;
                let photoChanged = true;
                if (change < 0 && this.selectedPhoto > 0) {
                    this.selectedPhoto--;
                    offsetX *= -1;
                } else if (change > 0 && this.selectedPhoto < this.numberOfPhotos - 1) {
                    this.selectedPhoto++;
                } else {
                    photoChanged = false;
                }
                if (photoChanged || change === 0) {
                    let photoSelected = document.querySelector('.miniPhoto.selected');
                    let albumElement = document.getElementById('album_div');
                    albumElement.scrollLeft = albumElement.scrollLeft + photoSelected.getBoundingClientRect().left + offsetX - window.innerWidth / 2;
                    imageElement.classList.add('fade-in-and-out');
                }
            },
            startDiaporama() {
                if (!this.diaporama_play) {
                    this.diaporama_play = true;
                    this.timer = setInterval(() => {
                        if (this.selectedPhoto < this.numberOfPhotos - 1) {
                            this.changePhoto(1);
                        } else {
                            this.stopDiaporama();
                        }
                    }, TIME_NORMAL_CHANGE);
                }
            },
            stopDiaporama() {
                this.diaporama_play = false;
                clearInterval(this.timer);
            },
            mouseDownOnAlbum() {
                this.scroll = true;
                event.preventDefault();
                this.albumElement = document.getElementById('album_div');
                // Position de la souris relative au canvas
                this.clickPosition = event.clientX;
            },
            mouseMoveOnAlbum() {
                if (this.scroll) {
                    let position = event.clientX;
                    let difference = this.clickPosition - position;
                    if (Math.abs(difference) > 50) {
                        difference *= 4;
                    }else if(Math.abs(difference) > 20) {
                        difference *= 2;
                    }
                    this.albumElement.scrollLeft += difference;
                    this.clickPosition = position;
                }
            },
            mouseUpOnAlbum() {
                this.scroll = false;
            },
            mouseDownOnButton(change) {
                this.clickButton_change = change;
                this.clickButton_time = Date.now();
                this.isButtonDown = true;
                setTimeout(this.testIfLongClick.bind(this), TIME_LONG_CLICK);
            },
            testIfLongClick() {
                let timestamp = Date.now();
                let difference = timestamp - this.clickButton_time;
                if (difference > TIME_LONG_CLICK) {
                    this.recursiveChangePhoto()
                }
            },
            recursiveChangePhoto() {
                this.changePhoto(this.clickButton_change)
                if (this.isButtonDown) {
                    setTimeout(this.recursiveChangePhoto.bind(this), TIME_FAST_CHANGE);
                }
            },
            mouseUpOnButton() {
                this.clickButton_time = Date.now();
                this.isButtonDown = false;
            },
            beginAlbum() {
                this.selectedPhoto = 0;
                this.changePhoto(0);
                let albumElement = document.getElementById('album_div');
                albumElement.scrollLeft = 0;
            },
            endAlbum() {
                this.selectedPhoto = this.numberOfPhotos - 1;
                this.changePhoto(0);
                let albumElement = document.getElementById('album_div');
                albumElement.scrollLeft = (this.numberOfPhotos - 1) * 152;
            }
        }
    });
});