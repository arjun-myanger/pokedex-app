'use client';

import { useState } from 'react';
import { Pokemon } from '@/types/pokemon';
import { pokemonTypeColors } from '@/services/pokemon';
import { analyzeTeamWeaknesses } from '@/utils/typeEffectiveness';
import { teamRecommendationService, PokemonRecommendation } from '@/services/teamRecommendations';
import Image from 'next/image';
import PokemonSelector from './PokemonSelector';

interface TeamBuilderProps {
  // This prop is no longer needed as we handle Pokemon selection internally
  onPokemonSelect?: (slotIndex: number) => void;
}

interface TeamSlot {
  pokemon: Pokemon | null;
}

interface TeamAnalysisData {
  criticalWeaknesses?: Array<{
    type: string;
    count: number;
    pokemon?: string[];
  }>;
  resistances?: Array<{
    type: string;
    count: number;
  }>;
  coverageGaps?: string[];
  recommendations?: string[];
  overallTeamScore?: number;
  teamGrade?: string;
  teamArchetype?: string;
  defensiveRating?: number;
  offensiveRating?: number;
  coreStrength?: number;
  teamStrengths?: string[];
  teamWeaknesses?: string[];
  // Legacy properties from old analysis system
  affectedPokemon?: string[];
  resistanceTypes?: string[];
  weaknessTypes?: string[];
}

