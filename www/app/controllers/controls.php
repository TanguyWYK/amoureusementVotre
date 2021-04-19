<?php

include_once '../headers/headers.php';
$session = new Session();


if (!empty($_POST) && $session->isAdmin()) {
    if ($_POST['action'] === 'renameFiles') {
        $FileAction = new FileAction();
        $message = [];
        $dirPath = ABSOLUTE_PATH . 'storage\photos\08-Riedisheim\\';
        $files = array_diff(scandir($dirPath), array('.', '..'));
        $i = 8000000;
        foreach ($files as $file) {
            //$message[] = $file;
            $message[] = $FileAction->renameFile($dirPath, $file, $i . '.jpg');
            $i += 1000;
        }
        header('Content-type: application/json');
        echo json_encode($message);
    } else if ($_POST['action'] === 'generateMiniPhotos') {
        $FileAction = new FileAction();
        $dirPath = ABSOLUTE_PATH . 'storage\photos\\';
        $directories = array_diff(scandir($dirPath), array('.', '..'));
        ini_set('max_execution_time', 3600);
        foreach ($directories as $directory) {
            if ($directory !== '08-Corbeille') {
                $path_origin = ABSOLUTE_PATH . 'storage\photos\\' . $directory . '\\';
                $path_destination = ABSOLUTE_PATH . 'storage\photos_compressed\\' . $directory . '\\';
                $FileAction->generateMiniPhotos($path_origin, $path_destination, '', null, 1980, 98);
                //$FileAction->generateMiniPhotos($path_origin, $path_destination, '_mini',100,100, 100);
            }
        }
    }
}
exit;