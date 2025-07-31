import { Pokemon, PokemonListResponse, PokemonSpecies } from '@/types/pokemon';

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