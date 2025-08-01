import { Pokemon, PokemonListResponse, PokemonSpecies, LocationArea, PokemonLocationInfo } from '@/types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const pokemonApi = {
  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokemon list');
    }
    return response.json();
  },

  async getPokemonByName(name: string): Promise<Pokemon> {
    const response = await fetch(`${BASE_URL}/pokemon/${name.toLowerCase()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon: ${name}`);
    }
    return response.json();
  },

  async getPokemonById(id: number): Promise<Pokemon> {
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon with ID: ${id}`);
    }
    return response.json();
  },

  async getPokemonSpecies(id: number): Promise<PokemonSpecies> {
    const response = await fetch(`${BASE_URL}/pokemon-species/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon species with ID: ${id}`);
    }
    return response.json();
  },

  async searchPokemon(query: string): Promise<Pokemon[]> {
    try {
      const pokemon = await this.getPokemonByName(query);
      return [pokemon];
    } catch {
      const listResponse = await this.getPokemonList(1000);
      const filteredPokemon = listResponse.results.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      
      const pokemonPromises = filteredPokemon.slice(0, 10).map(p => 
        this.getPokemonByName(p.name)
      );
      
      return Promise.all(pokemonPromises);
    }
  },

  async getPokemonLocationAreas(pokemonId: number): Promise<LocationArea[]> {
    const response = await fetch(`${BASE_URL}/pokemon/${pokemonId}/encounters`);
    if (!response.ok) {
      throw new Error(`Failed to fetch location data for Pokemon ID: ${pokemonId}`);
    }
    const locationAreaUrls = await response.json();
    
    const locationPromises = locationAreaUrls.map(async (encounter: { location_area: { url: string } }) => {
      const areaResponse = await fetch(encounter.location_area.url);
      if (!areaResponse.ok) return null;
      return areaResponse.json();
    });
    
    const locations = await Promise.all(locationPromises);
    return locations.filter(Boolean);
  },

  async getPokemonLocations(pokemonId: number): Promise<PokemonLocationInfo[]> {
    try {
      const locationAreas = await this.getPokemonLocationAreas(pokemonId);
      const pokemon = await this.getPokemonById(pokemonId);
      const locationInfo: PokemonLocationInfo[] = [];

      for (const area of locationAreas) {
        const pokemonEncounter = area.pokemon_encounters.find(
          encounter => encounter.pokemon.name === pokemon.name
        );

        if (pokemonEncounter) {
          for (const versionDetail of pokemonEncounter.version_details) {
            for (const encounterDetail of versionDetail.encounter_details) {
              locationInfo.push({
                locationName: this.formatLocationName(area.location.name),
                areaName: this.formatLocationName(area.name),
                method: this.formatMethodName(encounterDetail.method.name),
                chance: encounterDetail.chance,
                minLevel: encounterDetail.min_level,
                maxLevel: encounterDetail.max_level,
                versions: [this.formatVersionName(versionDetail.version.name)]
              });
            }
          }
        }
      }

      return this.consolidateLocationInfo(locationInfo);
    } catch (error) {
      console.error('Failed to fetch location data:', error);
      return [];
    }
  },

  formatLocationName(name: string): string {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  },

  formatMethodName(method: string): string {
    const methodMap: { [key: string]: string } = {
      'walk': '🌱 Walking',
      'surf': '🌊 Surfing',
      'old-rod': '🎣 Old Rod',
      'good-rod': '🎣 Good Rod',
      'super-rod': '🎣 Super Rod',
      'rock-smash': '🪨 Rock Smash',
      'headbutt': '🌳 Headbutt',
      'gift': '🎁 Gift',
      'only-one': '⭐ Event'
    };
    return methodMap[method] || `📍 ${this.formatLocationName(method)}`;
  },

  formatVersionName(version: string): string {
    const versionMap: { [key: string]: string } = {
      'diamond': 'Diamond',
      'pearl': 'Pearl',
      'platinum': 'Platinum',
      'heartgold': 'HeartGold',
      'soulsilver': 'SoulSilver',
      'black': 'Black',
      'white': 'White',
      'black-2': 'Black 2',
      'white-2': 'White 2',
      'x': 'X',
      'y': 'Y',
      'omega-ruby': 'Omega Ruby',
      'alpha-sapphire': 'Alpha Sapphire',
      'sun': 'Sun',
      'moon': 'Moon',
      'ultra-sun': 'Ultra Sun',
      'ultra-moon': 'Ultra Moon',
      'sword': 'Sword',
      'shield': 'Shield'
    };
    return versionMap[version] || version.charAt(0).toUpperCase() + version.slice(1);
  },

  consolidateLocationInfo(locations: PokemonLocationInfo[]): PokemonLocationInfo[] {
    const consolidated: { [key: string]: PokemonLocationInfo } = {};

    locations.forEach(loc => {
      const key = `${loc.locationName}-${loc.method}-${loc.minLevel}-${loc.maxLevel}`;
      if (consolidated[key]) {
        consolidated[key].versions = [...new Set([...consolidated[key].versions, ...loc.versions])];
        consolidated[key].chance = Math.max(consolidated[key].chance, loc.chance);
      } else {
        consolidated[key] = { ...loc };
      }
    });

    return Object.values(consolidated).sort((a, b) => b.chance - a.chance);
  }
};

export const getPokemonImageUrl = (id: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};

export const pokemonTypeColors: { [key: string]: string } = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};