export default function TeamBuilder({ onPokemonSelect }: TeamBuilderProps) {
  const [team, setTeam] = useState<TeamSlot[]>(() => 
    Array.from({ length: 6 }, () => ({ pokemon: null }))
  );
  const [analysis, setAnalysis] = useState<TeamAnalysisData | null>(null);
  const [recommendations, setRecommendations] = useState<PokemonRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const addPokemonToTeam = (pokemon: Pokemon, slotIndex: number) => {
    const newTeam = [...team];
    newTeam[slotIndex] = { pokemon };
    setTeam(newTeam);
    updateAnalysis(newTeam);
  };

  const removePokemonFromTeam = (slotIndex: number) => {
    const newTeam = [...team];
    newTeam[slotIndex] = { pokemon: null };
    setTeam(newTeam);
    updateAnalysis(newTeam);
  };

  const handleSlotClick = (slotIndex: number) => {
    // If slot is empty, open Pokemon selector
    if (!team[slotIndex].pokemon) {
      setSelectedSlot(slotIndex);
      setSelectorOpen(true);
    }
    // If there's a legacy onPokemonSelect prop, call it
    onPokemonSelect?.(slotIndex);
  };

  const handlePokemonSelect = (pokemon: Pokemon) => {
    if (selectedSlot !== null) {
      addPokemonToTeam(pokemon, selectedSlot);
    }
  };

  const handleSelectorClose = () => {
    setSelectorOpen(false);
    setSelectedSlot(null);
  };

  const clearAllPokemon = () => {
    const emptyTeam = Array.from({ length: 6 }, () => ({ pokemon: null }));
    setTeam(emptyTeam);
    setAnalysis(null);
    setRecommendations([]);
  };

  const handleRecommendationClick = (recommendation: PokemonRecommendation) => {
    if (recommendation.type === 'add') {
      // Find first empty slot
      const emptySlotIndex = team.findIndex(slot => slot.pokemon === null);
      if (emptySlotIndex !== -1) {
        addPokemonToTeam(recommendation.pokemon, emptySlotIndex);
      }
    } else if (recommendation.type === 'swap' && recommendation.swapSlot !== undefined) {
      addPokemonToTeam(recommendation.pokemon, recommendation.swapSlot);
    }
  };

  const updateAnalysis = async (currentTeam: TeamSlot[]) => {
    const teamPokemon = currentTeam
      .filter(slot => slot.pokemon !== null)
      .map(slot => slot.pokemon!);

    if (teamPokemon.length > 0) {
      try {
        // For now, use only the legacy analysis to avoid errors
        const simpleTeamPokemon = teamPokemon.map(pokemon => ({
          name: pokemon.name,
          types: pokemon.types.map(t => t.type.name)
        }));
        const legacyAnalysis = analyzeTeamWeaknesses(simpleTeamPokemon);
        
        // Try to get the new analysis but don't fail if it errors
        try {
          const fullAnalysis = await teamRecommendationService.getTeamAnalysis(teamPokemon);
          const combinedAnalysis = {
            ...legacyAnalysis,
            ...fullAnalysis
          };
          setAnalysis(combinedAnalysis);
        } catch (error) {
          console.error('Error getting full team analysis:', error);
          setAnalysis(legacyAnalysis);
        }
      } catch (error) {
        console.error('Error in updateAnalysis:', error);
        setAnalysis(null);
      }
      
      // Get recommendations
      await updateRecommendations(currentTeam);
    } else {
      setAnalysis(null);
      setRecommendations([]);
    }
  };

  const updateRecommendations = async (currentTeam: TeamSlot[]) => {
    try {
      setLoadingRecommendations(true);
      const newRecommendations = await teamRecommendationService.getTeamRecommendations(currentTeam, 6);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Team Builder</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Build your team of up to 6 Pokemon and analyze their type effectiveness. Click on empty slots to add Pokemon!
        </p>
      </div>

      {/* Team Score Display */}
      {analysis && typeof analysis.overallTeamScore === 'number' && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">Team Score</h3>
              <p className="text-blue-100 text-sm">Overall team effectiveness rating</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold">{analysis.overallTeamScore || 0}</div>
                <div className="text-6xl font-bold opacity-90">{analysis.teamGrade || 'F'}</div>
              </div>
              <div className="text-blue-100 text-sm mt-1">
                {analysis.teamArchetype && analysis.teamArchetype !== 'undefined' ? 
                  `${analysis.teamArchetype.charAt(0).toUpperCase() + analysis.teamArchetype.slice(1)} Team` : 
                  'Team Strategy'
                }
              </div>
            </div>
          </div>
          
          {/* Team Ratings Bar */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Defense</span>
                <span>{Math.round(analysis.defensiveRating || 0)}</span>
              </div>
              <div className="w-full bg-blue-400/30 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.round(analysis.defensiveRating || 0)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Offense</span>
                <span>{Math.round(analysis.offensiveRating || 0)}</span>
              </div>
              <div className="w-full bg-blue-400/30 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.round(analysis.offensiveRating || 0)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Synergy</span>
                <span>{Math.round(analysis.coreStrength || 0)}</span>
              </div>
              <div className="w-full bg-blue-400/30 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.round(analysis.coreStrength || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Team Strengths and Weaknesses */}
          {((analysis.teamStrengths && analysis.teamStrengths.length > 0) || (analysis.teamWeaknesses && analysis.teamWeaknesses.length > 0)) && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analysis.teamStrengths && analysis.teamStrengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-200">✨ Team Strengths</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.teamStrengths.slice(0, 2).map((strength: string, index: number) => (
                      <li key={index} className="text-blue-100">• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.teamWeaknesses && analysis.teamWeaknesses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-red-200">⚠️ Areas to Improve</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.teamWeaknesses.slice(0, 2).map((weakness: string, index: number) => (
                      <li key={index} className="text-blue-100">• {weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Team Actions */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Team</h3>
        <div className="flex gap-2">
          {team.some(slot => slot.pokemon !== null) && (
            <button
              onClick={clearAllPokemon}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Clear All Pokemon
            </button>
          )}
        </div>
      </div>

      {/* Team Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {team.map((slot, index) => (
          <div
            key={index}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => handleSlotClick(index)}
          >
            {slot.pokemon ? (
              <div className="relative w-full h-full flex flex-col items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePokemonFromTeam(index);
                  }}
                  className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
                >
                  ×
                </button>
                <div className="relative w-16 h-16 mb-2">
                  {slot.pokemon.sprites ? (
                    <Image
                      src={slot.pokemon.sprites?.other?.['official-artwork']?.front_default || slot.pokemon.sprites?.front_default || '/placeholder-pokemon.png'}
                      alt={slot.pokemon.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-center text-gray-800 dark:text-white mb-1">
                  {capitalizeFirstLetter(slot.pokemon.name)}
                </p>
                <div className="flex gap-1">
                  {slot.pokemon.types?.map((type) => {
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
                  }) || []}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl text-gray-500 dark:text-gray-400">+</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add Pokemon</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Team Analysis */}
      {analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Team Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Weaknesses */}
            <div>
              <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3">⚠️ Critical Weaknesses</h4>
              {analysis.criticalWeaknesses && analysis.criticalWeaknesses.length > 0 ? (
                <div className="space-y-3">
                  {analysis.criticalWeaknesses.map((weakness) => (
                    <div key={weakness.type} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: pokemonTypeColors[weakness.type] || '#68D391' }}
                        >
                          {capitalizeFirstLetter(weakness.type)}
                        </span>
                        <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                          {weakness.count}/6 Pokemon affected
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Affects: {weakness.pokemon?.map((name: string) => capitalizeFirstLetter(name)).join(', ') || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  ✅ No critical weaknesses found! Your team has good type diversity.
                </p>
              )}
            </div>

            {/* Team Resistances */}
            <div>
              <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">✅ Strong Resistances</h4>
              {analysis.resistances && analysis.resistances.length > 0 ? (
                <div className="space-y-2">
                  {analysis.resistances.slice(0, 5).map((resistance) => (
                    <div key={resistance.type} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: pokemonTypeColors[resistance.type] || '#68D391' }}
                        >
                          {capitalizeFirstLetter(resistance.type)}
                        </span>
                        <span className="text-xs text-green-700 dark:text-green-400">
                          {resistance.count} Pokemon resist
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No significant resistances found.</p>
              )}
            </div>

            {/* Coverage Gaps */}
            {analysis.coverageGaps && analysis.coverageGaps.length > 0 && (
              <div className="lg:col-span-2">
                <h4 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-3">🔧 Coverage Gaps</h4>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Your team lacks super effective coverage against:</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.coverageGaps.slice(0, 8).map((type: string) => (
                      <span
                        key={type}
                        className="px-2 py-1 rounded-full text-xs font-medium text-white opacity-75"
                        style={{ backgroundColor: pokemonTypeColors[type] || '#68D391' }}
                      >
                        {capitalizeFirstLetter(type)}
                      </span>
                    ))}
                    {analysis.coverageGaps.length > 8 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                        +{analysis.coverageGaps.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="lg:col-span-2">
                <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">💡 Recommendations</h4>
                <div className="space-y-2">
                  {analysis.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            💡 Recommended Pokemon
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Based on your team&apos;s analysis, here are some Pokemon that could improve your team:
          </p>
          
          {loadingRecommendations ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-300">Finding recommendations...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((recommendation, index) => (
                <div
                  key={`${recommendation.pokemon.id}-${index}`}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                  onClick={() => handleRecommendationClick(recommendation)}
                >
                  <div className="flex items-center mb-3">
                    <div className="relative w-12 h-12 mr-3">
                      <Image
                        src={recommendation.pokemon.sprites?.other?.['official-artwork']?.front_default || 
                             recommendation.pokemon.sprites?.front_default || 
                             '/placeholder-pokemon.png'}
                        alt={recommendation.pokemon.name}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {capitalizeFirstLetter(recommendation.pokemon.name)}
                      </h4>
                      <div className="flex gap-1 mt-1">
                        {recommendation.pokemon.types.map((type) => {
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
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {recommendation.type === 'add' ? 'ADD' : 'SWAP'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Score: {recommendation.score}/100
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {recommendation.reason}
                  </p>
                  
                  {recommendation.benefits.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div className="font-medium mb-1">Benefits:</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {recommendation.benefits.slice(0, 3).map((benefit, benefitIndex) => (
                          <li key={benefitIndex}>{benefit}</li>
                        ))}
                        {recommendation.benefits.length > 3 && (
                          <li>+{recommendation.benefits.length - 3} more...</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {recommendation.type === 'swap' && recommendation.swapSlot !== undefined && (
                    <div className="mt-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                      Will replace Pokemon in slot {recommendation.swapSlot + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {team.every(slot => slot.pokemon === null) && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Add some Pokemon to your team to see the weakness analysis!</p>
          <button
            onClick={() => {
              // Add demo team for testing
              const demoTeam = [
                { 
                  pokemon: { 
                    id: 6,
                    name: 'charizard', 
                    types: [{type: {name: 'fire'}}, {type: {name: 'flying'}}],
                    sprites: {
                      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
                      other: {
                        'official-artwork': {
                          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'
                        }
                      }
                    }
                  } as Pokemon
                },
                { 
                  pokemon: { 
                    id: 9,
                    name: 'blastoise', 
                    types: [{type: {name: 'water'}}],
                    sprites: {
                      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
                      other: {
                        'official-artwork': {
                          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png'
                        }
                      }
                    }
                  } as Pokemon
                },
                { 
                  pokemon: { 
                    id: 3,
                    name: 'venusaur', 
                    types: [{type: {name: 'grass'}}, {type: {name: 'poison'}}],
                    sprites: {
                      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png',
                      other: {
                        'official-artwork': {
                          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png'
                        }
                      }
                    }
                  } as Pokemon
                },
                { pokemon: null },
                { pokemon: null },
                { pokemon: null }
              ] as TeamSlot[];
              setTeam(demoTeam);
              updateAnalysis(demoTeam);
            }}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Load Demo Team (Charizard, Blastoise, Venusaur)
          </button>
        </div>
      )}

      {/* Pokemon Selector Modal */}
      <PokemonSelector
        isOpen={selectorOpen}
        onClose={handleSelectorClose}
        onSelectPokemon={handlePokemonSelect}
        slotNumber={(selectedSlot ?? 0) + 1}
      />
    </div>
  );
}

// Export the addPokemonToTeam function for external use
export type { TeamSlot };
export { TeamBuilder };