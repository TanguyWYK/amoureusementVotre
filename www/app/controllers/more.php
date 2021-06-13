<?php

include_once '../headers/headers.php';

$session = new Session();
if (!$session->isAuthenticated()) {
    $menu = 'login';
}else{
    $menu = 'more';
    $User = new UserModel();
    $more_photos = $User->getMorePhotoStatus($session->getId());
    if (!empty($_POST)) {
        if($_POST['action'] === 'updateMorePhotoStatus'){
            $User->updateMorePhotoStatus($session->getId(),$_POST['more_photos']);
        }
    }
}




$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . 'layout.phtml';