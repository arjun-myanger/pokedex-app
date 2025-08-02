import { Move, MoveListResponse } from '@/types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const moveApi = {
  async getMoveList(limit: number = 20, offset: number = 0): Promise<MoveListResponse> {
    const response = await fetch(`${BASE_URL}/move?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      throw new Error('Failed to fetch move list');
    }
    return response.json();
  },

  async getMoveByName(name: string): Promise<Move> {
    const response = await fetch(`${BASE_URL}/move/${name.toLowerCase()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch move: ${name}`);
    }
    return response.json();
  },

  async getMoveById(id: number): Promise<Move> {
    const response = await fetch(`${BASE_URL}/move/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch move with ID: ${id}`);
    }
    return response.json();
  },

  async searchMoves(query: string): Promise<Move[]> {
    try {
      const move = await this.getMoveByName(query);
      return [move];
    } catch {
      const listResponse = await this.getMoveList(1000);
      const filteredMoves = listResponse.results.filter(m => 
        m.name.toLowerCase().includes(query.toLowerCase())
      );
      
      const movePromises = filteredMoves.slice(0, 10).map(m => 
        this.getMoveByName(m.name)
      );
      
      return Promise.all(movePromises);
    }
  },

  async getMovesByType(type: string): Promise<Move[]> {
    const listResponse = await this.getMoveList(1000);
    const movePromises = listResponse.results.slice(0, 50).map(m => 
      this.getMoveByName(m.name)
    );
    
    const moves = await Promise.all(movePromises);
    return moves.filter(move => move.type.name === type.toLowerCase());
  },

  formatMoveName(name: string): string {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  },

  getDamageClassColor(damageClass: string): string {
    const colors: { [key: string]: string } = {
      physical: '#C92A2A', // Red
      special: '#5F3DC4',   // Purple
      status: '#495057'     // Gray
    };
    return colors[damageClass] || '#495057';
  },

  getDamageClassIcon(damageClass: string): string {
    const icons: { [key: string]: string } = {
      physical: '⚔️',
      special: '✨',
      status: '🔧'
    };
    return icons[damageClass] || '❓';
  },

  getEnglishDescription(move: Move): string {
    const englishEntry = move.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    return englishEntry?.flavor_text.replace(/\n/g, ' ') || 'No description available.';
  },

  getEnglishEffect(move: Move): string {
    const englishEntry = move.effect_entries.find(
      entry => entry.language.name === 'en'  
    );
    return englishEntry?.short_effect || englishEntry?.effect || 'No effect description available.';
  }
};

export const moveTypeColors: { [key: string]: string } = {
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