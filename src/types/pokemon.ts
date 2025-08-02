export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
      dream_world: {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  species: {
    name: string;
    url: string;
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: {
    name: string;
    url: string;
  };
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  evolution_chain: {
    url: string;
  };
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
}

export type PokemonTypeColor = {
  [key: string]: string;
};

export interface LocationArea {
  id: number;
  name: string;
  game_index: number;
  encounter_method_rates: EncounterMethodRate[];
  location: {
    name: string;
    url: string;
  };
  names: {
    name: string;
    language: {
      name: string;
    };
  }[];
  pokemon_encounters: PokemonEncounter[];
}

export interface EncounterMethodRate {
  encounter_method: {
    name: string;
    url: string;
  };
  version_details: {
    rate: number;
    version: {
      name: string;
      url: string;
    };
  }[];
}

export interface PokemonEncounter {
  pokemon: {
    name: string;
    url: string;
  };
  version_details: EncounterVersionDetail[];
}

export interface EncounterVersionDetail {
  version: {
    name: string;
    url: string;
  };
  max_chance: number;
  encounter_details: EncounterDetail[];
}

export interface EncounterDetail {
  min_level: number;
  max_level: number;
  condition_values: unknown[];
  chance: number;
  method: {
    name: string;
    url: string;
  };
}

export interface PokemonLocationInfo {
  locationName: string;
  areaName: string;
  method: string;
  chance: number;
  minLevel: number;
  maxLevel: number;
  versions: string[];
}

// Move-related interfaces
export interface Move {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number;
  priority: number;
  damage_class: {
    name: string;
    url: string;
  };
  type: {
    name: string;
    url: string;
  };
  effect_entries: EffectEntry[];
  flavor_text_entries: FlavorTextEntry[];
  generation: {
    name: string;
    url: string;
  };
  target: {
    name: string;
    url: string;
  };
  contest_type: {
    name: string;
    url: string;
  } | null;
  contest_effect: {
    url: string;
  } | null;
  super_contest_effect: {
    url: string;
  } | null;
  machines: MoveVersion[];
  learned_by_pokemon: NamedAPIResource[];
  stat_changes: StatChange[];
  meta: MoveMeta;
}

export interface EffectEntry {
  effect: string;
  short_effect: string;
  language: {
    name: string;
    url: string;
  };
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
    url: string;
  };
  version_group: {
    name: string;
    url: string;
  };
}

export interface MoveVersion {
  machine: {
    url: string;
  };
  version_group: {
    name: string;
    url: string;
  };
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface StatChange {
  change: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface MoveMeta {
  ailment: {
    name: string;
    url: string;
  };
  category: {
    name: string;
    url: string;
  };
  min_hits: number | null;
  max_hits: number | null;
  min_turns: number | null;
  max_turns: number | null;
  drain: number;
  healing: number;
  crit_rate: number;
  ailment_chance: number;
  flinch_chance: number;
  stat_chance: number;
}

export interface MoveListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: PokemonMoveVersion[];
}

export interface PokemonMoveVersion {
  level_learned_at: number;
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
}