'use strict';

let menu = new Vue({
    el: '#menu',
    data: {
        path: 'storage/photos_category/',
    },
    template: `<nav id="navBar">
                <ul>
                <li id="logoutButton" @click="logout" title="Sortie">
                    <img src="www/public/images/site/pop_corn.png" width="100px">       
                </li>
                </ul>     
               </nav>`,
    methods: {
        logout() {
            postXHR('logout', {
                action: 'logout',
            }).then(function () {
                window.location = 'home';
            });
        }
    }
});