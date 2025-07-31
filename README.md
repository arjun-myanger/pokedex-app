# 🔴 Pokédex App

A modern, responsive Pokédex application built with Next.js and TypeScript. Explore the world of Pokémon with detailed information, beautiful animations, and an intuitive user interface.

![Pokédex App](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat&logo=tailwind-css)

## ✨ Features

- **🔍 Smart Search**: Search Pokémon by name with real-time suggestions
- **🏷️ Type Filtering**: Filter Pokémon by their types (Fire, Water, Grass, etc.)
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **📄 Detailed Modal Views**: Click any Pokémon to see detailed stats, abilities, and descriptions
- **♾️ Infinite Loading**: Load more Pokémon with the "Load More" button
- **🎨 Beautiful UI**: Modern gradient backgrounds and smooth hover animations
- **⚡ Performance Optimized**: Next.js Image optimization and lazy loading

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pokedex-app.git
cd pokedex-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.4.5](https://nextjs.org/) - React framework with server-side rendering
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4.x](https://tailwindcss.com/) - Utility-first CSS framework
- **API**: [PokéAPI](https://pokeapi.co/) - RESTful Pokémon API
- **Icons & Images**: Official Pokémon artwork and sprites

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page
├── components/
│   ├── PokemonCard.tsx     # Individual Pokémon card component
│   ├── PokemonGrid.tsx     # Grid layout for Pokémon cards
│   ├── PokemonModal.tsx    # Detailed Pokémon information modal
│   ├── SearchBar.tsx       # Search input component
│   └── TypeFilter.tsx      # Type filtering component
├── services/
│   └── pokemon.ts          # API service functions
├── types/
│   └── pokemon.ts          # TypeScript type definitions
```

## 🎮 Usage

### Searching Pokémon
- Use the search bar to find specific Pokémon by name
- Search is case-insensitive and provides real-time results
- Clear the search to return to the full Pokédex

### Filtering by Type
- Click on any type badge to filter Pokémon by that type
- Click "All Types" to remove the filter
- Combine with search for more specific results

### Viewing Details
- Click on any Pokémon card to open the detailed modal
- View stats, abilities, height, weight, and descriptions
- Press the X button or click outside to close the modal

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## 📊 API Integration

This app uses the [PokéAPI](https://pokeapi.co/) to fetch Pokémon data:

- **Pokémon List**: Paginated list of all Pokémon
- **Pokémon Details**: Individual Pokémon stats, types, and sprites
- **Species Information**: Descriptions and additional species data
- **Type Data**: Available Pokémon types for filtering

## 🎨 Design Features

- **Gradient Backgrounds**: Beautiful blue-to-indigo gradient
- **Type-Based Colors**: Each Pokémon type has its unique color scheme
- **Smooth Animations**: Hover effects and loading animations
- **Card-Based Layout**: Clean, modern card design for each Pokémon
- **Responsive Grid**: Automatically adjusts columns based on screen size

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with zero configuration

### Manual Build
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PokéAPI](https://pokeapi.co/) for providing comprehensive Pokémon data
- [The Pokémon Company](https://www.pokemon.com/) for the amazing Pokémon universe
- [Next.js](https://nextjs.org/) team for the excellent React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

**Built with ❤️ by [Your Name](https://github.com/yourusername)**
