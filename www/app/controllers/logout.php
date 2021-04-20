<?php

include_once '../headers/headers.php';

$session = new Session();
$Event = new EventModel();
$Event->addEvent('logout_' . $session->getId());
$session->destroy();

$menu = 'login';
$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . 'layout.phtml';
exit;