'use client';

import { useState, useEffect } from 'react';
import { Move } from '@/types/pokemon';
import { moveApi } from '@/services/moves';
import MoveCard from './MoveCard';

interface MovesGridProps {
  searchQuery?: string;
  selectedType?: string | null;
  onMoveSelect?: (move: Move | null) => void;
}

export default function MovesGrid({ searchQuery, selectedType, onMoveSelect }: MovesGridProps) {
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadMore, setLoadMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchMoves = async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (searchQuery && searchQuery.trim()) {
        const searchResults = await moveApi.searchMoves(searchQuery);
        setMoves(searchResults);
        setOffset(0);
      } else if (selectedType) {
        const typeResults = await moveApi.getMovesByType(selectedType);
        setMoves(typeResults);
        setOffset(0);
      } else {
        const currentOffset = reset ? 0 : offset;
        const listResponse = await moveApi.getMoveList(limit, currentOffset);
        
        const moveDetails = await Promise.all(
          listResponse.results.map(m => moveApi.getMoveByName(m.name))
        );
        
        if (reset) {
          setMoves(moveDetails);
        } else {
          setMoves(prev => [...prev, ...moveDetails]);
        }
        
        setOffset(currentOffset + limit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch moves');
    } finally {
      setLoading(false);
      setLoadMore(false);
    }
  };

  useEffect(() => {
    fetchMoves(true);
  }, [searchQuery, selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (!searchQuery && !selectedType && !loadMore) {
      setLoadMore(true);
      fetchMoves(false);
    }
  };

  const handleMoveClick = (move: Move) => {
    onMoveSelect?.(move);
  };

  if (loading && moves.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p className="text-lg font-semibold mb-2">Oops! Something went wrong</p>
        <p>{error}</p>
        <button 
          onClick={() => fetchMoves(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (moves.length === 0 && !loading) {
    return (
      <div className="text-center text-gray-500 p-8">
        <p className="text-lg">No moves found</p>
        <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {moves.map((move) => (
          <MoveCard 
            key={move.id} 
            move={move} 
            onClick={handleMoveClick}
          />
        ))}
      </div>

      {!searchQuery && !selectedType && moves.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadMore}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              'Load More Moves'
            )}
          </button>
        </div>
      )}
    </div>
  );
}