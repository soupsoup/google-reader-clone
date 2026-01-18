# Reader - Google Reader Clone

A modern RSS feed reader inspired by Google Reader, built with React, TypeScript, and Supabase.

## Features

- **Clean Three-Pane Layout** - Familiar Google Reader interface with folders, feed list, and article view
- **Keyboard Navigation** - Full keyboard support (j/k, s, m, Shift+A, and more)
- **Folder Organization** - Organize feeds into folders
- **Read/Unread Tracking** - Track which articles you've read
- **Star Articles** - Save important articles for later
- **OPML Import** - Import your feeds from other RSS readers
- **Dark Mode** - Toggle between light and dark themes
- **Real-time Updates** - Automatic feed refresh

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `k` | Next / Previous article |
| `o` / `Enter` | Open article in new tab |
| `s` | Star / Unstar article |
| `m` | Mark read / unread |
| `Shift + A` | Mark all as read |
| `g h` | Go to Home |
| `g a` | Go to All Items |
| `g s` | Go to Starred |
| `/` | Focus search |
| `a` | Add feed |
| `r` | Refresh |

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Query, React Router
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Build**: Vite

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from the project settings

### 2. Set Up the Database

Run the SQL migration in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

### 3. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the feed fetcher function
supabase functions deploy fetch-feeds
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Project Structure

```
src/
├── components/
│   ├── layout/          # App shell, header, sidebar
│   ├── feeds/           # Feed management components
│   └── articles/        # Article list and view
├── hooks/               # Custom React hooks
├── lib/                 # Supabase client, auth context
├── pages/               # Route pages
└── types/               # TypeScript types

supabase/
├── migrations/          # Database schema
└── functions/           # Edge functions for feed fetching
```

## Usage

1. **Register/Login** - Create an account or sign in
2. **Add Feeds** - Click "Add Feed" and enter an RSS/Atom URL
3. **Import OPML** - Import your existing feeds from other readers
4. **Organize** - Create folders to organize your feeds
5. **Read** - Use keyboard shortcuts or click to navigate articles

## Sample Feeds to Try

- Hacker News: `https://hnrss.org/frontpage`
- The Verge: `https://www.theverge.com/rss/index.xml`
- TechCrunch: `https://techcrunch.com/feed/`
- Ars Technica: `https://feeds.arstechnica.com/arstechnica/index`

## License

MIT
