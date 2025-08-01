'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pokemon, PokemonSpecies, PokemonLocationInfo } from '@/types/pokemon';
import { pokemonTypeColors, pokemonApi } from '@/services/pokemon';
import { getWeaknesses, getResistances, getImmunities, getSuperEffectiveAgainst } from '@/utils/typeEffectiveness';

interface PokemonModalProps {
  pokemon: Pokemon;
  onClose: () => void;
}

export default function PokemonModal({ pokemon, onClose }: PokemonModalProps) {
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [locations, setLocations] = useState<PokemonLocationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

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

    const fetchLocations = async () => {
      try {
        const locationData = await pokemonApi.getPokemonLocations(pokemon.id);
        setLocations(locationData);
      } catch (error) {
        console.error('Failed to fetch location data:', error);
      } finally {
        setLocationLoading(false);
      }
    };

    setIsVisible(true);
    fetchSpecies();
    fetchLocations();
  }, [pokemon.id]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

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
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div 
          className="relative p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)` }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className={`relative w-32 h-32 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <Image
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
            <div className={`transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
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
            <div className={`space-y-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {getDescription() && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{getDescription()}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{(pokemon.height / 10).toFixed(1)}m</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Height</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{(pokemon.weight / 10).toFixed(1)}kg</div>
                  <div className="text-sm text-gray-600">Weight</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Abilities</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((ability) => (
                    <span
                      key={ability.ability.name}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ability.is_hidden 
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      {capitalizeFirstLetter(ability.ability.name.replace('-', ' '))}
                      {ability.is_hidden && ' (Hidden)'}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Base Stats</h3>
                <div className="space-y-3">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {capitalizeFirstLetter(stat.stat.name.replace('-', ' '))}
                        </span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStatColor(stat.base_stat)} transition-all duration-300`}
                          style={{ width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Type Effectiveness</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const pokemonTypes = pokemon.types.map(t => t.type.name);
                    const weaknesses = getWeaknesses(pokemonTypes);
                    const resistances = getResistances(pokemonTypes);
                    const immunities = getImmunities(pokemonTypes);
                    const superEffective = getSuperEffectiveAgainst(pokemonTypes);

                    return (
                      <>
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Weak To (2x+ damage)</h4>
                          {weaknesses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {weaknesses.map(type => (
                                <span
                                  key={type}
                                  className="px-2 py-1 text-xs rounded-full text-white"
                                  style={{ backgroundColor: pokemonTypeColors[type] || '#68D391' }}
                                >
                                  {capitalizeFirstLetter(type)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">No weaknesses</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Resists (0.5x damage)</h4>
                          {resistances.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {resistances.map(type => (
                                <span
                                  key={type}
                                  className="px-2 py-1 text-xs rounded-full text-white"
                                  style={{ backgroundColor: pokemonTypeColors[type] || '#68D391' }}
                                >
                                  {capitalizeFirstLetter(type)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">No resistances</p>
                          )}
                        </div>

                        {immunities.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">Immune To (0x damage)</h4>
                            <div className="flex flex-wrap gap-1">
                              {immunities.map(type => (
                                <span
                                  key={type}
                                  className="px-2 py-1 text-xs rounded-full text-white"
                                  style={{ backgroundColor: pokemonTypeColors[type] || '#68D391' }}
                                >
                                  {capitalizeFirstLetter(type)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Strong Against (2x damage)</h4>
                          {superEffective.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {superEffective.map(type => (
                                <span
                                  key={type}
                                  className="px-2 py-1 text-xs rounded-full text-white"
                                  style={{ backgroundColor: pokemonTypeColors[type] || '#68D391' }}
                                >
                                  {capitalizeFirstLetter(type)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">No super effective types</p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Where to Find</h3>
                {locationLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                  </div>
                ) : locations.length > 0 ? (
                  <div className="space-y-2">
                    {locations.map((location, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 dark:text-white">{location.locationName}</span>
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              {location.chance}%
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Lv. {location.minLevel}-{location.maxLevel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{location.method}</span>
                          <div className="flex gap-1 flex-wrap">
                            {location.versions.map(version => (
                              <span key={version} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded">
                                {version}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No wild encounter data available</p>
                    <p className="text-xs mt-1">This Pokémon might be obtained through special events, evolution, or trading.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}