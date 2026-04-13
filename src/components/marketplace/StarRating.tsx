import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md';
}

const StarRating = ({ rating, onRate, size = 'md' }: StarRatingProps) => {
  const sz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!onRate}
          onClick={() => onRate?.(i)}
          className={onRate ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star className={`${sz} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
