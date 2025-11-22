import React, { useEffect, useRef } from "react";
import "./VerticalCarousel.css";
import theatreSeats from "./theatreseats.jpg";
import imageone from './imageone.jpg';
import imagetwo from './imagetwo.jpg';
import imagethree from './imagethree.jpg';
import imagefour from './imagefour.jpg';


const images = [
  theatreSeats,
  imageone,
 imagetwo,
  imagethree,
  imagefour
];

const VerticalCarousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!containerRef.current) return;

      indexRef.current = (indexRef.current + 1) % images.length;

      containerRef.current.style.transform = `translateY(-${
        indexRef.current * 100
      }vh)`;
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="full-vertical-carousel">
      <div ref={containerRef} className="carousel-inner">
        {images.map((src, idx) => (
          <div key={idx} className="carousel-item">
            <img src={src} alt={`slide-${idx}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerticalCarousel;
