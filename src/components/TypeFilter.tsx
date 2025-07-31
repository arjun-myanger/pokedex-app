'use client';

import { pokemonTypeColors } from '@/services/pokemon';

interface TypeFilterProps {
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
}

const pokemonTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

function getTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default function TypeFilter({ selectedType, onTypeSelect }: TypeFilterProps) {
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Filter by Type:</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeSelect(null)}
          className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedType === null
              ? 'bg-gray-800 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Types
        </button>
        {pokemonTypes.map((type) => {
          const backgroundColor = pokemonTypeColors[type] || '#68D391';
          const textColor = getTextColor(backgroundColor);
          const isSelected = selectedType === type;
          
          return (
            <button
              key={type}
              onClick={() => onTypeSelect(type)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isSelected 
                  ? 'shadow-lg transform scale-105' 
                  : 'hover:transform hover:scale-105 hover:shadow-md'
              }`}
              style={{
                backgroundColor: backgroundColor,
                color: textColor,
                border: isSelected ? `2px solid ${textColor}` : '2px solid transparent'
              }}
            >
              {capitalizeFirstLetter(type)}
            </button>
          );
        })}
      </div>
    </div>
  );
}