<?php

include_once '../headers/headers.php';

$session = new Session();
if (!$session->isAuthenticated()) {
    $menu = 'login';
} else {
    $menu = 'album';
    $albumTitle = intval(preg_replace('/[^0-9]/', '', basename($_SERVER['REQUEST_URI']))) + 1;
    if ($albumTitle < 1 || $albumTitle > 8) $albumTitle = 1;
}

if (!empty($_POST)) {
    $Album = new AlbumModel();
    $FileAction = new FileAction();
    if ($_POST['action'] === 'getCategoryNames') {
        $dirPath = RELATIVE_PATH['storage'] . 'photos_compressed/';
        $files = array_values(array_diff(scandir($dirPath), array('.', '..')));
        $response = [];
        foreach ($files as $file) {
            //if ($file !== '07-Corbeille') {
            $element = new stdClass();
            $element->title = $file;
            $element->mini_photo = $Album->getMiniPhotoByCategoryTitle($file);
            $response[] = $element;
            //}
        }
        header('Content-type: application/json');
        echo json_encode($response);
    } elseif ($_POST['action'] === 'getPhotoNames') {
        $categoryTitle = $Album->getAlbumTitleByCategoryId($_POST['albumId']);
        $dirPath = RELATIVE_PATH['storage'] . 'photos_compressed/' . $categoryTitle . '/';
        $files = array_values(array_diff(scandir($dirPath), array('.', '..')));
        $Response = new stdClass();
        $Response->photos = $files;
        $Response->path = 'photos_compressed/' . $categoryTitle . '/';
        $Response->sprite = 'sprite' . $_POST['albumId'];
        $Response->path_mini = 'photos_mini/' . $categoryTitle . '/';
        $files = $FileAction->getAllFilesInDirectory(RELATIVE_PATH['storage'] . 'photos_mini/' . $categoryTitle);
        $miniPhotoMarginLeft = [];
        $miniPhotoWidth = [];
        $sumMarginLeft = 0;
        $w = 0;
        $marginLeft = 0;
        foreach ($files as $file) {
            $sumMarginLeft += $w;
            $miniPhotoMarginLeft[] = $sumMarginLeft;
            list($w) = getimagesize(RELATIVE_PATH['storage'] . 'photos_mini/' . $categoryTitle . '/' . $file);
            $miniPhotoWidth[] = $w;
        }
        $Response->miniPhotoWidth = $miniPhotoWidth;
        $Response->miniPhotoMarginLeft = $miniPhotoMarginLeft;
        $Event = new EventModel();
        $Event->addEvent('open_' . $_POST['albumId']);
        header('Content-type: application/json');
        echo json_encode($Response);
    } elseif ($_POST['action'] === 'deletePhoto') {
        $old_path = ABSOLUTE_PATH . '/' . $_POST['path'];
        if (file_exists($old_path)) {
            // Photo taille normale
            $old_path = ABSOLUTE_PATH . '/' . $_POST['path'];
            $parts = explode("/", $_POST['path']);
            $new_path = ABSOLUTE_PATH . '/' . $parts[0] . '/' . $parts[1] . '/' . '07-Corbeille' . '/' . $parts[3];
            rename($old_path, $new_path);
            // Photo miniature
            $old_path_mini = ABSOLUTE_PATH . '/' . $_POST['path_mini'];
            $parts_mini = explode("/", $_POST['path_mini']);
            $new_path_mini = ABSOLUTE_PATH . '/' . $parts_mini[0] . '/' . $parts_mini[1] . '/' . '07-Corbeille' . '/' . $parts_mini[3];
            rename($old_path_mini, $new_path_mini);
        }
    }
    exit();
}


$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . 'layout.phtml';