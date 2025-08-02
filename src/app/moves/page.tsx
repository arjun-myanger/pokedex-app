'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import MovesGrid from '@/components/MovesGrid';
import TypeFilter from '@/components/TypeFilter';
import { Move } from '@/types/pokemon';
import Link from 'next/link';

export default function MovesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTypeSelect = (type: string | null) => {
    setSelectedType(type);
  };

  const handleMoveSelect = (move: Move | null) => {
    setSelectedMove(move);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${selectedMove ? 'blur-sm' : ''}`}>
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Move<span className="text-blue-600">dex</span>
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Discover and learn about all Pokémon moves!
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/"
              className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Pokédex
            </Link>
            <Link 
              href="/team-builder"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Team Builder
            </Link>
          </div>
        </header>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} placeholder="Search moves..." />
        </div>

        <div className="mb-8">
          <TypeFilter selectedType={selectedType} onTypeSelect={handleTypeSelect} />
        </div>

        <main>
          <MovesGrid 
            searchQuery={searchQuery} 
            selectedType={selectedType} 
            onMoveSelect={handleMoveSelect}
          />
        </main>

        <footer className="text-center mt-12 py-8 text-gray-500">
          <p>Move data provided by <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PokeAPI</a></p>
        </footer>
      </div>

      {selectedMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {selectedMove.name.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </h2>
                <button
                  onClick={() => setSelectedMove(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-600 dark:text-gray-300">Type</div>
                  <div className="text-lg capitalize">{selectedMove.type.name}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-600 dark:text-gray-300">Power</div>
                  <div className="text-lg">{selectedMove.power || '—'}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-600 dark:text-gray-300">Accuracy</div>
                  <div className="text-lg">{selectedMove.accuracy ? `${selectedMove.accuracy}%` : '—'}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-600 dark:text-gray-300">PP</div>
                  <div className="text-lg">{selectedMove.pp}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-800 dark:text-white">
                  {selectedMove.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text.replace(/\n/g, ' ') || 'No description available.'}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Effect</h3>
                <p className="text-gray-800 dark:text-white">
                  {selectedMove.effect_entries.find(entry => entry.language.name === 'en')?.short_effect || 'No effect description available.'}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedMove(null)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}