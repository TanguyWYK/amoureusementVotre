'use strict';

const RELATIVE_PATH = {
    controllers: 'app/controllers/',
    views: 'app/views/',
    icons: 'public/icons/',
};

function renameFiles(){
    postXHR('controls',{
        action: 'renameFiles',
    }).then((data)=>{
        console.log(data);
    });
}

function generateMiniPhotos(){
    postXHR('controls',{
        action: 'generateMiniPhotos',
    }).then((data)=>{
        console.log(data);
    });
}

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


window.addEventListener('load', () => {
   document.getElementById('ticket').classList.add('slide-up');
}, false);


/**
 * Fonction qui effectue la requête post en replacement de la $.post de jquery
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

/**
 * Fonction qui transforme un objet en encodeURI pour envoi en post vers le serveur
 *
 * @param {{}} data
 * @return {string}
 */
function encodeURIObject(data) {
    let keys = Object.keys(data);
    let response = '';
    for (let key of keys) {
        response += key + '=' + data[key] + '&';
    }
    return encodeURI(response.slice(0, -1)); // pour enlever le dernier &
}

function testLogin(){
    document.getElementById('login_form').addEventListener('submit',(event)=>event.preventDefault());
    let email = document.getElementById('loginEmail_input').value.toLowerCase();
    let password = document.getElementById('loginPassword_input').value;
    let errorMessage = '';
    if(password.length===0){
        errorMessage = 'Ticket invalide';
    }else if(!(/^(\S)+@+(\S)+\.+(\w)/g).test(email) || email.split('@').length>2){
        errorMessage = 'Email invalide';
    }
    let errorMessageElement = document.getElementById('errorLogin_div');
    if(errorMessage === ''){
        postXHR('login',{
            action: 'login',
            email: email,
            password: password,
        }).then((data)=>{
            if (data === false) {
                showErrorMessage('Ticket invalide',errorMessageElement);
            } else {
                animationEnter();
            }
        });
    }else{
        showErrorMessage(errorMessage,errorMessageElement);
    }
}

/**
 * Fonction qui affiche un message d'erreur avec un fade-in
 *
 * @param {string} errorMessage
 * @param {HTMLElement} errorElement
 */
function showErrorMessage(errorMessage, errorElement) {
    errorElement.classList.remove('fade-in');
    errorElement.textContent = errorMessage;
    errorElement.classList.add('fade-in');
    setTimeout(() => errorElement.classList.remove('fade-in'), 500);
}

function animationEnter(){
    document.getElementById('ticket').classList.remove('slide-up');
    document.getElementById('cinema_background').classList.add('zoom-inside');
    document.getElementById('curtain').classList.add('open-curtain');

    /*setTimeout(function(){
        document.location.href = 'home';
    },500);*/
}