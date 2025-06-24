"use client";

import { useState } from 'react';

interface RatingProps {
  totalStars?: number;
  initialRating?: number;
  onRatingSubmit: (rating: number) => void;
}

export default function Rating({ totalStars = 10, initialRating = 0, onRatingSubmit }: RatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (ratingValue: number) => {
    setRating(ratingValue);
    onRatingSubmit(ratingValue);
  };

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={`text-3xl transition-colors duration-200 ${
              ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            &#9733; {/* 星星字符 */}
          </button>
        );
      })}
    </div>
  );
}