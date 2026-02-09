# Plex Playlist UI

A modern, feature-rich web application for managing Plex music playlists. Built with Vue 3, PrimeVue, and designed to work both as a standalone application and as a micro-frontend module.

## 🎵 Features

- **Playlist Management**: View, create, edit, and delete music playlists in your Plex library
- **Track Operations**: Add, remove, and reorder tracks within playlists
- **Smart Playlists**: Full support for both standard and smart playlists
- **Track Ratings**: Rate tracks directly from the playlist interface
- **Search & Filter**: Quickly find playlists and tracks
- **Modern UI**: Beautiful, responsive interface built with PrimeVue and Tailwind CSS
- **Micro-Frontend Ready**: Can be embedded into other applications via Module Federation
- **Dark Mode**: Built-in dark theme support

## 🏗️ Architecture

This application is designed with flexibility in mind:

- **Standalone Mode**: Run as an independent web application with its own server
- **Micro-Frontend Mode**: Embed into other applications (e.g., music management dashboards) using Module Federation
- **API Proxy**: Built-in Hono server proxies requests to your Plex server, handling authentication and CORS

### Technology Stack

- **Frontend**: Vue 3 (Composition API), PrimeVue 4, Tailwind CSS
- **Build Tool**: Vite 7
- **Server**: Hono (lightweight web framework)
- **Module Federation**: @originjs/vite-plugin-federation
- **Icons**: PrimeIcons

## 📋 Prerequisites

- Node.js 18+ and npm
- A Plex Media Server with music library
- Plex authentication token (see [Configuration](#configuration))

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/adbakke/plex-playlist-ui.git
   cd plex-playlist-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Plex server details (see [Configuration](#configuration))

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Plex Server Configuration
PLEX_URL=http://localhost:32400
PLEX_TOKEN=your-plex-token-here
PORT=3003
```

### Getting Your Plex Token

1. Log into your Plex server web interface
2. Open browser developer tools (F12)
3. Go to the Network tab
4. Navigate to any page in Plex
5. Look for requests to `plex.tv` - the token will be in the URL or headers
6. Alternatively, use [plex.tv/api](https://www.plex.tv/api) to generate a token

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PLEX_URL` | Your Plex server URL | `http://localhost:32400` |
| `PLEX_TOKEN` | Plex authentication token | *required* |
| `PORT` | Port for the standalone server | `3002` |

## 🎮 Usage

### Standalone Mode

Run the application as a standalone web server:

```bash
# Development mode
npm run dev

# Production build and serve
npm run web

# Or build and start separately
npm run build
npm start
```

The application will be available at `http://localhost:3002` (or your configured PORT).

### As a Micro-Frontend

This application can be embedded into other applications using Module Federation.

#### Building for Federation

```bash
npm run build
```

This creates a `dist/` directory with `remoteEntry.js` that exposes the `./mount` module.

#### Consuming in a Host Application

```javascript
// In your host application (e.g., Nuxt, Next.js, etc.)
const remote = await import('http://localhost:3002/assets/remoteEntry.js')
const mountModule = await remote.get('./mount')
const { mount } = mountModule()

// Mount into a DOM element
const mountEl = document.getElementById('plex-playlist-container')
const handle = mount(mountEl, { 
  apiBase: '/api/plex' // Optional: customize API base path
})

// Later, unmount when done
handle.unmount()
```

#### API Base Path Configuration

When used as a micro-frontend, you can configure the API base path:

- **Standalone**: Uses `/api` (proxied to Plex)
- **Federated**: Typically uses `/api/plex` (proxied through host app)

The `apiBase` option in the `mount()` function allows you to customize this.

## 🛠️ Development

### Project Structure

```
plex-playlist-ui/
├── src/
│   ├── components/
│   │   ├── PlaylistApp.vue      # Main application component
│   │   └── PlaylistTable.vue    # Playlist table with track management
│   ├── composables/
│   │   └── usePlex.js           # Plex API client composable
│   ├── App.vue                  # Standalone app entry
│   ├── main.js                  # Standalone app initialization
│   ├── mount.js                 # Micro-frontend mount function
│   └── style.css                # Global styles
├── server.js                     # Hono server (API proxy + static serving)
├── vite.config.js               # Vite + Module Federation config
└── package.json
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Build for production |
| `npm run web` | Build and start production server |
| `npm start` | Start production server (requires build) |
| `npm run preview` | Preview production build |

### Development Server

The Vite dev server includes:
- Hot Module Replacement (HMR)
- API proxy to Plex server (configured in `vite.config.js`)
- Automatic token injection for Plex API requests

## 🔌 API Proxy

The application includes a built-in API proxy server (`server.js`) that:

- Proxies `/api/*` requests to your Plex server
- Automatically injects the `X-Plex-Token` header
- Handles CORS for cross-origin requests
- Serves the built frontend as static files

### Proxy Behavior

- **Request**: `GET /api/playlists` → Proxied to `{PLEX_URL}/playlists`
- **Headers**: Automatically adds `X-Plex-Token` and `Accept: application/json`
- **Methods**: Supports GET, POST, PUT, DELETE

## 🎨 Styling

The application uses:
- **PrimeVue Aura Theme**: Modern, customizable component library
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: Automatically respects `.dark` class on parent elements
- **Custom CSS Variables**: Defined in `src/style.css` for theming

## 📦 Module Federation

This application is configured as a Module Federation remote:

- **Name**: `plexPlaylistUI`
- **Exposed Module**: `./mount`
- **No Shared Dependencies**: Bundles its own Vue and PrimeVue to avoid version conflicts

### Why No Shared Modules?

The application bundles its own Vue and PrimeVue dependencies to:
- Avoid version conflicts with host applications
- Ensure consistent behavior across different host environments
- Simplify deployment and reduce host app complexity

## 🔒 Security

- **Environment Variables**: Sensitive configuration stored in `.env` (not committed)
- **Token Handling**: Plex tokens are never exposed to the client
- **CORS**: Configured for development; adjust for production
- **API Proxy**: Server-side proxy prevents direct client access to Plex

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Vue 3 Composition API best practices
- Use TypeScript where possible (future migration)
- Maintain consistent code style
- Add comments for complex logic
- Update documentation for new features

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Plex](https://www.plex.tv/) for the amazing media server platform
- [Vue.js](https://vuejs.org/) for the reactive framework
- [PrimeVue](https://primevue.org/) for the component library
- [Vite](https://vitejs.dev/) for the build tooling
- [Hono](https://hono.dev/) for the lightweight server framework

## 📞 Support

For issues, questions, or contributions, please open an issue on [GitHub](https://github.com/adbakke/plex-playlist-ui/issues).

---

**Made with ❤️ for the Plex community**
