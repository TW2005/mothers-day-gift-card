# Mother's Day Animated Card

A shareable single-page Mother's Day card with watercolor-inspired flower animations and a responsive 3-photo collage.

## Customize content

Edit `card.config.js`:

- `recipientName`
- `headline`
- `messageLines`
- `signature`
- `photos` (exactly 3 image paths)
- `access` (password gate settings)
- `palette`

## Add your real photos

1. Put your photos in `assets/photos/`.
2. Update `photos` in `card.config.js` with the file names.
3. Keep exactly three entries in the `photos` array.

If a photo path is empty or invalid, the card shows a graceful fallback tile.

## Password gate

Set these in `card.config.js` under `access`:

- `enabled`: `true` or `false`
- `code`: passcode required to open the card
- `title`, `description`, `buttonLabel`, `errorText`: prompt text

This is a lightweight client-side gate for privacy, not strong security.

## Preview locally

From this folder:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Deploy to GitHub Pages

1. Create a new GitHub repo.
2. Push this project to `main`.
3. In GitHub repo settings, enable Pages from branch `main` and folder `/ (root)`.
4. Your link will be:

```text
https://<your-username>.github.io/<repo-name>/
```
