'use client';

import Image from 'next/image';
import { Pokemon } from '@/types/pokemon';
import { pokemonTypeColors } from '@/services/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: (pokemon: Pokemon) => void;
}

export default function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const primaryType = pokemon.types[0]?.type.name;
  const typeColor = pokemonTypeColors[primaryType] || '#68D391';

  const formatPokemonId = (id: number) => {
    return `#${id.toString().padStart(3, '0')}`;
  };

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

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
      style={{ borderTop: `4px solid ${typeColor}` }}
      onClick={() => onClick?.(pokemon)}
    >
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
          {formatPokemonId(pokemon.id)}
        </div>
        <div className="relative w-24 h-24 mx-auto">
          <Image
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
            alt={pokemon.name}
            fill
            sizes="96px"
            className="object-contain"
            priority={pokemon.id <= 20}
          />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 text-center">
          {capitalizeFirstLetter(pokemon.name)}
        </h3>
        
        <div className="flex flex-wrap gap-1 justify-center">
          {pokemon.types.map((type) => {
            const backgroundColor = pokemonTypeColors[type.type.name] || '#68D391';
            const textColor = getTextColor(backgroundColor);
            return (
              <span
                key={type.type.name}
                className="px-2 py-1 rounded-full text-xs font-medium"
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

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
          <div className="text-center">
            <div className="font-semibold">Height</div>
            <div>{(pokemon.height / 10).toFixed(1)}m</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Weight</div>
            <div>{(pokemon.weight / 10).toFixed(1)}kg</div>
          </div>
        </div>
      </div>
    </div>
  );
}