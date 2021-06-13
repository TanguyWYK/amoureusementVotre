<?php


class UserModel
{
    public function createNewUser($user)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("INSERT INTO " . $db_prefix . "users(email,password, date_creation, date_last_login, more_photos)
					   VALUES (?,?,NOW(),NOW(),?)");
        $query->execute([
            $user['email'],
            password_hash($user['password'], PASSWORD_BCRYPT),
            0,
        ]);
        // Enregistre le dernier id_user créé
        $query = $db->prepare("SELECT MAX(id) AS 'lastId' FROM " . $db_prefix . "users
                                WHERE 1");
        $query->execute();
        // Renvoi le numéro de user créé
        return $query->fetch()['lastId'];
    }

    public function getUserByEmail($email)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT id,email,more_photos FROM " . $db_prefix . "users
                                WHERE email=?");
        $query->execute([
            $email
        ]);
        return $query->fetch();
    }

    public function getUserById($email)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT id,email FROM " . $db_prefix . "users
                                WHERE email=?");
        $query->execute([
            $email
        ]);
        return $query->fetch();
    }

    public function getMorePhotoStatus($userId){
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT more_photos FROM " . $db_prefix . "users
                                WHERE id=?");
        $query->execute([
            $userId
        ]);
        return $query->fetch()['more_photos'];
    }

    public function setUserLastConnection($userId)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("UPDATE " . $db_prefix . "users SET date_last_login=NOW() WHERE id=?");
        $query->execute([
            $userId,
        ]);
    }

    public function updateMorePhotoStatus($userId,$more_photos){
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("UPDATE " . $db_prefix . "users SET more_photos=?
                                WHERE id=?");
        $query->execute([
            $more_photos,
            $userId,
        ]);
    }

}