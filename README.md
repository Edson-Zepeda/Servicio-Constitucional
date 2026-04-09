# Publicaciones en Línea - UCOL

A modern React application built with Vite and TypeScript to rebuild the UCOL online publications portal (https://ww.ucol.mx/publicacionesenlinea/).

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Features

- **Header** - Displays the main title and university branding
- **Search Bar** - Advanced search with filters for:
  - Title
  - Author
  - Area
  - Language
  - ISBN
  - Format (Digital, Impreso, Audiolibro)
- **Publications List** - Grid display of publications with:
  - Book cover images
  - Title and authors
  - DOI links
  - Format badges
  - Brief descriptions
  - "Ver Más" links
- **Pagination** - Navigate through multiple pages of publications
- **Footer** - Contains:
  - About section
  - Contact information
  - Social media links
  - Purchase information
  - Quick links

## 🛠️ Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)

## 📦 Installation

1. Clone or navigate to the project directory:
   ```bash
   cd "Proyecto Final  SSC"
   ```

2. Dependencies are already installed. If you need to reinstall:
   ```bash
   npm install
   ```

## 🚀 Running the Project

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

### Production Build

Build the application for production:

```bash
npm run build
```

The optimized files will be in the `dist` folder.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 🧹 Code Quality

### Linting

Run ESLint to check for code issues:

```bash
npm run lint
```

### Formatting

Format code with Prettier:

```bash
npm run format
```

## 📁 Project Structure

```
proyecto-final-ssc/
├── public/
│   └── vite.svg              # Vite logo asset
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Header component
│   │   ├── Header.css        # Header styles
│   │   ├── SearchBar.tsx     # Search filter component
│   │   ├── SearchBar.css     # Search styles
│   │   ├── PublicationsList.tsx    # Publications grid
│   │   ├── PublicationsList.css    # List styles
│   │   ├── PublicationCard.tsx     # Individual publication card
│   │   ├── PublicationCard.css     # Card styles
│   │   ├── Footer.tsx        # Footer component
│   │   └── Footer.css        # Footer styles
│   ├── App.tsx               # Main App component
│   ├── App.css               # App styles
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript config
├── tsconfig.app.json         # TypeScript app config
├── tsconfig.node.json        # TypeScript node config
├── vite.config.ts            # Vite configuration
├── eslint.config.js          # ESLint configuration
├── .prettierrc               # Prettier configuration
└── README.md                 # This file
```

## 🎨 Customization

### Colors

The main colors are defined in `src/index.css` as CSS variables:

```css
:root {
  --primary-color: #8b0000;      /* UCOL red */
  --secondary-color: #333;       /* Dark gray */
  --background-color: #f5f5f5;   /* Light gray */
  --text-color: #333;            /* Text color */
  --border-color: #ddd;          /* Border color */
  --card-background: #fff;       /* Card background */
  --hover-color: #a00000;        /* Hover state */
}
```

### Adding Real Data

Currently, the app uses sample data. To connect to a real API:

1. Create a `services` folder in `src/`
2. Add API service functions
3. Update `PublicationsList.tsx` to fetch real data
4. Consider adding state management (e.g., Context API, Redux)

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 📝 Next Steps

To enhance this application, consider:

1. **API Integration** - Connect to a real backend API
2. **State Management** - Add Context API or Redux for global state
3. **Routing** - Add React Router for multiple pages
4. **Authentication** - Add user authentication if needed
5. **Search Functionality** - Implement actual search logic
6. **Responsive Images** - Replace placeholder images with real book covers
7. **Accessibility** - Add ARIA labels and keyboard navigation
8. **Testing** - Add unit and integration tests
9. **Internationalization** - Support multiple languages
10. **Dark Mode** - Add theme toggle functionality

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. You can specify a different port in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

### Module Not Found Errors

If you encounter module errors, try:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is for educational purposes as part of the SSC Final Project.

## 👥 Authors

Created for the Universidad de Colima - SSC Final Project

## 🙏 Acknowledgments

- Original design inspired by [UCOL Publicaciones en Línea](https://ww.ucol.mx/publicacionesenlinea/)
- Universidad de Colima
