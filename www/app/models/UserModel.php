<?php


class UserModel
{
    public function createNewUser($user)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("INSERT INTO " . $db_prefix . "users(email,password, date_creation, date_last_login)
					   VALUES (?,?,NOW(),NOW())");
        $query->execute([
            $user['email'],
            password_hash($user['password'], PASSWORD_BCRYPT),
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
        $query = $db->prepare("SELECT id,email FROM " . $db_prefix . "users
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

}