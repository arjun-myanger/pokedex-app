// Type effectiveness multipliers
export const TypeEffectiveness = {
  // Attacking type -> Defending type -> Multiplier
  normal: {
    rock: 0.5,
    ghost: 0,
    steel: 0.5
  },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5
  },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    rock: 2,
    bug: 0.5,
    dragon: 0.5,
    steel: 0.5,
    flying: 0.5
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    flying: 0.5,
    fairy: 0.5
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    bug: 0.5,
    rock: 2,
    steel: 2,
    flying: 0
  },
  flying: {
    electric: 0.5,
    grass: 2,
    ice: 0.5,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    dark: 0,
    steel: 0.5
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    flying: 0.5,
    fairy: 0.5
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    bug: 2,
    steel: 0.5,
    flying: 2
  },
  ghost: {
    normal: 0,
    psychic: 2,
    ghost: 2,
    dark: 0.5
  },
  dragon: {
    dragon: 2,
    steel: 0.5,
    fairy: 0
  },
  dark: {
    fighting: 0.5,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    fairy: 0.5
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5
  }
} as const;

export type PokemonType = keyof typeof TypeEffectiveness;

// Get effectiveness multiplier for attacking type vs defending type
export function getTypeEffectiveness(attackingType: string, defendingType: string): number {
  const attacking = attackingType.toLowerCase() as PokemonType;
  const defending = defendingType.toLowerCase() as PokemonType;
  
  if (!TypeEffectiveness[attacking]) return 1;
  
  const effectiveness = TypeEffectiveness[attacking];
  const result = (effectiveness as Record<string, number>)[defending];
  
  return result !== undefined ? result : 1;
}

// Calculate damage multiplier for an attack against a Pokemon with potentially dual types
export function calculateDamageMultiplier(attackingType: string, defendingTypes: string[]): number {
  let multiplier = 1;
  
  for (const defendingType of defendingTypes) {
    multiplier *= getTypeEffectiveness(attackingType, defendingType);
  }
  
  return multiplier;
}

// Get all weaknesses for a Pokemon (takes 2x or more damage)
export function getWeaknesses(pokemonTypes: string[]): string[] {
  const weaknesses: string[] = [];
  const allTypes = Object.keys(TypeEffectiveness);
  
  for (const attackingType of allTypes) {
    const multiplier = calculateDamageMultiplier(attackingType, pokemonTypes);
    if (multiplier > 1) {
      weaknesses.push(attackingType);
    }
  }
  
  return weaknesses;
}

// Remove test function as issue is now fixed

// Get all resistances for a Pokemon (takes 0.5x or less damage)
export function getResistances(pokemonTypes: string[]): string[] {
  const resistances: string[] = [];
  const allTypes = Object.keys(TypeEffectiveness);
  
  for (const attackingType of allTypes) {
    const multiplier = calculateDamageMultiplier(attackingType, pokemonTypes);
    if (multiplier > 0 && multiplier < 1) {
      resistances.push(attackingType);
    }
  }
  
  return resistances;
}

// Get all immunities for a Pokemon (takes 0x damage)
export function getImmunities(pokemonTypes: string[]): string[] {
  const immunities: string[] = [];
  const allTypes = Object.keys(TypeEffectiveness);
  
  for (const attackingType of allTypes) {
    const multiplier = calculateDamageMultiplier(attackingType, pokemonTypes);
    if (multiplier === 0) {
      immunities.push(attackingType);
    }
  }
  
  return immunities;
}

// Get types this Pokemon is super effective against
export function getSuperEffectiveAgainst(pokemonTypes: string[]): string[] {
  const superEffective: string[] = [];
  
  for (const pokemonType of pokemonTypes) {
    const effectiveness = TypeEffectiveness[pokemonType.toLowerCase() as PokemonType];
    if (effectiveness) {
      for (const [defendingType, multiplier] of Object.entries(effectiveness)) {
        if (multiplier > 1 && !superEffective.includes(defendingType)) {
          superEffective.push(defendingType);
        }
      }
    }
  }
  
  return superEffective;
}

// Analyze a team's overall weaknesses
export interface TeamWeaknessAnalysis {
  criticalWeaknesses: Array<{
    type: string;
    count: number;
    affectedPokemon: string[];
  }>;
  resistances: Array<{
    type: string;
    count: number;
    resistantPokemon: string[];
  }>;
  coverageGaps: string[];
  recommendations: string[];
}

