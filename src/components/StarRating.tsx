import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 Star — Poor Experience',
  2: '2 Stars — Fair Experience',
  3: '3 Stars — Average Experience',
  4: '4 Stars — Good Experience',
  5: '5 Stars — Exceptional Experience',
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : value;

  return (
    <div className="rating-section" role="group" aria-label="Customer Rating">
      <div className="rating-header">
        <span className="rating-title">Your Rating</span>
        <span className={`rating-status ${value ? 'selected' : ''}`}>
          {value ? RATING_LABELS[value] : 'Select rating (1 to 5 stars)'}
        </span>
      </div>

      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (displayRating ?? 0) >= star;
          return (
            <button
              key={star}
              type="button"
              className="star-button"
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              onFocus={() => !disabled && setHoverRating(star)}
              onBlur={() => !disabled && setHoverRating(null)}
              aria-label={`Rate ${star} out of 5 stars`}
              aria-pressed={value === star}
            >
              <Star
                className={`star-icon ${isFilled ? 'active' : 'empty'}`}
                strokeWidth={1.25}
              />
            </button>
          );
        })}
      </div>
      <p className="rating-note">
        No rating is pre-selected. Please choose the rating that reflects your personal visit.
      </p>
    </div>
  );
};
