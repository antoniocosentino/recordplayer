# Record player

A small, dependency-free album player for FTP hosting. Album selection uses `?albumId=your-album-id`. Supports cover artwork, playlists, English/Italian biographies, member credits, links, light/dark themes, and device media controls. No database or external fonts.

## Code and private content

This repository contains application code and fictional examples only. The following stay on your machine and are excluded from Git:

- `assets/`: real covers and audio
- `content/`: real album metadata and biographies
- `backend/settings.php`: private server paths
- `backend/check.php`: temporary setup diagnostic
- `dist/`: deployment output, which can contain private settings

Do not force-add ignored files. Git ignore rules do not remove files already committed. Before your first commit, review `git status --short` and `git diff --cached`. Back up private content separately; Git does not back it up.

## Setup

Requires Node 20+. No package installation is necessary. PHP mode requires PHP 7.4+ on your host.

1. Copy `examples/albums.example.json` to `content/albums.json` (create the directory).
2. Replace the fictional fields with your album data. Add matching covers and MP3s under `assets/<album-id>/`.
3. Choose the catalog endpoint in `config.js`:
   - Static/local preview: `export const catalogUrl = './content/albums.json';`
   - PHP hosting: `export const catalogUrl = './backend/catalog.php';` (current default).
4. For PHP, copy `backend/settings.example.php` to `backend/settings.php` and configure your private server paths.

```sh
npm run dev
npm test
npm run build
```

The Node preview is at `http://127.0.0.1:4173` and serves static mode only. It does not execute PHP. Playback tests use fictional fixtures; the additional local asset check runs only when your private catalog is installed.

## Album format

The JSON catalog has `defaultAlbum` and `albums` fields. Each album is keyed by the unique ID used in its URL. See `examples/albums.example.json` for the full structure.

- Cover and track paths resolve relative to the frontend page.
- Track IDs must be unique within an album. Duration is in seconds.
- Biography fields contain arrays of plain-text paragraphs by language (`en` / `it`). HTML is escaped.
- No album parameter opens the default release. Unknown IDs show available releases.

Only the selected audio loads after pressing play. Previous/next, automatic advance, seeking, and keyboard controls are supported. Space toggles playback and Left/Right switch tracks when focus is outside an interactive control. Language and theme preferences persist locally.

## FTP deployment

Upload the contents of `dist/` to your public player directory, preserving its structure. No URL rewriting is needed. Example:

`https://example.com/recordplayer/?albumId=demo-one`

Use a trailing slash before the query string for correct relative asset resolution.

### PHP mode

1. Put your catalog and audio outside the public web root. Preserve the audio paths under your configured private `media_root`, such as `assets/demo-one/track-1.mp3`.
2. Keep the cover images publicly accessible under the frontend's `assets/` directory.
3. Set `catalog` and `media_root` in the ignored `backend/settings.php` to absolute server filesystem paths.
4. Select the PHP endpoint in `config.js` and run `npm run build`.
5. Upload `dist/`. In PHP mode, the build excludes all MP3s, the private catalog, and the temporary diagnostic. It includes your deployment settings; never commit this output.
6. Remove any previously uploaded public catalog or audio copies. Upload the private content separately to its private location.
7. Check that `backend/catalog.php` returns masked streaming URLs, then verify playback and seeking. Delete `backend/check.php` from the server if used during setup.

The public PHP endpoints must be able to read the private files. Byte-range requests are supported for seeking. All default endpoint paths use the same origin, so CORS configuration is unnecessary.

Path masking hides the underlying filename and storage path. It does not prevent downloading: a listener can save the audio returned by the stream endpoint. Public track names and biographies necessarily reach the browser.

### Static mode

Set the static catalog URL, then build. The output includes real JSON and audio for direct public hosting. These files are still excluded from Git because the entire build directory is ignored.
