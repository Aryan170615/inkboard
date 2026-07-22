# Inkboard

A real-time, hand-drawn whiteboard. No login, no sign-up — open a board, share the link,
draw together. Built with Next.js (App Router), Tailwind CSS, Rough.js (the sketchy
rendering library Excalidraw itself is built on), and Liveblocks for live multiplayer.

## What's here

- **Landing page** (`/`) — product page with a "Start a board" action that creates a
  random room id and drops you straight into the canvas. No auth screen anywhere.
- **Canvas** (`/board/[roomId]`) — select, rectangle, ellipse, line, arrow, freehand pen,
  text, and eraser tools; a properties panel (stroke, fill, fill style, stroke width,
  roughness, opacity); live cursors and an online-avatars stack; export to PNG; invite
  link copy.

## Run it locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Get a free Liveblocks public key** — this is what powers the live multiplayer
   (cursors + shared shapes). Go to https://liveblocks.io/dashboard, create a project,
   and copy the key that starts with `pk_`. A public key (not a secret key) is the right
   choice here on purpose, since the app has no login to authenticate a user against.

3. **Add the key**

   ```bash
   cp .env.local.example .env.local
   # then paste your key into .env.local
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. Click "Start a board," then open the same `/board/...`
   URL in a second tab (or send it to a friend) to see live multiplayer in action.

## How a board works without an account

Every visitor is assigned a random guest name and color (e.g. "maya"), stored in
`localStorage` so it's consistent across reloads on the same device. There's no
database — the room id in the URL *is* the board. Anyone with the link can open and
draw on it; closing the tab doesn't delete anything, but there's also no list of
"your boards" since there's no account to attach one to.

## Known limitations / good next steps

- Selected shapes can be moved but not resized via handles yet.
- The canvas is viewport-sized — there's no infinite pan/zoom yet.
- Liveblocks' free tier is generous but rate-limited; for production traffic you'd want
  a paid plan or a self-hosted WebSocket sync layer.
- Shape history isn't persisted anywhere outside the live room — there's no "save and
  come back next month" beyond keeping the URL.

## Project structure

```
app/
  page.tsx                  landing page
  layout.tsx                fonts + metadata
  board/[roomId]/
    page.tsx                room route
    Room.tsx                Liveblocks RoomProvider wrapper
    Board.tsx                canvas engine (tools, sync, export)
components/
  Toolbar.tsx, PropertiesPanel.tsx, TopBar.tsx, Cursors.tsx
  landing/HeroSketch.tsx, StartBoardButton.tsx
lib/
  types.ts, utils.ts, rough-draw.ts, liveblocks.config.ts
```
