'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import PokemonGrid from '@/components/PokemonGrid';
import TypeFilter from '@/components/TypeFilter';
import PokemonModal from '@/components/PokemonModal';
import { Pokemon } from '@/types/pokemon';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTypeSelect = (type: string | null) => {
    setSelectedType(type);
  };

  const handlePokemonSelect = (pokemon: Pokemon | null) => {
    setSelectedPokemon(pokemon);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${selectedPokemon ? 'blur-sm' : ''}`}>
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Poké<span className="text-blue-600">dex</span>
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Discover and learn about all your favorite Pokémon!
          </p>
          <Link 
            href="/team-builder"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Team Builder
          </Link>
        </header>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mb-8">
          <TypeFilter selectedType={selectedType} onTypeSelect={handleTypeSelect} />
        </div>

        <main>
          <PokemonGrid 
            searchQuery={searchQuery} 
            selectedType={selectedType} 
            onPokemonSelect={handlePokemonSelect}
          />
        </main>

        <footer className="text-center mt-12 py-8 text-gray-500">
          <p>Data provided by <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PokeAPI</a></p>
        </footer>
      </div>

      {selectedPokemon && (
        <PokemonModal 
          pokemon={selectedPokemon} 
          onClose={() => setSelectedPokemon(null)} 
        />
      )}
    </div>
  );
}
