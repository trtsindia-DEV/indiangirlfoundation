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

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded or upload error']);
    exit;
}

// Get form data
$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? '';

// Validate required fields
if (empty($title) || empty($description) || empty($category)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// File validation
$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
$maxSize = 5 * 1024 * 1024; // 5MB

if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, and WebP are allowed']);
    exit;
}

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Maximum size is 5MB']);
    exit;
}

// Create uploads directory if it doesn't exist
$uploadDir = 'uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_') . '_' . time() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

// Create image data
$imageData = [
    'id' => time(),
    'title' => htmlspecialchars($title),
    'description' => htmlspecialchars($description),
    'category' => htmlspecialchars($category),
    'filename' => $filename,
    'url' => $filepath,
    'uploadDate' => date('Y-m-d H:i:s')
];

// Load existing images
$imagesFile = 'gallery-data.json';
$images = [];
if (file_exists($imagesFile)) {
    $images = json_decode(file_get_contents($imagesFile), true) ?? [];
}

// Add new image to beginning of array
array_unshift($images, $imageData);

// Save updated images list
if (!file_put_contents($imagesFile, json_encode($images, JSON_PRETTY_PRINT))) {
    // If saving to JSON fails, delete the uploaded file
    unlink($filepath);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save image data']);
    exit;
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Image uploaded successfully',
    'image' => $imageData
]);
?>