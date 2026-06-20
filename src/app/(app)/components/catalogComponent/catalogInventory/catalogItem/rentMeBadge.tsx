"use client";
import { useId } from "react";

const SIZE = 312;
const CENTER = SIZE / 2;
const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Texto repetido que da la vuelta completa al círculo.
const RING_TEXT = "RENT ME NOW · RENT ME NOW · RENT ME NOW · ";

const RentMeBadge: React.FC = () => {
  // id único por instancia para evitar choques al renderizar varias cards.
  const pathId = useId();

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      className="rotating"
      style={{ width: "100%", display: "block" }}
      aria-label="rent me now"
    >
      <defs>
        <path
          id={pathId}
          fill="none"
          d={`M ${CENTER},${CENTER} m -${RADIUS},0 a ${RADIUS},${RADIUS} 0 1,1 ${
            RADIUS * 2
          },0 a ${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`}
        />
      </defs>
      <text
        fill="#fff"
        fontFamily="Futura, sans-serif"
        fontSize="34"
        fontWeight={500}
        letterSpacing="1"
        textLength={CIRCUMFERENCE}
        lengthAdjust="spacingAndGlyphs"
      >
        <textPath href={`#${pathId}`} startOffset="0">
          {RING_TEXT}
        </textPath>
      </text>
    </svg>
  );
};

export default RentMeBadge;
