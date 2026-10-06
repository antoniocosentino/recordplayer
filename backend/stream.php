<?php
// Resolve only catalog entries; never accept an arbitrary filename from the URL.
$settings = require __DIR__ . '/settings.php';
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    header('Allow: GET, HEAD'); http_response_code(405); exit;
}
$catalog = json_decode(@file_get_contents($settings['catalog']), true);
$albumId = $_GET['albumId'] ?? ''; $trackId = $_GET['trackId'] ?? '';
if (!is_string($albumId) || !is_string($trackId)) { http_response_code(400); exit; }
$tracks = $catalog['albums'][$albumId]['tracks'] ?? [];
$source = null;
foreach ($tracks as $track) { if ($track['id'] === $trackId) { $source = $track['src']; break; } }
$root = realpath($settings['media_root']);
$file = $source !== null && $root !== false ? realpath($root . DIRECTORY_SEPARATOR . $source) : false;
if (!$file || strpos($file, $root . DIRECTORY_SEPARATOR) !== 0 || !is_file($file) || strtolower(pathinfo($file, PATHINFO_EXTENSION)) !== 'mp3') {
    http_response_code(404); exit;
}
$size = filesize($file); $start = 0; $end = $size - 1;
$handle = @fopen($file, 'rb');
if (!$handle) { http_response_code(500); exit; }
header('Content-Type: audio/mpeg');
header('Content-Disposition: inline');
header('Accept-Ranges: bytes');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, max-age=3600');
if (isset($_SERVER['HTTP_RANGE'])) {
    if (!preg_match('/^bytes=(\d*)-(\d*)$/', trim($_SERVER['HTTP_RANGE']), $m) || ($m[1] === '' && $m[2] === '')) {
        header('Content-Range: bytes */' . $size); http_response_code(416); exit;
    }
    if ($m[1] === '') { $start = max(0, $size - (int)$m[2]); }
    else { $start = (int)$m[1]; if ($m[2] !== '') { $end = min($end, (int)$m[2]); } }
    if ($start > $end || $start >= $size || ($m[1] === '' && (int)$m[2] === 0)) {
        header('Content-Range: bytes */' . $size); http_response_code(416); exit;
    }
    http_response_code(206); header('Content-Range: bytes ' . $start . '-' . $end . '/' . $size);
}
header('Content-Length: ' . ($end - $start + 1));
if ($_SERVER['REQUEST_METHOD'] === 'HEAD') { fclose($handle); exit; }
while (ob_get_level()) { ob_end_clean(); }
fseek($handle, $start); $remaining = $end - $start + 1;
while ($remaining > 0 && !connection_aborted()) {
    $buffer = fread($handle, min(65536, $remaining));
    if ($buffer === false || $buffer === '') { break; }
    echo $buffer; $remaining -= strlen($buffer); flush();
}
fclose($handle);
