# Foogle Reader

A modern, open-source RSS feed reader inspired by Google Reader. Built with React, TypeScript, and Supabase.

## Features

- **Feed Management**: Subscribe to RSS/Atom feeds, organize them into folders, and manage your subscriptions
- **Article Reading**: Clean, distraction-free reading experience with full article content
- **Smart Organization**:
  - View all articles from all feeds
  - Browse by individual feed or folder
  - Star articles for later reading
  - Track read/unread status
- **Full-text Search**: Search across article titles and content
- **Customizable UI**:
  - Three layout modes (side-by-side, top-and-bottom, modal)
  - Adjustable font sizes
  - Dark mode support
  - Collapsible sidebar
- **Keyboard Shortcuts**: Google Reader-style keyboard navigation for power users
- **Auto-refresh**: Keep your feeds up-to-date automatically

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: TanStack React Query
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (or local Supabase CLI)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/google-reader-clone.git
cd google-reader-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Run the migrations in `supabase/migrations/` to create the database schema
- Deploy the edge function in `supabase/functions/fetch-feeds/`

5. Start the development server:
```bash
npm run dev
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `j` / `↓` | Next article |
| `k` / `↑` | Previous article |
| `o` / `Enter` | Open article |
| `s` | Star/unstar article |
| `m` | Mark as read/unread |
| `a` | Add new feed |
| `Shift+a` | Mark all as read |
| `/` | Search |
| `r` | Refresh all feeds |
| `Esc` | Close article modal |
| `g h` | Go home (All Items) |
| `g a` | Go to All Items |
| `g s` | Go to Starred |

## Database Schema

- **feeds**: Global feed registry (shared across users)
- **articles**: Article content (global, linked to feeds)
- **user_feeds**: User subscriptions with custom titles and folder organization
- **user_articles**: User-specific article state (read/starred status)
- **folders**: User-created feed folders

## Architecture

Foogle Reader uses a modern serverless architecture:

- **Frontend**: React SPA with Vite for fast development and optimized builds
- **Authentication**: Supabase Auth with email/password support
- **Database**: PostgreSQL with Row Level Security (RLS) for data protection
- **Feed Fetching**: Supabase Edge Functions parse RSS/Atom feeds and store articles
- **Caching**: React Query manages server state and caching for optimal performance

## Development

### Run from source

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

Inspired by the late, great Google Reader. Built as a tribute to the best RSS reader ever made.
