<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$imageId = $input['id'] ?? null;

if (!$imageId) {
    http_response_code(400);
    echo json_encode(['error' => 'Image ID required']);
    exit;
}

// Load existing images
$imagesFile = 'gallery-data.json';
$images = [];
if (file_exists($imagesFile)) {
    $images = json_decode(file_get_contents($imagesFile), true) ?? [];
}

// Find and remove image
$imageToDelete = null;
$updatedImages = [];

foreach ($images as $image) {
    if ($image['id'] == $imageId) {
        $imageToDelete = $image;
    } else {
        $updatedImages[] = $image;
    }
}

if (!$imageToDelete) {
    http_response_code(404);
    echo json_encode(['error' => 'Image not found']);
    exit;
}

// Delete physical file
if (file_exists($imageToDelete['url'])) {
    unlink($imageToDelete['url']);
}

// Save updated images list
file_put_contents($imagesFile, json_encode($updatedImages, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'message' => 'Image deleted successfully'
]);
?>