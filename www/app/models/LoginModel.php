<?php

class LoginModel
{
    public function getUserByEmail($email)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT id, id_company, password, first_name, last_name, phone, email,date_creation, 
                                date_last_login, status, change_first_name, change_last_name,
                                user_config.language, user_config.theme, user_config.custom_scripts FROM `users` 
                               LEFT JOIN user_config ON user_config.id_user=users.id
					           WHERE email=?");
        $query->execute([
            $email
        ]);
        return $query->fetch();
    }

    public function getUserById($userId)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT id, id_company, password, first_name, last_name, phone, email,date_creation, 
                                date_last_login, status, change_first_name, change_last_name,
                                user_config.language, user_config.theme, user_config.custom_scripts FROM `users` 
                               LEFT JOIN user_config ON user_config.id_user=users.id
					           WHERE id=?");
        $query->execute([
            $userId
        ]);
        return $query->fetch();
    }

    public function connectUser($userId, $licence)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $checkSum = time();
        if ($licence === '0') {
            return $checkSum;
        } else {
            $licenceCheckSum = json_decode($licence['check_sum']);
            array_shift($licenceCheckSum);
            $licenceCheckSum[] = $checkSum;
            $query = $db->prepare("UPDATE licences SET check_sum = ?
					   WHERE id_user=?");
            $query->execute([
                json_encode($licenceCheckSum),
                $userId,
            ]);
            return $checkSum;
        }

    }

    public function checkMultiLog($userId, $checkSum)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        if ($userId !== '0') {
            $query = $db->prepare("SELECT check_sum FROM licences
					   WHERE id_user=?");
            $query->execute([
                $userId
            ]);
        } else {
            return [$checkSum];
        }
        return json_decode($query->fetch()['check_sum']);
    }

    public function checkIfUserExist($email)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT id FROM users
					   WHERE email=?");
        $query->execute([
            $email
        ]);
        if ($query->fetch() === false) {
            return false;
        } else {
            return true;
        }
    }
}