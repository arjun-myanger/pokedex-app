'use client';

import { useState, useEffect } from 'react';
import { Pokemon } from '@/types/pokemon';
import { pokemonApi } from '@/services/pokemon';
import { pokemonTypeColors } from '@/services/pokemon';
import Image from 'next/image';

interface PokemonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon: (pokemon: Pokemon) => void;
  slotNumber: number;
}

export default function PokemonSelector({ isOpen, onClose, onSelectPokemon, slotNumber }: PokemonSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getTextColor = (backgroundColor: string): string => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await pokemonApi.searchPokemon(query);
      setSearchResults(results);
    } catch {
      setError('Pokemon not found. Try a different name.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonSelect = (pokemon: Pokemon) => {
    onSelectPokemon(pokemon);
    onClose();
    // Reset search for next time
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Add Pokemon to Slot {slotNumber}</h2>
              <p className="text-blue-100 mt-1">Search for any Pokemon by name</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Pokemon Name
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Enter Pokemon name (e.g., Pikachu, Charizard, Mewtwo...)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
            autoFocus
          />
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-300">Searching...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try searching for Pokemon like: Pikachu, Charizard, Bulbasaur</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Found {searchResults.length} Pokemon:
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {searchResults.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    onClick={() => handlePokemonSelect(pokemon)}
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all"
                  >
                    <div className="relative w-16 h-16 mr-4">
                      <Image
                        src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '/placeholder-pokemon.png'}
                        alt={pokemon.name}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {capitalizeFirstLetter(pokemon.name)}
                      </h4>
                      <div className="flex gap-1 mt-1">
                        {pokemon.types?.map((type) => {
                          const backgroundColor = pokemonTypeColors[type.type.name] || '#68D391';
                          const textColor = getTextColor(backgroundColor);
                          return (
                            <span
                              key={type.type.name}
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: backgroundColor,
                                color: textColor
                              }}
                            >
                              {capitalizeFirstLetter(type.type.name)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Start typing to search for Pokemon!</p>
            </div>
          )}

          {/* Initial State */}
          {!searchQuery && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 dark:text-gray-300">Type a Pokemon name to get started</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Examples: Pikachu, Charizard, Mewtwo, Rayquaza
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Click on a Pokemon to add it to your team
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}