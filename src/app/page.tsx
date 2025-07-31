'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import PokemonGrid from '@/components/PokemonGrid';
import TypeFilter from '@/components/TypeFilter';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTypeSelect = (type: string | null) => {
    setSelectedType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Poké<span className="text-blue-600">dex</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Discover and learn about all your favorite Pokémon!
          </p>
        </header>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mb-8">
          <TypeFilter selectedType={selectedType} onTypeSelect={handleTypeSelect} />
        </div>

        <main>
          <PokemonGrid searchQuery={searchQuery} selectedType={selectedType} />
        </main>

        <footer className="text-center mt-12 py-8 text-gray-500">
          <p>Data provided by <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PokeAPI</a></p>
        </footer>
      </div>
    </div>
  );
}