export function analyzeTeamWeaknesses(team: Array<{name: string, types: string[]}>): TeamWeaknessAnalysis {
  const weaknessCount: Record<string, {count: number, pokemon: string[]}> = {};
  const resistanceCount: Record<string, {count: number, pokemon: string[]}> = {};
  
  // Count weaknesses and resistances for each team member
  team.forEach(pokemon => {
    const weaknesses = getWeaknesses(pokemon.types);
    const resistances = getResistances(pokemon.types);
    
    weaknesses.forEach(type => {
      if (!weaknessCount[type]) {
        weaknessCount[type] = {count: 0, pokemon: []};
      }
      weaknessCount[type].count++;
      weaknessCount[type].pokemon.push(pokemon.name);
    });
    
    resistances.forEach(type => {
      if (!resistanceCount[type]) {
        resistanceCount[type] = {count: 0, pokemon: []};
      }
      resistanceCount[type].count++;
      resistanceCount[type].pokemon.push(pokemon.name);
    });
  });
  
  // Find critical weaknesses (affecting multiple Pokemon)
  const criticalWeaknesses = Object.entries(weaknessCount)
    .filter(([, data]) => data.count >= 2)
    .map(([type, data]) => ({
      type,
      count: data.count,
      affectedPokemon: data.pokemon
    }))
    .sort((a, b) => b.count - a.count);
  
  // Find good resistances
  const resistances = Object.entries(resistanceCount)
    .map(([type, data]) => ({
      type,
      count: data.count,
      resistantPokemon: data.pokemon
    }))
    .sort((a, b) => b.count - a.count);
  
  // Find coverage gaps (types no team member is strong against)
  const teamOffensiveTypes = team.flatMap(p => p.types);
  const allTypes = Object.keys(TypeEffectiveness);
  const coverageGaps = allTypes.filter(defendingType => {
    return !teamOffensiveTypes.some(attackingType => 
      getTypeEffectiveness(attackingType, defendingType) > 1
    );
  });
  
  // Generate recommendations
  const recommendations = [];
  
  if (criticalWeaknesses.length > 0) {
    const mostCritical = criticalWeaknesses[0];
    const resistantTypes = getResistantTypes(mostCritical.type);
    const teamTypes = teamOffensiveTypes;
    
    // Only recommend types the team doesn't already have
    const missingResistantTypes = resistantTypes.filter(type => !teamTypes.includes(type));
    
    if (missingResistantTypes.length > 0) {
      recommendations.push(`Consider adding a ${missingResistantTypes.slice(0, 3).join(' or ')} type to resist ${mostCritical.type} attacks (affects ${mostCritical.count} Pokemon)`);
    } else {
      recommendations.push(`Your team has good type diversity, but ${mostCritical.count} Pokemon share a ${mostCritical.type} weakness`);
    }
  }
  
  if (coverageGaps.length > 0) {
    // For each coverage gap, suggest what types would be super effective
    const priorityGaps = coverageGaps.slice(0, 2); // Focus on top 2 gaps
    priorityGaps.forEach(gapType => {
      const effectiveTypes = getTypesEffectiveAgainst(gapType);
      const teamDoesntHave = effectiveTypes.filter(type => !teamOffensiveTypes.includes(type));
      
      if (teamDoesntHave.length > 0) {
        recommendations.push(`Add ${teamDoesntHave.slice(0, 2).join(' or ')} type to cover ${gapType} weakness`);
      }
    });
  }
  
  return {
    criticalWeaknesses,
    resistances,
    coverageGaps,
    recommendations
  };
}

// Helper function to find types that resist a given type
function getResistantTypes(attackingType: string): string[] {
  const resistantTypes: string[] = [];
  const allTypes = Object.keys(TypeEffectiveness);
  
  for (const defendingType of allTypes) {
    const multiplier = getTypeEffectiveness(attackingType, defendingType);
    if (multiplier < 1) {
      resistantTypes.push(defendingType);
    }
  }
  
  return resistantTypes;
}

// Helper function to find types that are super effective against a given type
function getTypesEffectiveAgainst(defendingType: string): string[] {
  const effectiveTypes: string[] = [];
  const allTypes = Object.keys(TypeEffectiveness);
  
  for (const attackingType of allTypes) {
    const multiplier = getTypeEffectiveness(attackingType, defendingType);
    if (multiplier > 1) {
      effectiveTypes.push(attackingType);
    }
  }
  
  return effectiveTypes;
}