'use strict';

let menu = new Vue({
    el: '#menu',
    data: {
        path: 'storage/photos_category/',
    },
    template: `<nav id="navBar">
                <ul>
                    <li>
                        <div id="logoutButton" @click="logout">
                            <span>Sortie</span>
                        </div>
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