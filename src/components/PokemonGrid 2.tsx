'use client';

import { useState, useEffect } from 'react';
import { Pokemon } from '@/types/pokemon';
import { pokemonApi } from '@/services/pokemon';
import PokemonCard from './PokemonCard';
import PokemonModal from './PokemonModal';

interface PokemonGridProps {
  searchQuery?: string;
  selectedType?: string | null;
}

export default function PokemonGrid({ searchQuery, selectedType }: PokemonGridProps) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loadMore, setLoadMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchPokemon = async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (searchQuery && searchQuery.trim()) {
        const searchResults = await pokemonApi.searchPokemon(searchQuery);
        setPokemon(searchResults);
        setOffset(0);
      } else {
        const currentOffset = reset ? 0 : offset;
        const listResponse = await pokemonApi.getPokemonList(limit, currentOffset);
        
        const pokemonDetails = await Promise.all(
          listResponse.results.map(p => pokemonApi.getPokemonByName(p.name))
        );
        
        if (reset) {
          setPokemon(pokemonDetails);
        } else {
          setPokemon(prev => [...prev, ...pokemonDetails]);
        }
        
        setOffset(currentOffset + limit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
    } finally {
      setLoading(false);
      setLoadMore(false);
    }
  };

  useEffect(() => {
    fetchPokemon(true);
  }, [searchQuery, selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (!searchQuery && !loadMore) {
      setLoadMore(true);
      fetchPokemon(false);
    }
  };

  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleCloseModal = () => {
    setSelectedPokemon(null);
  };

  const filteredPokemon = selectedType
    ? pokemon.filter(p => p.types.some(type => type.type.name === selectedType))
    : pokemon;

  if (loading && pokemon.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p className="text-lg font-semibold mb-2">Oops! Something went wrong</p>
        <p>{error}</p>
        <button 
          onClick={() => fetchPokemon(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredPokemon.map((p) => (
          <PokemonCard 
            key={p.id} 
            pokemon={p} 
            onClick={handlePokemonClick}
          />
        ))}
      </div>

      {!searchQuery && pokemon.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadMore}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              'Load More Pokemon'
            )}
          </button>
        </div>
      )}

      {selectedPokemon && (
        <PokemonModal 
          pokemon={selectedPokemon} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}