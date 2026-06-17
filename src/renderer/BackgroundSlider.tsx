import React, { useEffect, useState } from 'react';

import waterActivityImg from '../../assets/water-activity.jpg';
import cabinsImg from '../../assets/cabins.jpg';
import nightFireImg from '../../assets/night-fire.jpg';
import sailingImg from '../../assets/sailing-2018.jpg';
import waterBottleImg from '../../assets/water-bottles.jpg';

const imageUrls = [
  `url("${waterActivityImg}")`,
  `url("${cabinsImg}")`,
  `url("${nightFireImg}")`,
  `url("${sailingImg}")`,
  `url("${waterBottleImg}")`,
];

export const BackgroundSlider: React.FC = React.memo(() => {
  const [currentBgImage, setCurrentBgImage] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBgImage(prev => (prev + 1) % imageUrls.length);
    }, 6000); // 6 seconds for testing rotation speed

    return () => clearInterval(intervalId);
  }, []);

  const isEven = currentBgImage % 2 === 0;

  const customStyles = {
    '--bg-a': isEven
      ? imageUrls[currentBgImage]
      : imageUrls[(currentBgImage - 1 + imageUrls.length) % imageUrls.length],
    '--bg-b': !isEven
      ? imageUrls[currentBgImage]
      : imageUrls[(currentBgImage - 1 + imageUrls.length) % imageUrls.length],
  } as React.CSSProperties;

  return (
    <div className={`bg-image ${isEven ? 'show-layer-a' : 'show-layer-b'}`} style={customStyles} />
  );
});
