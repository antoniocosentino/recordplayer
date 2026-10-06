<?php
$settings = require __DIR__ . '/settings.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
$catalog = json_decode(@file_get_contents($settings['catalog']), true);
if (!is_array($catalog) || !isset($catalog['albums'])) {
    http_response_code(500); echo json_encode(['error' => 'Catalog unavailable']); exit;
}
foreach ($catalog['albums'] as $id => &$album) {
    foreach ($album['tracks'] as &$track) {
        $track['src'] = './backend/stream.php?albumId=' . rawurlencode($id) . '&trackId=' . rawurlencode($track['id']);
    }
    unset($track);
}
unset($album);
echo json_encode($catalog, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
