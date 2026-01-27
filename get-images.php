<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Load images from JSON file
$imagesFile = 'gallery-data.json';
$images = [];

if (file_exists($imagesFile)) {
    $images = json_decode(file_get_contents($imagesFile), true) ?? [];
}

// Return images
echo json_encode([
    'success' => true,
    'images' => $images,
    'count' => count($images)
]);
?>