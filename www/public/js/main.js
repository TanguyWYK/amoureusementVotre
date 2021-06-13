'use strict';
const DIRECTORY_SITE = 'www/'; // mettre vide pour la mise en prod

const RELATIVE_PATH = {
    controllers: DIRECTORY_SITE + 'app/controllers/',
    icons: DIRECTORY_SITE + 'public/icons/',
    storage: DIRECTORY_SITE + 'storage/',
};

/**
 * Fonction qui renvoie le svg d'une icône
 *
 * @param {string} name
 * @param {string} dimensions
 * @return {string}
 */
function icons(name, dimensions) {
    return '<svg class="icons i_' + dimensions + '" role="img"><use xlink:href="' + RELATIVE_PATH.icons + 'fonts-defs.svg#' + name + '"></use></svg>'
}

/**
 *
 * @param {string} controller
 * @param {Object} parameters
 * @return {Promise<*>}
 */
function postXHR(controller, parameters = {}) {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', RELATIVE_PATH.controllers + controller + '.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = (data) => {
            if (xhr.getResponseHeader('Content-Type').includes('json')) {
                resolve(JSON.parse(data.target['response']));
            } else {
                resolve(data.target['response']);
            }
        };
        xhr.send(encodeURIObject(parameters));
    });
}

function encodeURIObject(data) {
    let keys = Object.keys(data);
    let response = '';
    for (let key of keys) {
        response += key + '=' + data[key] + '&';
    }
    return encodeURI(response.slice(0, -1)); // pour enlever le dernier &
}

function testLogin() {
    document.getElementById('login_form').addEventListener('submit', (event) => event.preventDefault());
    let email = document.getElementById('loginEmail_input').value.toLowerCase();
    let password = document.getElementById('loginPassword_input').value;
    let errorMessage = '';
    if (password.length === 0) {
        errorMessage = 'Présentez votre ticket';
        document.getElementById('loginPassword_input').focus();
    } else if (!(/^(\S)+@+(\S)+\.+(\w)/g).test(email) || email.split('@').length > 2) {
        errorMessage = 'Email invalide';
        document.getElementById('loginEmail_input').focus();
    }
    let errorMessageElement = document.getElementById('errorLogin_div');
    if (errorMessage === '') {
        postXHR('login', {
            action: 'login',
            email: email,
            password: password,
        }).then((data) => {
            if (data === false) {
                showErrorMessage('Ticket introuvable', errorMessageElement);
                document.getElementById('loginPassword_input').focus();
            } else {
                animationEnter();
            }
        });
    } else {
        showErrorMessage(errorMessage, errorMessageElement);
    }
}

/**
 * Fonction qui affiche un message d'erreur avec un fade-in
 *
 * @param {string} errorMessage
 * @param {HTMLElement} errorElement
 */
function showErrorMessage(errorMessage, errorElement) {
    errorElement.classList.remove('fade-in-400');
    errorElement.textContent = errorMessage;
    errorElement.classList.add('fade-in-400');
    setTimeout(() => errorElement.classList.remove('fade-in-400'), 500);
}

function animationEnter() {
    document.getElementById('ticket').classList.remove('slide-up');
    document.getElementById('cinema_background').classList.add('zoom-inside');
    document.getElementById('curtain').classList.add('open-curtain');

    setTimeout(function () {
        document.location.href = 'home';
    }, 4000);
}

function requestFullScreen() {
    let element = document.querySelector('.container');
    // Supports most browsers and their versions.
    let requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    }
}

function exitFullScreen() {
    if (document.fullscreenElement !== null) { // si pression sur échap
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
            });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function renameFiles() {
    postXHR('controls', {
        action: 'renameFiles',
    }).then((data) => {
        console.log(data);
    });
}

function generateMiniPhotos() {
    postXHR('controls', {
        action: 'generateMiniPhotos',
    }).then((data) => {
        console.log(data);
    });
}

function generateSprites() {
    postXHR('controls', {
        action: 'generateSprites',
    }).then((data) => {
        console.log(data);
    });
}

function saveMorePhotoStatus(){
    postXHR('more', {
        action: 'updateMorePhotoStatus',
        more_photos: document.getElementById('morePhoto_checkBox').checked?'1':'0',
    }).then(() => {
        document.location.href = 'home';
    });
}

window.addEventListener('load', () => {
    let waitElement = document.getElementById('wait_loading');
    if (waitElement) waitElement.remove();
    document.addEventListener('click', () => {
        let ticketElement = document.getElementById('ticket');
        if (ticketElement) {
            ticketElement.classList.add('slide-up');
        }
    }, false);
}, false);