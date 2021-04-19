<?php


class AlbumModel
{
    function getMiniPhotoByCategoryTitle($title)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT name_photo FROM category_image 
					           WHERE category_title=?");
        $query->execute([
            $title
        ]);
        return $query->fetch()['name_photo'];
    }

    function getAlbumTitleByCategoryId($id)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT category_title FROM category_image 
					           WHERE id=?");
        $query->execute([
            $id
        ]);
        return $query->fetch()['category_title'];
    }
}