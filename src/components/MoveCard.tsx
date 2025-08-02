'use client';

import { Move } from '@/types/pokemon';
import { moveApi, moveTypeColors } from '@/services/moves';

interface MoveCardProps {
  move: Move;
  onClick?: (move: Move) => void;
}

export default function MoveCard({ move, onClick }: MoveCardProps) {
  const typeColor = moveTypeColors[move.type.name] || '#68D391';
  const damageClassColor = moveApi.getDamageClassColor(move.damage_class.name);

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

  const formatMoveName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
      style={{ borderTop: `4px solid ${typeColor}` }}
      onClick={() => onClick?.(move)}
    >
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
            #{move.id.toString().padStart(3, '0')}
          </div>
          <div className="text-2xl">
            {moveApi.getDamageClassIcon(move.damage_class.name)}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 text-center">
          {formatMoveName(move.name)}
        </h3>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: typeColor,
              color: getTextColor(typeColor)
            }}
          >
            {capitalizeFirstLetter(move.type.name)}
          </span>
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: damageClassColor,
              color: getTextColor(damageClassColor)
            }}
          >
            {capitalizeFirstLetter(move.damage_class.name)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
          <div className="text-center">
            <div className="font-semibold">Power</div>
            <div>{move.power || '—'}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Accuracy</div>
            <div>{move.accuracy ? `${move.accuracy}%` : '—'}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">PP</div>
            <div>{move.pp}</div>
          </div>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-300 text-center">
          <p className="line-clamp-2">
            {moveApi.getEnglishDescription(move)}
          </p>
        </div>
      </div>
    </div>
  );
}