<?php

include_once '../headers/headers.php';

$session = new Session();

if (!empty($_POST)) {
    if ($_POST['action'] === 'login') {
        $password = $_POST['password'];
        $correct_password = '$2y$10$tMUFQ24knYE04oCRS65GJ.ObmTFOsWNkKc.d/QUKnO6J68oaGthFW';
        if (password_verify($password, $correct_password)) {
            $User = new UserModel();
            $Login = new LoginModel();
            $email = $_POST['email'];
            $user = $User->getUserByEmail($email);
            if (empty($user)) {
                $userId = $User->createNewUser($_POST);
                $user = $User->getUserById($email);
            }
            $session->create($user);
            echo json_encode(true);
        } else {
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
