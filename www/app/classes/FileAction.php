<?php


class FileAction
{
    const OFFSET = 41;

    public function getAllFilesInDirectory($path)
    {
        return array_values(array_diff(scandir($path), array('.', '..')));
    }

    function renameFile($dirPath, $nameBefore, $nameAfter)
    {
        if (!file_exists($dirPath . $nameBefore)) {
            return ["error", substr($dirPath . $nameBefore, self::OFFSET) . " not found to rename"];
        } else {
            rename($dirPath . $nameBefore, $dirPath . $nameAfter);
            return ["ok", substr($dirPath . $nameBefore, self::OFFSET) . " rename to " . $nameAfter];
        }
    }

    function renameAllFilesInDirectory($dirPath, $suffix, $typeOfFile)
    {
        $messages = [];
        if (!is_dir($dirPath)) {
            return ["error", substr($dirPath, self::OFFSET) . " not found to rename files"];
        } else {
            $fileNames = scandir($dirPath);
            foreach ($fileNames as $fileName) {
                if ($fileName !== "." && $fileName !== "..") {
                    $messages[] = $this->renameFile($dirPath, $fileName, basename($fileName, $typeOfFile) . $suffix . $typeOfFile);
                }
            }
            $messages[] = ["ok", "All files from directory " . substr($dirPath, self::OFFSET) . " renamed"];
            return $messages;
        }
    }

    function generateMiniPhotos($path_origin, $path_destination, $suffix, $max_height, $max_size, $quality)
    {
        $files = array_values(array_diff(scandir($path_origin), array('.', '..')));
        foreach ($files as $file) {
            // type d'extension
            $ext = substr($file, strrpos($file, '.') + 1);
            // nom du fichier
            $fileNameExplode = explode('.', $file);
            $fileName = $fileNameExplode[0];
            for ($i = 1; $i < count($fileNameExplode) - 1; $i++) {
                $fileName .= "." . $fileNameExplode[$i];
            }
            // image source
            $image_source_path = $path_origin . $file;
            // indique la cible
            $image_target_path = $path_destination . $fileName . $suffix . '.' . $ext;
            // Recherche si rotation de l'image source
            $exif = exif_read_data($image_source_path);
            $orientation = key_exists('Orientation', $exif) ? $exif['Orientation'] : 1;

            // Redimensionne l'image
            $image = imagecreatefromstring(file_get_contents($image_source_path));
            if ($orientation === 3) {
                $image = imagerotate($image, 180, 0);
            } elseif ($orientation === 6) {
                $image = imagerotate($image, -90, 0);
            } elseif ($orientation === 8) {
                $image = imagerotate($image, 90, 0);
            }
            $width_before = imagesx($image);
            $height_before = imagesy($image);
            if ($max_height !== null) {
                $finalWidthLayer = $max_height / $height_before * $width_before;
                $finalHeightLayer = $max_height;
            } elseif ($width_before >= $height_before && $width_before > $max_size) {
                $finalWidthLayer = $max_size;
                $finalHeightLayer = $max_size / $width_before * $height_before;
            } elseif ($width_before < $height_before && $height_before > $max_size) {
                $finalWidthLayer = $max_size / $height_before * $width_before;
                $finalHeightLayer = $max_size;
            } else {
                // Photo plus petite que la taille mini, donc on ne change pas
                $finalWidthLayer = $width_before;
                $finalHeightLayer = $height_before;
            }
            $image = imagescale($image, $finalWidthLayer, $finalHeightLayer);
            imagejpeg($image, $image_target_path, $quality);
        }
    }

    function generateSprite($path)
    {
        if (file_exists($path . '/sprite.jpg')) {
            unlink($path . '/sprite.jpg');
        }
        ini_set("memory_limit", "256M");
        $files = $this->getAllFilesInDirectory($path);
        $width = 0;
        $height = 100;
        foreach ($files as $file) {
            list($w) = getimagesize($path . '/' . $file);
            $width += $w;
        }
        $background = imagecreatetruecolor($width, $height);
        $position_x = 0;
        foreach ($files as $file) {
            list($w, $h) = getimagesize($path . '/' . $file);
            $image_mini = imagecreatefromstring(file_get_contents($path . '/' . $file));
            imagecopymerge($background, $image_mini, $position_x, 0, 0, 0, $w, $h, 100);
            $position_x += $w;
        }
        imagejpeg($background, $path . '/sprite.jpg', 95);
    }
}