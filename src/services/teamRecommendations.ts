import { Pokemon } from '@/types/pokemon';
import { pokemonApi } from './pokemon';
import { 
  getWeaknesses, 
  getTypeEffectiveness,
  calculateDamageMultiplier
} from '@/utils/typeEffectiveness';

export interface PokemonRecommendation {
  pokemon: Pokemon;
  reason: string;
  score: number;
  benefits: string[];
  type: 'add' | 'swap';
  swapSlot?: number;
}

export interface TeamSlot {
  pokemon: Pokemon | null;
}

export type PokemonRole = 'sweeper' | 'wallbreaker' | 'wall' | 'tank' | 'pivot' | 'hazard-setter' | 'defogger' | 'support' | 'utility';

export interface PokemonAnalysis {
  roles: PokemonRole[];
  coreCompatibility: string[];
  threatsHandled: string[];
  weaknessesExposed: string[];
  synergy: number;
}

// Popular/strong Pokemon by type for recommendations
const POPULAR_POKEMON_BY_TYPE: Record<string, number[]> = {
  fire: [6, 59, 78, 136, 157, 244, 257, 392, 609, 815], // Charizard, Arcanine, Rapidash, Flareon, Typhlosion, Entei, Blaziken, Infernape, Chandelure, Cinderace
  water: [9, 130, 144, 160, 245, 260, 395, 503, 658, 818], // Blastoise, Gyarados, Articuno, Feraligatr, Suicune, Swampert, Empoleon, Samurott, Greninja, Inteleon
  grass: [3, 45, 103, 154, 254, 389, 465, 497, 724, 812], // Venusaur, Vileplume, Exeggutor, Meganium, Sceptile, Torterra, Tangrowth, Serperior, Decidueye, Rillaboom
  electric: [25, 26, 125, 135, 181, 243, 310, 466, 604, 807], // Pikachu, Raichu, Electabuzz, Jolteon, Ampharos, Raikou, Manectric, Electivire, Eelektross, Zeraora
  psychic: [65, 122, 150, 196, 251, 282, 475, 579, 786, 866], // Alakazam, Mr. Mime, Mewtwo, Espeon, Celebi, Gardevoir, Gallade, Reuniclus, Tapu Lele, Mr. Rime
  ice: [87, 131, 144, 225, 361, 471, 473, 646, 713, 883], // Dewgong, Lapras, Articuno, Delibird, Glalie, Glaceon, Mamoswine, Kyurem, Avalugg, Arctovish
  dragon: [149, 230, 373, 445, 646, 700, 706, 804, 887, 890], // Dragonite, Kingdra, Salamence, Garchomp, Kyurem, Sylveon, Goodra, Naganadel, Dragapult, Eternatus
  dark: [94, 197, 229, 248, 359, 430, 452, 635, 717, 862], // Gengar, Umbreon, Houndoom, Tyranitar, Absol, Honchkrow, Drapion, Hydreigon, Yveltal, Obstagoon
  fighting: [68, 107, 214, 257, 392, 448, 532, 647, 739, 865], // Machamp, Hitmonchan, Heracross, Blaziken, Infernape, Lucario, Timburr, Keldeo, Crabominable, Sirfetch'd
  poison: [34, 89, 169, 454, 569, 748, 793, 804], // Nidoking, Muk, Crobat, Toxicroak, Garbodor, Toxapex, Nihilego, Naganadel
  ground: [31, 76, 105, 208, 232, 330, 445, 464, 530, 770], // Nidoqueen, Golem, Marowak, Steelix, Donphan, Flygon, Garchomp, Rhyperior, Excadrill, Palossand
  flying: [6, 18, 83, 142, 144, 149, 227, 277, 334, 430], // Charizard, Pidgeot, Farfetch'd, Aerodactyl, Articuno, Dragonite, Skarmory, Swellow, Altaria, Honchkrow
  bug: [12, 15, 123, 127, 212, 214, 469, 542, 637, 738], // Butterfree, Beedrill, Scyther, Pinsir, Scizor, Heracross, Yanmega, Leavanny, Volcarona, Vikavolt
  rock: [76, 139, 142, 219, 248, 306, 409, 526, 639, 719], // Golem, Omastar, Aerodactyl, Magcargo, Tyranitar, Aggron, Rampardos, Gigalith, Terrakion, Diancie
  ghost: [94, 105, 354, 477, 609, 681, 711, 792, 855], // Gengar, Marowak, Banette, Dusknoir, Chandelure, Aegislash, Gourgeist, Lunala, Polteageist
  steel: [81, 208, 227, 306, 376, 395, 448, 530, 681, 797], // Magnemite, Steelix, Skarmory, Aggron, Metagross, Empoleon, Lucario, Excadrill, Aegislash, Celesteela
  fairy: [35, 39, 122, 184, 282, 468, 700, 716, 786, 858] // Clefairy, Jigglypuff, Mr. Mime, Azumarill, Gardevoir, Togekiss, Sylveon, Xerneas, Tapu Lele, Hatterene
};

export class TeamRecommendationService {
  private pokemonCache: Map<number, Pokemon> = new Map();
  private roleAnalysisCache: Map<number, PokemonAnalysis> = new Map();

  async getTeamAnalysis(teamPokemon: Pokemon[]): Promise<TeamAnalysis> {
    return this.analyzeTeam(teamPokemon);
  }

  async getTeamRecommendations(
    currentTeam: TeamSlot[],
    maxRecommendations: number = 6
  ): Promise<PokemonRecommendation[]> {
    const recommendations: PokemonRecommendation[] = [];
    const teamPokemon = currentTeam.filter(slot => slot.pokemon !== null).map(slot => slot.pokemon!);
    
    if (teamPokemon.length === 0) {
      return this.getStarterRecommendations();
    }

    // Get team weaknesses and coverage gaps
    const teamAnalysis = this.analyzeTeam(teamPokemon);
    
    // Get recommendations for empty slots
    const emptySlots = currentTeam.map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.pokemon === null);
    
    if (emptySlots.length > 0) {
      const addRecommendations = await this.getAddRecommendations(teamPokemon, teamAnalysis, emptySlots.length);
      recommendations.push(...addRecommendations);
    }

    // Always get swap recommendations for teams with 3+ Pokemon (including full teams)
    if (teamPokemon.length >= 3) {
      const swapRecommendations = await this.getSwapRecommendations(currentTeam, teamAnalysis);
      recommendations.push(...swapRecommendations);
    }

