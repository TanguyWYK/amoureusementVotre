<?php

include_once '../headers/headers.php';

$session = new Session();

if (!empty($_POST)) {
    if ($_POST['action'] === 'login') {
        $password = $_POST['password'];
        $correct_password = '$2y$10$Ec5i8MgTxrYNDuaKDd8MBe7uGOSVR4Oh4hUiEP.96yu8wvReo6k8S';
        $Event = new EventModel();
        if (password_verify($password, $correct_password)) {
            $User = new UserModel();
            $email = $_POST['email'];
            $user = $User->getUserByEmail($email);
            if (empty($user)) {
                $userId = $User->createNewUser($_POST);
                $user = $User->getUserById($email);
            }
            $session->create($user);
            $Event->addEvent('login_' . $session->getId());
            header('Content-type: application/json');
            echo json_encode(true);
            exit();
        } else {
            $Event->addEvent('wrong_password');
            header('Content-type: application/json');
            echo json_encode(false);
            exit();
        }
    }
}
$menu = 'login';
$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . 'layout.phtml';
exit;
