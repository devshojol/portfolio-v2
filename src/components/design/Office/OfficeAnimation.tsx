'use client';
import { Environment, OrbitControls, ScrollControls, useGLTF } from '@react-three/drei';
import React from 'react';

const OfficeAnimation = () => {
  const { scene } = useGLTF('./office.glb');
  return (
    <>
      <Environment
        files={['https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/4k/studio_small_09_4k.exr']}
      />
      {/* <ScrollControls pages={3}> */}
      <OrbitControls />
      <group
      // position={[10, 0, 10]}
      >
        <primitive object={scene} />
      </group>
      {/* </ScrollControls> */}
    </>
  );
};

export default OfficeAnimation;
