import { Canvas } from '@react-three/fiber';
import React, { useEffect, useState } from 'react';
import OfficeAnimation from './OfficeAnimation';

function Office() {
  const [showModel, setShowModel] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModel(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full w-full">
      {showModel && (
        <Canvas camera={{ fov: 10, position: [10, 0, 10] }} resize={{ offsetSize: true }}>
          <OfficeAnimation />
        </Canvas>
      )}
    </div>
  );
}

export default Office;
