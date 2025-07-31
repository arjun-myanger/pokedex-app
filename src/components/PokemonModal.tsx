'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pokemon, PokemonSpecies } from '@/types/pokemon';
import { pokemonTypeColors, pokemonApi } from '@/services/pokemon';

interface PokemonModalProps {
  pokemon: Pokemon;
  onClose: () => void;
}

export default function PokemonModal({ pokemon, onClose }: PokemonModalProps) {
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const speciesData = await pokemonApi.getPokemonSpecies(pokemon.id);
        setSpecies(speciesData);
      } catch (error) {
        console.error('Failed to fetch species data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, [pokemon.id]);

  const formatPokemonId = (id: number) => {
    return `#${id.toString().padStart(3, '0')}`;
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getStatColor = (statValue: number) => {
    if (statValue >= 100) return 'bg-green-500';
    if (statValue >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (backgroundColor: string): string => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const getDescription = () => {
    if (!species) return '';
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    return englishEntry?.flavor_text.replace(/\f/g, ' ') || '';
  };

  const primaryType = pokemon.types[0]?.type.name;
  const typeColor = pokemonTypeColors[primaryType] || '#68D391';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div 
          className="relative p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32">
              <Image
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-sm opacity-90">{formatPokemonId(pokemon.id)}</p>
              <h2 className="text-3xl font-bold mb-2">{capitalizeFirstLetter(pokemon.name)}</h2>
              <div className="flex gap-2">
                {pokemon.types.map((type) => {
                  const backgroundColor = pokemonTypeColors[type.type.name] || '#68D391';
                  const textColor = getTextColor(backgroundColor);
                  return (
                    <span
                      key={type.type.name}
                      className="px-3 py-1 rounded-full text-sm font-medium"
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
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {getDescription() && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{getDescription()}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{(pokemon.height / 10).toFixed(1)}m</div>
                  <div className="text-sm text-gray-600">Height</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{(pokemon.weight / 10).toFixed(1)}kg</div>
                  <div className="text-sm text-gray-600">Weight</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Abilities</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((ability) => (
                    <span
                      key={ability.ability.name}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ability.is_hidden 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {capitalizeFirstLetter(ability.ability.name.replace('-', ' '))}
                      {ability.is_hidden && ' (Hidden)'}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Base Stats</h3>
                <div className="space-y-3">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {capitalizeFirstLetter(stat.stat.name.replace('-', ' '))}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStatColor(stat.base_stat)} transition-all duration-300`}
                          style={{ width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}