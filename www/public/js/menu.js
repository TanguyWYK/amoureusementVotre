'use strict';

let menu = new Vue({
    el: '#menu',
    data: {
        path: 'storage/photos_category/',
    },
    template: `<nav id="navBar">
                <ul>
                <li id="logoutButton" @click="logout">${icons('logout', '26x26')} <span>Déconnexion</span></li>
                </ul>     
               </nav>`,
    methods: {
        logout(){
            postXHR('logout', {
                action: 'logout',
            }).then(function(){
                window.location = 'home';
            });
        }
    }
});