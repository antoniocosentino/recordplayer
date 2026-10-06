# Record player

A small, dependency-free album player for FTP hosting. Album selection uses `?albumId=your-album-id`. Supports cover artwork, playlists, English/Italian biographies, member credits, links, light/dark themes, and device media controls. No database or external fonts.

The current deployment uses PHP mode. The header contains only language and theme controls, with no home navigation. Album covers display as uncropped squares. PHP catalog loading, playback, and seeking have been verified on the deployment host.

## Code and private content

This repository contains application code and fictional examples only. The following stay on your machine and are excluded from Git:

- `assets/`: real covers and audio
- `content/`: real album metadata and biographies
- `backend/settings.php`: private server paths
- `backend/check.php`: temporary setup diagnostic
- `dist/`: deployment output, which can contain private settings
- `DEPLOYMENT.local.md`: optional private handoff with actual deployment paths

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

## Picking this up later

A fresh Git clone contains no real albums, audio, covers, or server settings. Restore `assets/`, `content/albums.json`, and `backend/settings.php` from your separate private backup before building the real player. Also back up `DEPLOYMENT.local.md` if you use it; it records deployment-specific details without publishing them.

The example JSON is a template only: it does not include playable audio or cover files. Provide your own assets to preview it. Running `npm test` on a code-only clone works without real content; the local asset check is skipped.

### Update the interface

1. Edit `index.html`, `styles.css`, or `app.js`.
2. Run `npm test` and `npm run build`.
3. Upload the changed frontend files from `dist/` to the existing public player folder. For a full upload, preserve the PHP settings and check the configured catalog endpoint first.
4. Hard-refresh your browser if old styling or behavior remains cached.

Do not upload the repository root: upload build output. Never put real MP3s or the private catalog back in the public folder when using PHP mode.

### Update or add an album in PHP mode

1. Edit your local `content/albums.json`; add the album under its chosen URL ID and use unique track IDs within that album.
2. Place new MP3s and cover artwork in the corresponding local `assets/` folder. Set each track's duration in seconds.
3. Upload the updated JSON to the private catalog location configured in `backend/settings.php`.
4. Upload new MP3s beneath the private media root, preserving the paths from the JSON. Upload covers beneath the public frontend's `assets/` folder.
5. Open `?albumId=your-album-id` and verify playback and seeking.

Content-only edits do not require a frontend build. Committing code does not upload any changes to the FTP server; these are separate steps.

### Troubleshooting

- **Catalog unavailable:** verify the absolute catalog path, filename, PHP read permissions, and valid JSON. `media_root` is the parent beneath which paths such as `assets/demo-one/track-1.mp3` exist.
- **Catalog works but audio fails:** verify each track path under the private media root and PHP read permissions. The public streaming endpoint must remain reachable.
- **Local preview cannot load the catalog:** the Node server cannot run PHP. Temporarily select static mode in `config.js`, and restore PHP mode before building for the PHP host.
- **Missing files on a fresh clone:** restore your private backup or follow the example setup; ignored files are deliberately absent from GitHub.
- **Old direct MP3 links still work:** deleting MP3s from the new player does not remove copies hosted by older sites. Manage those copies separately.
