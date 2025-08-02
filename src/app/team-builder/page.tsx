'use client';

import { useState } from 'react';
import { Pokemon } from '@/types/pokemon';
import TeamBuilder from '@/components/TeamBuilder';
import PokemonModal from '@/components/PokemonModal';
import Link from 'next/link';

export default function TeamBuilderPage() {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // Future function for Pokemon selection
  // const handlePokemonSelect = (pokemon: Pokemon | null) => {
  //   setSelectedPokemon(pokemon);
  // };

  const handleSlotSelect = (slotIndex: number) => {
    // This is now handled internally by the TeamBuilder component
    console.log(`Slot ${slotIndex + 1} clicked - Pokemon selector will open`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${selectedPokemon ? 'blur-sm' : ''}`}>
        <header className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Pokedex
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Team Builder
          </h1>
          <p className="text-gray-600 text-lg">
            Build your perfect Pokemon team and analyze its strengths and weaknesses!
          </p>
        </header>

        <TeamBuilder onPokemonSelect={handleSlotSelect} />
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