    // For full teams, also provide alternative team composition suggestions
    if (teamPokemon.length === 6) {
      const alternativeRecommendations = await this.getAlternativeRecommendations(teamPokemon, teamAnalysis);
      recommendations.push(...alternativeRecommendations);
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);
  }

  private async getStarterRecommendations(): Promise<PokemonRecommendation[]> {
    const starterIds = [1, 4, 7, 152, 155, 158, 252, 255, 258]; // Classic starters
    const recommendations: PokemonRecommendation[] = [];

    for (const id of starterIds.slice(0, 6)) {
      try {
        const pokemon = await this.getPokemon(id);
        recommendations.push({
          pokemon,
          reason: 'Great starter Pokemon with balanced stats',
          score: 85,
          benefits: ['Well-rounded stats', 'Good type coverage', 'Reliable team foundation'],
          type: 'add'
        });
      } catch (error) {
        console.warn(`Failed to fetch starter Pokemon ${id}:`, error);
      }
    }

    return recommendations;
  }

  private async getAddRecommendations(
    teamPokemon: Pokemon[],
    analysis: TeamAnalysis,
    slotsToFill: number
  ): Promise<PokemonRecommendation[]> {
    const recommendations: PokemonRecommendation[] = [];
    const teamTypes = teamPokemon.flatMap(p => p.types.map(t => t.type.name));
    
    // Prioritize Pokemon that resist critical weaknesses
    const typesToAdd = new Set<string>();
    
    // Add types that resist our biggest weaknesses
    for (const weakness of analysis.criticalWeaknesses.slice(0, 2)) {
      const resistantTypes = this.getTypesResistantTo(weakness.type);
      resistantTypes.forEach(type => {
        if (!teamTypes.includes(type)) {
          typesToAdd.add(type);
        }
      });
    }

    // Add types that cover our coverage gaps
    for (const gap of analysis.coverageGaps.slice(0, 3)) {
      const effectiveTypes = this.getTypesEffectiveAgainst(gap);
      effectiveTypes.forEach(type => {
        if (!teamTypes.includes(type)) {
          typesToAdd.add(type);
        }
      });
    }

    // If we don't have specific needs, add popular types we're missing
    if (typesToAdd.size === 0) {
      const popularTypes = ['dragon', 'steel', 'fairy', 'fighting', 'psychic'];
      popularTypes.forEach(type => {
        if (!teamTypes.includes(type)) {
          typesToAdd.add(type);
        }
      });
    }

    // Get Pokemon for recommended types
    for (const type of Array.from(typesToAdd).slice(0, slotsToFill * 2)) {
      const pokemonForType = await this.getPokemonByType(type, 2);
      
      for (const pokemon of pokemonForType) {
        if (!teamPokemon.some(tp => tp.id === pokemon.id)) {
          const benefits = this.calculateBenefits(pokemon, analysis, teamTypes);
          const score = this.calculateScore(pokemon, analysis, teamTypes);
          
          recommendations.push({
            pokemon,
            reason: this.generateAddReason(pokemon, analysis, teamTypes),
            score,
            benefits,
            type: 'add'
          });
        }
      }
    }

    return recommendations;
  }

  private async getSwapRecommendations(
    currentTeam: TeamSlot[],
    analysis: TeamAnalysis
  ): Promise<PokemonRecommendation[]> {
    const recommendations: PokemonRecommendation[] = [];
    const teamPokemon = currentTeam.filter(slot => slot.pokemon !== null).map(slot => slot.pokemon!);
    
    // Find Pokemon that contribute most to critical weaknesses
    for (const weakness of analysis.criticalWeaknesses.slice(0, 1)) {
      const vulnerablePokemon = teamPokemon.filter(p => 
        this.pokemonIsWeakTo(p, weakness.type)
      );

      for (const vulnerable of vulnerablePokemon.slice(0, 2)) {
        const slotIndex = currentTeam.findIndex(slot => slot.pokemon?.id === vulnerable.id);
        if (slotIndex === -1) continue;

        // Find better alternatives
        const resistantTypes = this.getTypesResistantTo(weakness.type);
        const alternativeTypes = resistantTypes.filter(type => 
          !teamPokemon.some(p => p.types.some(t => t.type.name === type))
        );

        for (const type of alternativeTypes.slice(0, 2)) {
          const alternatives = await this.getPokemonByType(type, 1);
          
          for (const alternative of alternatives) {
            if (!teamPokemon.some(tp => tp.id === alternative.id)) {
              const benefits = this.calculateSwapBenefits(vulnerable, alternative, analysis);
              const score = this.calculateScore(alternative, analysis, 
                teamPokemon.map(p => p.types.map(t => t.type.name)).flat());
              
              recommendations.push({
                pokemon: alternative,
                reason: this.generateSwapReason(vulnerable, alternative),
                score,
                benefits,
                type: 'swap',
                swapSlot: slotIndex
              });
            }
          }
        }
      }
    }

    return recommendations;
  }

  private async getAlternativeRecommendations(
    teamPokemon: Pokemon[],
    analysis: TeamAnalysis
  ): Promise<PokemonRecommendation[]> {
    const recommendations: PokemonRecommendation[] = [];
    
    // Find the weakest Pokemon in terms of team contribution
    const pokemonContributions = teamPokemon.map(pokemon => ({
      pokemon,
      contribution: this.calculateTeamContribution(pokemon, teamPokemon, analysis)
    }));
    
    // Sort by contribution (lowest first)
    pokemonContributions.sort((a, b) => a.contribution - b.contribution);
    
    // Get alternatives for the 2 lowest contributing Pokemon
    for (const { pokemon } of pokemonContributions.slice(0, 2)) {
      const alternatives = await this.findBetterAlternatives(pokemon, teamPokemon, analysis);
      
      for (const alternative of alternatives.slice(0, 2)) {
        const slotIndex = teamPokemon.findIndex(p => p.id === pokemon.id);
        recommendations.push({
          pokemon: alternative,
          reason: `Better team synergy than ${pokemon.name}`,
          score: this.calculateScore(alternative, analysis, 
            teamPokemon.map(p => p.types.map(t => t.type.name)).flat()),
          benefits: this.calculateSwapBenefits(pokemon, alternative, analysis),
          type: 'swap',
          swapSlot: slotIndex
        });
      }
    }
    
    return recommendations;
  }

  private calculateTeamContribution(pokemon: Pokemon, team: Pokemon[], analysis: TeamAnalysis): number {
    let contribution = 0;
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    
    // Positive contribution for resisting team weaknesses
    for (const weakness of analysis.criticalWeaknesses) {
      if (calculateDamageMultiplier(weakness.type, pokemonTypes) < 1) {
        contribution += 20;
      }
    }
    
    // Positive contribution for unique type coverage
    const teamTypes = team.filter(p => p.id !== pokemon.id)
      .flatMap(p => p.types.map(t => t.type.name));
    
    const uniqueTypes = pokemonTypes.filter(type => !teamTypes.includes(type));
    contribution += uniqueTypes.length * 10;
    
    // Positive contribution for covering gaps
    const coverageBonus = pokemonTypes.reduce((bonus, type) => {
      const gapsCovered = analysis.coverageGaps.filter(gap => 
        getTypeEffectiveness(type, gap) > 1
      ).length;
      return bonus + (gapsCovered * 5);
    }, 0);
    contribution += coverageBonus;
    
    // Stats contribution
    const totalStats = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
    contribution += totalStats / 20;
    
    // Negative contribution for adding to team weaknesses
    const teamWeaknesses = team.filter(p => p.id !== pokemon.id)
      .flatMap(p => getWeaknesses(p.types.map(t => t.type.name)));
    
    const pokemonWeaknesses = getWeaknesses(pokemonTypes);
    const sharedWeaknesses = pokemonWeaknesses.filter(w => teamWeaknesses.includes(w));
    contribution -= sharedWeaknesses.length * 5;
    
    return contribution;
  }

  private async findBetterAlternatives(
    currentPokemon: Pokemon, 
    team: Pokemon[], 
    analysis: TeamAnalysis
  ): Promise<Pokemon[]> {
    const alternatives: Pokemon[] = [];
    const currentTypes = currentPokemon.types.map(t => t.type.name);
    const teamWithoutCurrent = team.filter(p => p.id !== currentPokemon.id);
    
    // Look for Pokemon with similar roles but better team fit
    const typesToTry = [
      ...currentTypes, // Same types
      ...this.getComplementaryTypes(teamWithoutCurrent, analysis) // Complementary types
    ];
    
    for (const type of [...new Set(typesToTry)].slice(0, 4)) {
      const pokemonOfType = await this.getPokemonByType(type, 3);
      
      for (const pokemon of pokemonOfType) {
        if (!team.some(p => p.id === pokemon.id)) {
          const contribution = this.calculateTeamContribution(pokemon, 
            [...teamWithoutCurrent, pokemon], analysis);
          const currentContribution = this.calculateTeamContribution(currentPokemon, team, analysis);
          
          if (contribution > currentContribution + 10) { // Significant improvement
            alternatives.push(pokemon);
          }
        }
      }
    }
    
    return alternatives.slice(0, 3);
  }

  private getComplementaryTypes(team: Pokemon[], analysis: TeamAnalysis): string[] {
    const teamTypes = team.flatMap(p => p.types.map(t => t.type.name));
    const complementaryTypes: string[] = [];
    
    // Types that resist critical weaknesses
    for (const weakness of analysis.criticalWeaknesses.slice(0, 2)) {
      const resistantTypes = this.getTypesResistantTo(weakness.type);
      complementaryTypes.push(...resistantTypes.filter(type => !teamTypes.includes(type)));
    }
    
    // Types that cover gaps
    for (const gap of analysis.coverageGaps.slice(0, 3)) {
      const effectiveTypes = this.getTypesEffectiveAgainst(gap);
      complementaryTypes.push(...effectiveTypes.filter(type => !teamTypes.includes(type)));
    }
    
    return [...new Set(complementaryTypes)];
  }

  private analyzePokemonRole(pokemon: Pokemon): PokemonAnalysis {
    if (this.roleAnalysisCache.has(pokemon.id)) {
      return this.roleAnalysisCache.get(pokemon.id)!;
    }

    const analysis = this.performRoleAnalysis(pokemon);
    this.roleAnalysisCache.set(pokemon.id, analysis);
    return analysis;
  }

  private performRoleAnalysis(pokemon: Pokemon): PokemonAnalysis {
    const stats = pokemon.stats || [];
    const types = pokemon.types.map(t => t.type.name);
    const roles: PokemonRole[] = [];
    
    // Get base stats
    const hp = stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
    const attack = stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const defense = stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
    const spAttack = stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
    const spDefense = stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
    const speed = stats.find(s => s.stat.name === 'speed')?.base_stat || 0;
    
    const totalStats = hp + attack + defense + spAttack + spDefense + speed;
    const offensiveStats = Math.max(attack, spAttack);
    const defensiveStats = (hp + defense + spDefense) / 3;
    
    // Role Classification Algorithm
    
    // Sweeper: High offensive stats + speed
    if (offensiveStats >= 100 && speed >= 90 && totalStats >= 500) {
      roles.push('sweeper');
    }
    
    // Wallbreaker: Very high offensive stats, may be slower
    if (offensiveStats >= 120 && totalStats >= 480) {
      roles.push('wallbreaker');
    }
    
    // Wall: High HP + one defensive stat, low offensive stats
    if (hp >= 100 && (defense >= 90 || spDefense >= 90) && offensiveStats < 90) {
      roles.push('wall');
    }
    
    // Tank: Decent bulk + moderate offense
    if (defensiveStats >= 85 && offensiveStats >= 70 && offensiveStats < 110) {
      roles.push('tank');
    }
    
    // Pivot: Balanced stats with good speed or bulk
    if (speed >= 80 && defensiveStats >= 75 && totalStats >= 480) {
      roles.push('pivot');
    }
    
    // Hazard Setter: Typically bulky, good for setting up
    if (this.canSetHazards(pokemon) && defensiveStats >= 70) {
      roles.push('hazard-setter');
    }
    
    // Defogger: Fast or bulky with hazard removal
    if (this.canRemoveHazards(pokemon) && (speed >= 80 || defensiveStats >= 80)) {
      roles.push('defogger');
    }
    
    // Support: Utility moves, decent bulk
    if (this.hasUtilityMoves(pokemon) && defensiveStats >= 70) {
      roles.push('support');
    }
    
    // If no specific roles, classify as utility
    if (roles.length === 0) {
      roles.push('utility');
    }

    return {
      roles,
      coreCompatibility: this.calculateCoreCompatibility(pokemon, types),
      threatsHandled: this.calculateThreatsHandled(pokemon, types),
      weaknessesExposed: getWeaknesses(types),
      synergy: this.calculateBaseSynergy(pokemon)
    };
  }

  private canSetHazards(pokemon: Pokemon): boolean {
    // Common hazard setters by ID (simplified)
    const hazardSetters = [
      76, 208, 227, 464, // Stealth Rock setters
      89, 205, 442, 563, // Spikes setters  
      169, 454, 569, 748  // Toxic Spikes setters
    ];
    return hazardSetters.includes(pokemon.id) || 
           pokemon.types.some(t => ['rock', 'ground', 'steel'].includes(t.type.name));
  }

  private canRemoveHazards(pokemon: Pokemon): boolean {
    // Common defoggers/spinners by ID (simplified)
    const hazardRemovers = [
      18, 83, 142, 227, 277, 334, 430, // Flying types (Defog)
      76, 465, 464, 530 // Rapid Spin users
    ];
    return hazardRemovers.includes(pokemon.id) ||
           pokemon.types.some(t => ['flying', 'psychic'].includes(t.type.name));
  }

  private hasUtilityMoves(pokemon: Pokemon): boolean {
    // Pokemon known for utility (simplified classification)
    const utilityPokemon = [
      113, 242, 196, 197, 282, 468, 700, // Support Pokemon
      122, 124, 144, 145, 146 // Status/utility specialists
    ];
    return utilityPokemon.includes(pokemon.id) ||
           pokemon.types.some(t => ['psychic', 'fairy', 'grass'].includes(t.type.name));
  }

  private calculateCoreCompatibility(pokemon: Pokemon, types: string[]): string[] {
    const compatible: string[] = [];
    
    // Famous core combinations
    const corePairs = {
      'fire-water-grass': ['fire', 'water', 'grass'],
      'dragon-steel-fairy': ['dragon', 'steel', 'fairy'],
      'electric-ground-flying': ['electric', 'ground', 'flying'],
      'fighting-psychic-dark': ['fighting', 'psychic', 'dark'],
      'rock-steel-water': ['rock', 'steel', 'water']
    };
    
    for (const [coreName, coreTypes] of Object.entries(corePairs)) {
      if (types.some(type => coreTypes.includes(type))) {
        compatible.push(coreName);
      }
    }
    
    return compatible;
  }

  private calculateThreatsHandled(pokemon: Pokemon, types: string[]): string[] {
    const threats: string[] = [];
    
    // What this Pokemon can handle based on resistances
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 
                      'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 
                      'dragon', 'dark', 'steel', 'fairy'];
    
    for (const attackingType of allTypes) {
      const effectiveness = calculateDamageMultiplier(attackingType, types);
      if (effectiveness < 1) {
        threats.push(`${attackingType}-type attacks`);
      }
    }
    
    return threats;
  }

  private calculateBaseSynergy(pokemon: Pokemon): number {
    const stats = pokemon.stats || [];
    const totalStats = stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const types = pokemon.types.map(t => t.type.name);
    
    let synergy = 0;
    
    // Base synergy from stats
    synergy += Math.min(totalStats / 15, 30);
    
    // Type synergy bonuses
    const strongTypes = ['dragon', 'steel', 'fairy', 'psychic', 'fighting'];
    if (types.some(type => strongTypes.includes(type))) synergy += 10;
    
    // Dual type bonus for coverage
    if (types.length === 2) synergy += 5;
    
    return Math.min(synergy, 50);
  }

  private async getPokemon(id: number): Promise<Pokemon> {
    if (this.pokemonCache.has(id)) {
      return this.pokemonCache.get(id)!;
    }

    try {
      const pokemon = await pokemonApi.getPokemonById(id);
      this.pokemonCache.set(id, pokemon);
      return pokemon;
    } catch (error) {
      throw new Error(`Failed to fetch Pokemon ${id}: ${error}`);
    }
  }

  private async getPokemonByType(type: string, limit: number): Promise<Pokemon[]> {
    const pokemonIds = POPULAR_POKEMON_BY_TYPE[type] || [];
    const results: Pokemon[] = [];
    
    for (const id of pokemonIds.slice(0, limit + 2)) {
      try {
        const pokemon = await this.getPokemon(id);
        if (pokemon.types.some(t => t.type.name === type)) {
          results.push(pokemon);
          if (results.length >= limit) break;
        }
      } catch (error) {
        console.warn(`Failed to fetch Pokemon ${id}:`, error);
        continue;
      }
    }
    
    return results;
  }

  private analyzeTeam(teamPokemon: Pokemon[]): TeamAnalysis {
    const teamTypes = teamPokemon.flatMap(p => p.types.map(t => t.type.name));
    const weaknessCounts: Record<string, { count: number; pokemon: string[] }> = {};
    
    // Analyze roles for each Pokemon
    const pokemonAnalyses = teamPokemon.map(pokemon => this.analyzePokemonRole(pokemon));
    
    // Count weaknesses
    teamPokemon.forEach(pokemon => {
      const pokemonTypes = pokemon.types.map(t => t.type.name);
      const weaknesses = getWeaknesses(pokemonTypes);
      
      weaknesses.forEach(weakness => {
        if (!weaknessCounts[weakness]) {
          weaknessCounts[weakness] = { count: 0, pokemon: [] };
        }
        weaknessCounts[weakness].count++;
        weaknessCounts[weakness].pokemon.push(pokemon.name);
      });
    });

    // Find critical weaknesses (affecting 2+ Pokemon)
    const criticalWeaknesses = Object.entries(weaknessCounts)
      .filter(([, data]) => data.count >= 2)
      .map(([type, data]) => ({ type, count: data.count, pokemon: data.pokemon }))
      .sort((a, b) => b.count - a.count);

    // Find coverage gaps
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 
                      'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 
                      'dragon', 'dark', 'steel', 'fairy'];
    
    const coverageGaps = allTypes.filter(defendingType => {
      return !teamTypes.some(attackingType => 
        getTypeEffectiveness(attackingType, defendingType) > 1
      );
    });

    // Advanced team analysis
    const roleDistribution = this.calculateRoleDistribution(pokemonAnalyses);
    const teamArchetype = this.determineTeamArchetype(pokemonAnalyses, teamPokemon);
    const missingRoles = this.identifyMissingRoles(roleDistribution, teamArchetype);
    const coreStrength = this.calculateCoreStrength(pokemonAnalyses, teamPokemon);
    const defensiveRating = this.calculateDefensiveRating(teamPokemon, criticalWeaknesses);
    const offensiveRating = this.calculateOffensiveRating(teamPokemon, coverageGaps);
    
    // Calculate overall team score and grade
    const overallTeamScore = this.calculateOverallTeamScore({
      teamPokemon, roleDistribution, teamArchetype, missingRoles, coreStrength,
      defensiveRating, offensiveRating, criticalWeaknesses, coverageGaps
    });
    const teamGrade = this.calculateTeamGrade(overallTeamScore);
    const teamStrengths = this.identifyTeamStrengths({ 
      coreStrength, defensiveRating, offensiveRating, roleDistribution, teamArchetype 
    });
    const teamWeaknesses = this.identifyTeamWeaknesses({ 
      criticalWeaknesses, coverageGaps, missingRoles, defensiveRating, offensiveRating 
    });

    return { 
      criticalWeaknesses, 
      coverageGaps, 
      teamArchetype,
      roleDistribution,
      missingRoles,
      coreStrength,
      defensiveRating,
      offensiveRating,
      overallTeamScore,
      teamGrade,
      teamStrengths,
      teamWeaknesses
    };
  }

  private calculateRoleDistribution(analyses: PokemonAnalysis[]): Record<PokemonRole, number> {
    const distribution: Record<PokemonRole, number> = {
      'sweeper': 0, 'wallbreaker': 0, 'wall': 0, 'tank': 0, 'pivot': 0, 
      'hazard-setter': 0, 'defogger': 0, 'support': 0, 'utility': 0
    };

    analyses.forEach(analysis => {
      analysis.roles.forEach(role => {
        distribution[role]++;
      });
    });

    return distribution;
  }

  private determineTeamArchetype(analyses: PokemonAnalysis[], team: Pokemon[]): TeamAnalysis['teamArchetype'] {
    const roles = this.calculateRoleDistribution(analyses);
    const teamSize = team.length;
    
    if (teamSize < 3) return 'undefined';
    
    // Calculate team stats averages
    const avgSpeed = team.reduce((sum, p) => {
      const speed = p.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0;
      return sum + speed;
    }, 0) / teamSize;
    
    const avgBulk = team.reduce((sum, p) => {
      const hp = p.stats?.find(s => s.stat.name === 'hp')?.base_stat || 0;
      const def = p.stats?.find(s => s.stat.name === 'defense')?.base_stat || 0;
      const spDef = p.stats?.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
      return sum + (hp + def + spDef) / 3;
    }, 0) / teamSize;

    // Archetype determination logic
    if (roles.wall >= 3 && roles.sweeper <= 1) {
      return 'stall';
    } else if (roles.sweeper >= 2 && avgSpeed >= 90) {
      return 'hyper-offense';
    } else if (roles.wallbreaker >= 2 && avgBulk >= 75) {
      return 'bulky-offense';
    } else if (roles.wall >= 1 && roles.sweeper >= 1 && roles.wallbreaker >= 1) {
      return 'balance';
    }
    
    return 'undefined';
  }

  private identifyMissingRoles(roles: Record<PokemonRole, number>, archetype: TeamAnalysis['teamArchetype']): PokemonRole[] {
    const missing: PokemonRole[] = [];
    
    // Role requirements by archetype
    const requirements = {
      'balance': { wall: 1, sweeper: 1, wallbreaker: 1, 'hazard-setter': 1 },
      'stall': { wall: 3, support: 1, defogger: 1, 'hazard-setter': 1 },
      'hyper-offense': { sweeper: 2, wallbreaker: 1, 'hazard-setter': 1 },
      'bulky-offense': { wallbreaker: 2, tank: 1, defogger: 1 },
      'undefined': {}
    };
    
    const required = requirements[archetype] || {};
    
    for (const [role, count] of Object.entries(required)) {
      if (roles[role as PokemonRole] < count) {
        missing.push(role as PokemonRole);
      }
    }
    
    return missing;
  }

  private calculateCoreStrength(analyses: PokemonAnalysis[], team: Pokemon[]): number {
    let strength = 0;
    const teamSize = team.length;
    
    // Check for famous core combinations
    const coreTypes = {
      'FWG': ['fire', 'water', 'grass'],
      'DSF': ['dragon', 'steel', 'fairy'],
      'FPD': ['fighting', 'psychic', 'dark']
    };
    
    const teamTypes = team.flatMap(p => p.types.map(t => t.type.name));
    
    for (const [coreName, types] of Object.entries(coreTypes)) {
      const hasCore = types.every(type => teamTypes.includes(type));
      if (hasCore) strength += 25;
    }
    
    // Check role synergy
    const avgSynergy = analyses.reduce((sum, a) => sum + a.synergy, 0) / teamSize;
    strength += avgSynergy;
    
    // Check defensive coverage
    const typesCovered = new Set(teamTypes).size;
    strength += typesCovered * 2;
    
    return Math.min(strength, 100);
  }

  private calculateDefensiveRating(team: Pokemon[], weaknesses: TeamAnalysis['criticalWeaknesses']): number {
    let rating = 85; // Higher base rating
    
    // More balanced penalty for critical weaknesses
    const totalWeaknessPenalty = weaknesses.reduce((penalty, weakness) => {
      // Penalty scales with how many Pokemon are affected, but not as harshly
      return penalty + Math.min(weakness.count * 4, 12); // Cap per weakness at 12 points
    }, 0);
    
    // Cap total weakness penalty at 40 points maximum
    rating -= Math.min(totalWeaknessPenalty, 40);
    
    // Bonus for defensive Pokemon
    const avgBulk = team.reduce((sum, p) => {
      const hp = p.stats?.find(s => s.stat.name === 'hp')?.base_stat || 0;
      const def = p.stats?.find(s => s.stat.name === 'defense')?.base_stat || 0;
      const spDef = p.stats?.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
      return sum + (hp + def + spDef) / 3;
    }, 0) / team.length;
    
    // More generous defensive bonuses
    if (avgBulk > 75) rating += 10;
    if (avgBulk > 90) rating += 10;
    if (avgBulk > 105) rating += 5;
    
    // Bonus for type diversity (better defensive coverage)
    const teamTypes = new Set(team.flatMap(p => p.types.map(t => t.type.name)));
    if (teamTypes.size >= 6) rating += 5;
    if (teamTypes.size >= 8) rating += 5;
    
    return Math.max(20, Math.min(rating, 100)); // Minimum 20, maximum 100
  }

  private calculateOffensiveRating(team: Pokemon[], gaps: string[]): number {
    let rating = 60; // Base rating
    
    // Penalty for coverage gaps
    rating -= gaps.length * 3;
    
    // Bonus for offensive Pokemon
    const avgOffense = team.reduce((sum, p) => {
      const att = p.stats?.find(s => s.stat.name === 'attack')?.base_stat || 0;
      const spAtt = p.stats?.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
      return sum + Math.max(att, spAtt);
    }, 0) / team.length;
    
    if (avgOffense > 90) rating += 15;
    if (avgOffense > 110) rating += 10;
    
    // Bonus for speed
    const avgSpeed = team.reduce((sum, p) => {
      const speed = p.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0;
      return sum + speed;
    }, 0) / team.length;
    
    if (avgSpeed > 85) rating += 10;
    if (avgSpeed > 100) rating += 5;
    
    return Math.max(0, Math.min(rating, 100));
  }

  private calculateOverallTeamScore(params: {
    teamPokemon: Pokemon[];
    roleDistribution: Record<PokemonRole, number>;
    teamArchetype: TeamAnalysis['teamArchetype'];
    missingRoles: PokemonRole[];
    coreStrength: number;
    defensiveRating: number;
    offensiveRating: number;
    criticalWeaknesses: Array<{ type: string; count: number; pokemon: string[] }>;
    coverageGaps: string[];
  }): number {
    const { 
      teamPokemon, roleDistribution, teamArchetype, missingRoles, 
      coreStrength, defensiveRating, offensiveRating, criticalWeaknesses, coverageGaps 
    } = params;
    
    let score = 40; // Base score for having Pokemon
    const teamSize = teamPokemon.length;
    
    // Team Completeness (0-20 points)
    score += (teamSize / 6) * 20;
    
    // Role Balance (0-15 points)
    const totalRoles = Object.values(roleDistribution).reduce((sum, count) => sum + count, 0);
    const roleBalance = totalRoles > 0 ? Math.min(totalRoles / teamSize * 10, 15) : 0;
    score += roleBalance;
    
    // Missing Roles Penalty (0 to -10 points)
    score -= Math.min(missingRoles.length * 2, 10);
    
    // Archetype Coherence (0-10 points)
    if (teamArchetype !== 'undefined' && teamSize >= 3) {
      score += 10;
    } else if (teamSize >= 3) {
      score -= 5; // Penalty for unclear strategy
    }
    
    // Core Strength (weighted 20%)
    score += coreStrength * 0.2;
    
    // Defensive Rating (weighted 25%)
    score += defensiveRating * 0.25;
    
    // Offensive Rating (weighted 25%) 
    score += offensiveRating * 0.25;
    
    // Critical Weaknesses Penalty (0 to -15 points)
    const weaknessPenalty = criticalWeaknesses.reduce((penalty, weakness) => {
      return penalty + (weakness.count * 2);
    }, 0);
    score -= Math.min(weaknessPenalty, 15);
    
    // Coverage Gaps Penalty (0 to -10 points)
    const gapPenalty = Math.min(coverageGaps.length, 10);
    score -= gapPenalty;
    
    // Team Size Bonus/Penalty
    if (teamSize === 6) {
      score += 5; // Bonus for complete team
    } else if (teamSize < 3) {
      score -= 10; // Penalty for very incomplete team
    }
    
    // Individual Pokemon Quality (0-10 points)
    const avgStats = teamPokemon.reduce((sum, pokemon) => {
      const totalStats = pokemon.stats?.reduce((s, stat) => s + stat.base_stat, 0) || 0;
      return sum + totalStats;
    }, 0) / teamSize;
    
    const qualityBonus = Math.min((avgStats - 400) / 50, 10); // Bonus for high-stat Pokemon
    score += Math.max(0, qualityBonus);
    
    return Math.round(Math.max(0, Math.min(score, 100)));
  }

  private calculateTeamGrade(score: number): TeamAnalysis['teamGrade'] {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private identifyTeamStrengths(params: {
    coreStrength: number;
    defensiveRating: number;
    offensiveRating: number;
    roleDistribution: Record<PokemonRole, number>;
    teamArchetype: TeamAnalysis['teamArchetype'];
  }): string[] {
    const { coreStrength, defensiveRating, offensiveRating, roleDistribution, teamArchetype } = params;
    const strengths: string[] = [];
    
    // Rating-based strengths
    if (defensiveRating >= 80) {
      strengths.push('Excellent defensive coverage');
    } else if (defensiveRating >= 70) {
      strengths.push('Good defensive synergy');
    }
    
    if (offensiveRating >= 80) {
      strengths.push('Outstanding offensive pressure');
    } else if (offensiveRating >= 70) {
      strengths.push('Solid offensive coverage');
    }
    
    if (coreStrength >= 75) {
      strengths.push('Strong type core synergy');
    }
    
    // Archetype-based strengths
    if (teamArchetype === 'balance') {
      strengths.push('Well-balanced team composition');
    } else if (teamArchetype === 'hyper-offense') {
      strengths.push('High-speed aggressive strategy');
    } else if (teamArchetype === 'stall') {
      strengths.push('Defensive endurance strategy');
    } else if (teamArchetype === 'bulky-offense') {
      strengths.push('Controlled offensive pressure');
    }
    
    // Role-based strengths
    if (roleDistribution.sweeper >= 2) {
      strengths.push('Multiple win conditions');
    }
    
    if (roleDistribution.wall >= 2) {
      strengths.push('Strong defensive backbone');
    }
    
    if (roleDistribution['hazard-setter'] >= 1 && roleDistribution.defogger >= 1) {
      strengths.push('Complete hazard control');
    }
    
    return strengths.slice(0, 4); // Limit to top 4 strengths
  }

  private identifyTeamWeaknesses(params: {
    criticalWeaknesses: Array<{ type: string; count: number; pokemon: string[] }>;
    coverageGaps: string[];
    missingRoles: PokemonRole[];
    defensiveRating: number;
    offensiveRating: number;
  }): string[] {
    const { criticalWeaknesses, coverageGaps, missingRoles, defensiveRating, offensiveRating } = params;
    const weaknesses: string[] = [];
    
    // Critical weaknesses
    if (criticalWeaknesses.length > 0) {
      const topWeakness = criticalWeaknesses[0];
      weaknesses.push(`Vulnerable to ${topWeakness.type} attacks (${topWeakness.count} Pokemon affected)`);
    }
    
    // Coverage gaps
    if (coverageGaps.length >= 8) {
      weaknesses.push(`Limited offensive coverage (${coverageGaps.length} types uncovered)`);
    } else if (coverageGaps.length >= 5) {
      weaknesses.push('Some offensive coverage gaps');
    }
    
    // Rating-based weaknesses
    if (defensiveRating < 60) {
      weaknesses.push('Poor defensive synergy');
    }
    
    if (offensiveRating < 60) {
      weaknesses.push('Weak offensive presence');
    }
    
    // Missing roles
    if (missingRoles.length >= 3) {
      weaknesses.push('Unclear team strategy');
    } else if (missingRoles.length >= 1) {
      const missingRoleNames = missingRoles.slice(0, 2).map(role => role.replace('-', ' ')).join(' and ');
      weaknesses.push(`Missing ${missingRoleNames} role${missingRoles.length > 1 ? 's' : ''}`);
    }
    
    return weaknesses.slice(0, 4); // Limit to top 4 weaknesses
  }

  private getTypesResistantTo(attackingType: string): string[] {
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 
                      'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 
                      'dragon', 'dark', 'steel', 'fairy'];
    
    return allTypes.filter(defendingType => 
      getTypeEffectiveness(attackingType, defendingType) < 1
    );
  }

  private getTypesEffectiveAgainst(defendingType: string): string[] {
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 
                      'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 
                      'dragon', 'dark', 'steel', 'fairy'];
    
    return allTypes.filter(attackingType => 
      getTypeEffectiveness(attackingType, defendingType) > 1
    );
  }

  private pokemonIsWeakTo(pokemon: Pokemon, attackingType: string): boolean {
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    return calculateDamageMultiplier(attackingType, pokemonTypes) > 1;
  }

  private calculateBenefits(pokemon: Pokemon, analysis: TeamAnalysis, teamTypes: string[]): string[] {
    const benefits: string[] = [];
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    
    // Check resistances to critical weaknesses
    for (const weakness of analysis.criticalWeaknesses) {
      if (calculateDamageMultiplier(weakness.type, pokemonTypes) < 1) {
        benefits.push(`Resists ${weakness.type} attacks`);
      }
    }

    // Check coverage additions
    const newCoverage = pokemonTypes.filter(type => 
      analysis.coverageGaps.some(gap => getTypeEffectiveness(type, gap) > 1)
    );
    
    if (newCoverage.length > 0) {
      benefits.push(`Adds coverage against ${newCoverage.slice(0, 2).join(', ')}`);
    }

    // Check type diversity
    const newTypes = pokemonTypes.filter(type => !teamTypes.includes(type));
    if (newTypes.length > 0) {
      benefits.push(`Adds new ${newTypes.join('/')} typing`);
    }

    // Check stats
    const totalStats = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
    if (totalStats >= 500) {
      benefits.push('High base stat total');
    }

    return benefits;
  }

  private calculateSwapBenefits(oldPokemon: Pokemon, newPokemon: Pokemon, analysis: TeamAnalysis): string[] {
    const benefits: string[] = [];
    const oldTypes = oldPokemon.types.map(t => t.type.name);
    const newTypes = newPokemon.types.map(t => t.type.name);
    
    // Compare weakness improvements
    for (const weakness of analysis.criticalWeaknesses) {
      const oldMultiplier = calculateDamageMultiplier(weakness.type, oldTypes);
      const newMultiplier = calculateDamageMultiplier(weakness.type, newTypes);
      
      if (oldMultiplier > 1 && newMultiplier <= 1) {
        benefits.push(`Fixes ${weakness.type} weakness`);
      }
    }

    // Compare stats
    const oldTotal = oldPokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
    const newTotal = newPokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
    
    if (newTotal > oldTotal + 50) {
      benefits.push('Better overall stats');
    }

    return benefits;
  }

  private calculateScore(pokemon: Pokemon, analysis: TeamAnalysis, teamTypes: string[]): number {
    let score = 20; // Reduced base score
    const pokemonAnalysis = this.analyzePokemonRole(pokemon);
    
    // Role-based scoring (most important factor)
    score += this.calculateRoleScore(pokemonAnalysis, analysis) * 0.6; // Max 21 points
    
    // Team composition scoring  
    score += this.calculateTeamCompositionScore(pokemonAnalysis, analysis) * 0.7; // Max 17.5 points
    
    // Traditional scoring components (reduced weight)
    score += this.calculateDefensiveScore(pokemon, analysis) * 0.4; // Max 12 points
    score += this.calculateOffensiveScore(pokemon, analysis) * 0.4; // Max 10 points
    score += this.calculateSynergyScore(pokemon, teamTypes) * 0.3; // Max 6 points
    score += this.calculateStatsScore(pokemon) * 0.3; // Max 6 points
    score += this.calculateRarityScore(pokemon); // Max 8 points

    // Total possible: 20 + 21 + 17.5 + 12 + 10 + 6 + 6 + 8 = 100.5 points
    return Math.round(Math.min(score, 100));
  }

  private calculateRoleScore(pokemonAnalysis: PokemonAnalysis, teamAnalysis: TeamAnalysis): number {
    let roleScore = 0;
    
    // High bonus for filling missing roles (more selective)
    for (const role of pokemonAnalysis.roles) {
      if (teamAnalysis.missingRoles.includes(role)) {
        roleScore += 15; // Reduced from 20
      }
    }
    
    // Bonus based on team archetype needs (more selective)
    const archetype = teamAnalysis.teamArchetype;
    
    if (archetype === 'balance') {
      if (pokemonAnalysis.roles.includes('wall') && teamAnalysis.roleDistribution.wall < 2) roleScore += 8;
      if (pokemonAnalysis.roles.includes('sweeper') && teamAnalysis.roleDistribution.sweeper < 2) roleScore += 8;
      if (pokemonAnalysis.roles.includes('wallbreaker') && teamAnalysis.roleDistribution.wallbreaker < 2) roleScore += 8;
    } else if (archetype === 'hyper-offense') {
      if (pokemonAnalysis.roles.includes('sweeper')) roleScore += 12;
      if (pokemonAnalysis.roles.includes('wallbreaker')) roleScore += 8;
    } else if (archetype === 'stall') {
      if (pokemonAnalysis.roles.includes('wall')) roleScore += 12;
      if (pokemonAnalysis.roles.includes('support')) roleScore += 8;
      if (pokemonAnalysis.roles.includes('defogger')) roleScore += 8;
    } else if (archetype === 'bulky-offense') {
      if (pokemonAnalysis.roles.includes('wallbreaker')) roleScore += 12;
      if (pokemonAnalysis.roles.includes('tank')) roleScore += 8;
    }
    
    // Penalty for oversaturated roles
    for (const role of pokemonAnalysis.roles) {
      if (teamAnalysis.roleDistribution[role] >= 3) {
        roleScore -= 8; // Reduced penalty
      }
    }
    
    return Math.min(roleScore, 35);
  }

  private calculateTeamCompositionScore(pokemonAnalysis: PokemonAnalysis, teamAnalysis: TeamAnalysis): number {
    let compositionScore = 0;
    
    // Core compatibility bonus (more selective)
    compositionScore += pokemonAnalysis.coreCompatibility.length * 3;
    
    // Team synergy bonus (reduced)
    compositionScore += pokemonAnalysis.synergy * 0.2;
    
    // Threat coverage bonus (reduced)
    const newThreats = pokemonAnalysis.threatsHandled.filter(threat => 
      !teamAnalysis.criticalWeaknesses.some(cw => threat.includes(cw.type))
    );
    compositionScore += Math.min(newThreats.length, 3) * 1.5; // Cap at 3 threats, 1.5 points each
    
    // Team rating improvement estimation (more selective)
    if (teamAnalysis.defensiveRating < 60 && pokemonAnalysis.roles.some(r => ['wall', 'tank'].includes(r))) {
      compositionScore += 6;
    }
    
    if (teamAnalysis.offensiveRating < 60 && pokemonAnalysis.roles.some(r => ['sweeper', 'wallbreaker'].includes(r))) {
      compositionScore += 6;
    }
    
    // Core strength improvement (more selective)
    if (teamAnalysis.coreStrength < 50) {
      compositionScore += Math.min(pokemonAnalysis.synergy / 3, 5);
    }
    
    return Math.min(compositionScore, 25);
  }

  private calculateDefensiveScore(pokemon: Pokemon, analysis: TeamAnalysis): number {
    let defensiveScore = 0;
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    
    // Major bonus for resisting critical weaknesses
    for (const weakness of analysis.criticalWeaknesses) {
      const multiplier = calculateDamageMultiplier(weakness.type, pokemonTypes);
      if (multiplier < 1) {
        // More points for resisting weaknesses that affect more team members
        defensiveScore += 15 + (weakness.count * 3);
        if (multiplier <= 0.5) defensiveScore += 5; // Extra for immunity/double resistance
      }
    }

    // Penalty for adding new weaknesses to the team
    const newWeaknesses = getWeaknesses(pokemonTypes);
    const commonWeaknesses = newWeaknesses.filter(weakness => 
      analysis.criticalWeaknesses.some(cw => cw.type === weakness)
    );
    defensiveScore -= commonWeaknesses.length * 8;

    // Bonus for having defensive stats
    const defenseStats = pokemon.stats?.filter(stat => 
      stat.stat.name === 'defense' || stat.stat.name === 'special-defense' || stat.stat.name === 'hp'
    ) || [];
    const avgDefense = defenseStats.reduce((sum, stat) => sum + stat.base_stat, 0) / defenseStats.length;
    if (avgDefense > 80) defensiveScore += 8;
    if (avgDefense > 100) defensiveScore += 5;

    return Math.min(defensiveScore, 30);
  }

  private calculateOffensiveScore(pokemon: Pokemon, analysis: TeamAnalysis): number {
    let offensiveScore = 0;
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    
    // Bonus for covering offensive gaps
    const coverageBonus = pokemonTypes.reduce((bonus, pokemonType) => {
      const gapsCovered = analysis.coverageGaps.filter(gap => 
        getTypeEffectiveness(pokemonType, gap) > 1
      ).length;
      return bonus + (gapsCovered * 4);
    }, 0);
    offensiveScore += Math.min(coverageBonus, 20);

    // Bonus for having strong offensive stats
    const offenseStats = pokemon.stats?.filter(stat => 
      stat.stat.name === 'attack' || stat.stat.name === 'special-attack' || stat.stat.name === 'speed'
    ) || [];
    const avgOffense = offenseStats.reduce((sum, stat) => sum + stat.base_stat, 0) / offenseStats.length;
    if (avgOffense > 90) offensiveScore += 8;
    if (avgOffense > 110) offensiveScore += 5;

    // Bonus for strong offensive types
    const strongOffensiveTypes = ['dragon', 'fighting', 'ground', 'rock', 'steel'];
    const hasStrongOffensiveType = pokemonTypes.some(type => strongOffensiveTypes.includes(type));
    if (hasStrongOffensiveType) offensiveScore += 5;

    return Math.min(offensiveScore, 25);
  }

  private calculateSynergyScore(pokemon: Pokemon, teamTypes: string[]): number {
    let synergyScore = 0;
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    
    // Type diversity bonus
    const newTypes = pokemonTypes.filter(pokemonType => !teamTypes.includes(pokemonType));
    synergyScore += newTypes.length * 6;

    // Bonus for complementary type combinations
    const complementaryPairs = [
      ['fire', 'water'], ['fire', 'ground'], ['water', 'electric'], 
      ['grass', 'fire'], ['grass', 'flying'], ['electric', 'ground'],
      ['psychic', 'dark'], ['fighting', 'psychic'], ['ghost', 'normal'],
      ['steel', 'fire'], ['dragon', 'ice'], ['fairy', 'steel']
    ];
    
    for (const [type1, type2] of complementaryPairs) {
      const hasType1 = pokemonTypes.includes(type1) || teamTypes.includes(type1);
      const hasType2 = pokemonTypes.includes(type2) || teamTypes.includes(type2);
      if (hasType1 && hasType2) synergyScore += 3;
    }

    // Penalty for too much type overlap
    const overlappingTypes = pokemonTypes.filter(type => teamTypes.includes(type));
    synergyScore -= overlappingTypes.length * 3;

    return Math.min(synergyScore, 20);
  }

  private calculateStatsScore(pokemon: Pokemon): number {
    const stats = pokemon.stats || [];
    if (stats.length === 0) return 0;
    
    const totalStats = stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    let statsScore = Math.min(totalStats / 15, 15); // Scale down

    // Bonus for balanced stats vs min-maxed
    const statValues = stats.map(s => s.base_stat);
    const maxStat = Math.max(...statValues);
    const minStat = Math.min(...statValues);
    const statSpread = maxStat - minStat;
    
    if (statSpread < 60) statsScore += 3; // Bonus for balanced Pokemon
    if (maxStat > 130) statsScore += 2; // Bonus for having at least one exceptional stat

    return Math.min(statsScore, 20);
  }

  private calculateRarityScore(pokemon: Pokemon): number {
    // Bonus based on Pokemon "rarity" or power level
    const id = pokemon.id;
    
    // Legendary/Mythical bonus (rough ID ranges)
    if (id >= 144 && id <= 151) return 8; // Gen 1 legendaries
    if (id >= 243 && id <= 251) return 8; // Gen 2 legendaries  
    if (id >= 377 && id <= 386) return 8; // Gen 3 legendaries
    if (id >= 480 && id <= 493) return 8; // Gen 4 legendaries
    
    // Pseudo-legendary bonus
    const pseudoLegendaries = [149, 248, 373, 376, 445, 484, 612, 635, 700, 706];
    if (pseudoLegendaries.includes(id)) return 6;
    
    // Popular competitive Pokemon bonus
    const competitivePokemon = [6, 9, 65, 68, 94, 130, 142, 196, 197, 212, 214, 229, 254, 257, 260];
    if (competitivePokemon.includes(id)) return 4;
    
    return 0;
  }

  private generateAddReason(pokemon: Pokemon, analysis: TeamAnalysis, teamTypes: string[]): string {
    const pokemonAnalysis = this.analyzePokemonRole(pokemon);
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    
    // Role-based reasons first
    const missingRoles = analysis.missingRoles.filter(role => pokemonAnalysis.roles.includes(role));
    if (missingRoles.length > 0) {
      const roleNames = missingRoles.map(role => role.replace('-', ' ')).join(' and ');
      return `Fills critical ${roleNames} role needed for your ${analysis.teamArchetype} team`;
    }
    
    // Archetype-specific reasons
    if (analysis.teamArchetype === 'hyper-offense' && pokemonAnalysis.roles.includes('sweeper')) {
      return `Fast sweeper perfect for your hyper-offensive team strategy`;
    }
    
    if (analysis.teamArchetype === 'stall' && pokemonAnalysis.roles.includes('wall')) {
      return `Defensive wall that strengthens your stall strategy`;
    }
    
    if (analysis.teamArchetype === 'balance' && pokemonAnalysis.roles.length >= 2) {
      return `Versatile Pokemon that fills multiple roles in your balanced team`;
    }
    
    // Defensive reasons
    for (const weakness of analysis.criticalWeaknesses) {
      if (calculateDamageMultiplier(weakness.type, pokemonTypes) < 1) {
        return `Resists ${weakness.type} attacks that threaten ${weakness.count} of your Pokemon`;
      }
    }

    // Offensive coverage
    const coverageTypes = pokemonTypes.filter(type => 
      analysis.coverageGaps.some(gap => getTypeEffectiveness(type, gap) > 1)
    );
    
    if (coverageTypes.length > 0) {
      return `Provides super effective coverage against ${coverageTypes.slice(0, 2).join(' and ')} types`;
    }

    // Core synergy
    if (pokemonAnalysis.coreCompatibility.length > 0) {
      return `Completes ${pokemonAnalysis.coreCompatibility[0]} core synergy`;
    }
    
    // Team rating improvement
    if (analysis.defensiveRating < 70 && pokemonAnalysis.roles.some(r => ['wall', 'tank'].includes(r))) {
      return `Improves team's defensive rating (currently ${analysis.defensiveRating}/100)`;
    }
    
    if (analysis.offensiveRating < 70 && pokemonAnalysis.roles.some(r => ['sweeper', 'wallbreaker'].includes(r))) {
      return `Boosts team's offensive power (currently ${analysis.offensiveRating}/100)`;
    }

    // Type diversity fallback
    const newTypes = pokemonTypes.filter(type => !teamTypes.includes(type));
    if (newTypes.length > 0) {
      return `Adds valuable ${newTypes.join('/')} typing to your team`;
    }

    return `High-tier Pokemon with excellent competitive viability`;
  }

  private generateSwapReason(oldPokemon: Pokemon, newPokemon: Pokemon): string {
    return `Replace ${oldPokemon.name} with ${newPokemon.name} to improve team balance and fix weaknesses`;
  }
}

interface TeamAnalysis {
  criticalWeaknesses: Array<{ type: string; count: number; pokemon: string[] }>;
  coverageGaps: string[];
  teamArchetype: 'balance' | 'stall' | 'hyper-offense' | 'bulky-offense' | 'undefined';
  roleDistribution: Record<PokemonRole, number>;
  missingRoles: PokemonRole[];
  coreStrength: number;
  defensiveRating: number;
  offensiveRating: number;
  overallTeamScore: number;
  teamGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  teamStrengths: string[];
  teamWeaknesses: string[];
}

export const teamRecommendationService = new TeamRecommendationService();