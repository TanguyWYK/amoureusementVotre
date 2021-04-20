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
            photoIsPreloaded: new Array(data.photos.length).fill(false),
            timer: null,
            scroll: false,
            clickPosition: 0,
            albumElement: null,
            clickButton_time: null,
            clickButton_change: 1,
            idButtonDown: false,
            diaporama_play: false,
            isFullScreen: false,
            height: Math.round(window.innerHeight * 0.8) + 'px',
        },
        template: `<div>
                        <div id="photoDisplayed">
                            <img :src="photoSelectedPath" width="auto" :height="height" @load="photoIsLoaded">
                        </div>
                        <div id="diaporamaControls">
                            <div id="leftButton" @click="beginAlbum">${icons('backward', '12x12')}</div>
                            <div :class="{locked: selectedPhoto===0}" @click="changePhoto(-1)" @mousedown="mouseDownOnButton(-1)" @mouseup="mouseUpOnButton" @mouseleave="mouseUpOnButton">${icons('previous', '12x12')}</div>
                            <div id="playButton" :class="{played: diaporama_play}" @click="startDiaporama">${icons('play', '12x12')}</div>
                            <div @click="stopDiaporama">${icons('stop', '12x12')}</div>
                            <div :class="{locked: selectedPhoto===numberOfPhotos-1}" @click="changePhoto(1)" @mousedown="mouseDownOnButton(1)" @mouseup="mouseUpOnButton" @mouseleave="mouseUpOnButton">${icons('next', '12x12')}</div>
                            <div id="homeButton" @click="goToCategories">${icons('home', '12x12')}</div>
                            <div id="rightButton" @click="endAlbum">${icons('forward', '12x12')}</div>
                        </div>
                        <div id="album_div" @mousedown="mouseDownOnAlbum" @mousemove="mouseMoveOnAlbum" @mouseup="mouseUpOnAlbum" @mouseleave="mouseUpOnAlbum">
                            <div v-for="(photo,index) in photos" :key="photo.index" class="miniPhoto" :class="{selected: index===getSelectedPhoto}" @click="openPhoto(index)">
                                <div>
                                    <svg width="150" height="140">
                                        <path fill="black" :d="makeHolesOnFilm" />
                                    </svg>
                                    <img :src="imagePathMini(photo)" width="auto" height="100px">
                                </div>
                            </div>
                        </div>
                        <div id="blackScreen"><p>${icons('spinner', '40x40 animate_rotate')}</p></div>
                   </div>`,
        computed: {
            photoSelectedPath() {
                return this.path + this.photos[this.selectedPhoto];
            },
            getSelectedPhoto() {
                return this.selectedPhoto;
            },
            makeHolesOnFilm() {
                let svgString = 'M0 0 h140 v140 h-140z M5 20 v100 h130 v-100z ';
                for (let y = 6; y < 150; y += 116) {
                    for (let i = 0; i < 7; i++) {
                        let x = 6 + i * 20;
                        svgString += 'M' + x + ' ' + y + ' q-2 0, -2 2, v8 q0 2, 2 2, h4 q2 0, 2 -2, v-8 q0 -2, -2 -2z';
                    }
                }
                return svgString;
            },
        },
        mounted() {
            this.photoIsPreloaded[0] = true; // La première image est chargée à l'affichage
            let self = this;
            window.addEventListener('keydown', e => {
                if (e.key === 'ArrowLeft') {
                    self.changePhoto(-1);
                } else if (e.key === 'ArrowRight') {
                    self.changePhoto(1);
                } else if (e.key === 'd') {
                    self.deletePhoto();
                }
            });
            window.addEventListener('resize', e => {
                this.height = Math.round(window.innerHeight * 0.8) + 'px';
            });
            this.preloadOnePhoto(() => {
                document.getElementById('blackScreen').remove();
                //this.preloadTwoPhotos();
            });
        },
        methods: {
            photoIsLoaded() {
                let imageElement = document.querySelector('#photoDisplayed img');
                imageElement.classList.add('fade-in-300');
                imageElement.classList.remove('fade-out-200');
            },
            animatePhotoOpening(index) {
                let imageElement = document.querySelector('#photoDisplayed img');
                if (this.selectedPhoto !== index) {
                    imageElement.classList.add('fade-out-200');
                    imageElement.classList.remove('fade-in-300');
                }
            },
            preloadTwoPhotos() {
                setTimeout(() => {
                    this.preloadOnePhoto();
                    setTimeout(() => {
                        this.preloadOnePhoto();
                    }, 500);
                }, 500);
            },
            preloadOnePhoto(callback = () => {
            }) {
                let photoToPreloadId = this.findNextPhotoToPreload();
                if (photoToPreloadId !== -1) { // sinon tout est déjà chargé
                    let image = new Image();
                    image.src = this.path + this.photos[photoToPreloadId];
                    this.photoIsPreloaded[photoToPreloadId] = true;
                    callback();
                } else {
                    callback();
                }
            },
            findNextPhotoToPreload() {
                // Choisi la photo suivante
                let index = this.photoIsPreloaded.indexOf(false, this.selectedPhoto);
                if (index < 0) {
                    // Si elle est déjà chargée, prend la photo précédente
                    index = this.photoIsPreloaded.indexOf(false, this.selectedPhoto - 2);
                }
                if (index < 0) {
                    // Si elle est déjà chargée, cherche une photo depuis le début
                    index = this.photoIsPreloaded.indexOf(false, 0);
                }
                return index;
            },
            goToCategories() {
                window.location = 'home';
            },
            deletePhoto() {
                postXHR('album', {
                    action: 'deletePhoto',
                    path: this.photoSelectedPath.substr(4),
                    path_mini: this.imagePathMini(this.photos[this.selectedPhoto]).substr(4),
                }).then(() => {
                    this.changePhoto(1);
                });
            },
            imagePathMini(photoName) {
                let extension = photoName.split('.').pop();
                let name = photoName.replace(/\.[^/.]+$/, '') + '_mini';
                return this.path_mini + name + '.' + extension;
            },
            openPhoto(index) {
                this.animatePhotoOpening(index);
                this.photoIsPreloaded[index] = true;
                setTimeout(() => {
                    this.selectedPhoto = index;
                }, 0);
            },
            changePhoto(change) {
                let offsetX = 152;
                let photoChanged = true;
                if (change < 0 && this.selectedPhoto > 0) {
                    this.animatePhotoOpening(this.selectedPhoto - 1);
                    this.selectedPhoto--;
                    this.photoIsPreloaded[this.selectedPhoto] = true;
                    offsetX *= -1;
                } else if (change > 0 && this.selectedPhoto < this.numberOfPhotos - 1) {
                    this.animatePhotoOpening(this.selectedPhoto + 1);
                    this.selectedPhoto++;
                    this.photoIsPreloaded[this.selectedPhoto] = true;
                } else {
                    photoChanged = false;
                }
                if (photoChanged || change === 0) {
                    let photoSelected = document.querySelector('.miniPhoto.selected');
                    let albumElement = document.getElementById('album_div');
                    albumElement.scrollLeft = albumElement.scrollLeft + photoSelected.getBoundingClientRect().left + offsetX - window.innerWidth / 2;
                }
                this.preloadTwoPhotos();
            },
            startDiaporama() {
                if (!this.diaporama_play) {
                    this.diaporama_play = true;
                    let iconElement = document.querySelector('#playButton svg')
                    iconElement.classList.add('i_11x11');
                    iconElement.classList.remove('i_12x12');
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
                let iconElement = document.querySelector('#playButton svg')
                iconElement.classList.add('i_12x12');
                iconElement.classList.remove('i_11x11');
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
                    } else if (Math.abs(difference) > 20) {
                        difference *= 2;
                    }
                    this.albumElement.scrollLeft += difference;
                    this.clickPosition = position;
                }
            },
            mouseUpOnAlbum() {
                if (this.scroll) {
                    this.preloadTwoPhotos();
                }
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
                this.animatePhotoOpening(0);
                this.selectedPhoto = 0;
                this.changePhoto(0);
                let albumElement = document.getElementById('album_div');
                albumElement.scrollLeft = 0;
            },
            endAlbum() {
                this.animatePhotoOpening(this.numberOfPhotos - 1);
                this.selectedPhoto = this.numberOfPhotos - 1;
                this.changePhoto(0);
                let albumElement = document.getElementById('album_div');
                albumElement.scrollLeft = (this.numberOfPhotos - 1) * 152;
            }
        }
    });
});