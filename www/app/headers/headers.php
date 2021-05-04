<?php

/* Definition des chemins relatif et absolu */
define('ABSOLUTE_PATH', substr(__DIR__, 0, -11));
const DIRECTORY_SITE = 'www/';
const RELATIVE_PATH = [
    'controllers' => ABSOLUTE_PATH . 'app/controllers/',
    'models' => ABSOLUTE_PATH . 'app/models/',
    'classes' => ABSOLUTE_PATH . 'app/classes/',
    'views' => ABSOLUTE_PATH . 'app/views/',
    'headers' => ABSOLUTE_PATH . 'app/headers/',
    'database' => ABSOLUTE_PATH . 'app/database/',
    'storage' => ABSOLUTE_PATH . 'storage/',
    'css' => DIRECTORY_SITE . 'public/css/',
    'images' => DIRECTORY_SITE . 'public/images/',
    'js' => DIRECTORY_SITE . 'public/js/',
];


/* Include des modèles */
include RELATIVE_PATH['models'] . 'UserModel.php';
include RELATIVE_PATH['models'] . 'AlbumModel.php';
include RELATIVE_PATH['models'] . 'EventModel.php';

/* Include des classes */
include RELATIVE_PATH['classes'] . 'Session.php';
include RELATIVE_PATH['classes'] . 'FileAction.php';

/* Fonction pour charger une icône en svg */
function icon($name, $dimensions)
{
    return '<svg class="icons i_' . $dimensions . '" role="img"><use xlink:href="public/icons/fonts-defs.svg#' . $name . '"></use></svg>';
}