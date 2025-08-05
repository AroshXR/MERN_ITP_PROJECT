import React, { useEffect, useRef, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function TShirtModel({ selectedColor, frontDesigns = [], backDesigns = [], scale, position, ...props }) {
  const group = useRef();
  const { nodes, materials } = useGLTF('/models/t_shirt.glb');
  
  // Create textures for front and back designs
  const frontTexture = useMemo(() => {
    if (frontDesigns.length === 0) return null;
    
    // Create a canvas to combine base color with designs
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Fill with base color first
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create a promise-based approach for loading images
    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    // Load and draw all designs
    Promise.all(frontDesigns.map(design => loadImage(design.preview)))
      .then(images => {
        images.forEach((img, index) => {
          if (img) {
            const design = frontDesigns[index];
            const size = design.size || 80;
            const x = (canvas.width / 2) + (design.position?.x || 0) * 2;
            const y = (canvas.height / 2) - (design.position?.y || 0) * 2;
            
            ctx.drawImage(
              img, 
              x - size/2, 
              y - size/2, 
              size, 
              size
            );
          }
        });
        
        // Update texture after all images are loaded
        if (texture) {
          texture.needsUpdate = true;
        }
      });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [frontDesigns, selectedColor]);
  
  const backTexture = useMemo(() => {
    if (backDesigns.length === 0) return null;
    
    // Create a canvas to combine base color with designs
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Fill with base color first
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create a promise-based approach for loading images
    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    // Load and draw all designs
    Promise.all(backDesigns.map(design => loadImage(design.preview)))
      .then(images => {
        images.forEach((img, index) => {
          if (img) {
            const design = backDesigns[index];
            const size = design.size || 80;
            const x = (canvas.width / 2) + (design.position?.x || 0) * 2;
            const y = (canvas.height / 2) - (design.position?.y || 0) * 2;
            
            ctx.drawImage(
              img, 
              x - size/2, 
              y - size/2, 
              size, 
              size
            );
          }
        });
        
        // Update texture after all images are loaded
        if (texture) {
          texture.needsUpdate = true;
        }
      });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [backDesigns, selectedColor]);

  // Update material colors and textures
  useEffect(() => {
    if (materials) {
      // Update front material
      if (materials.Body_FRONT_2664) {
        if (frontTexture) {
          // Use the combined texture that includes base color + designs
          materials.Body_FRONT_2664.map = frontTexture;
          materials.Body_FRONT_2664.transparent = false;
          materials.Body_FRONT_2664.needsUpdate = true;
        } else {
          // No designs, just use base color
          materials.Body_FRONT_2664.map = null;
          materials.Body_FRONT_2664.color.set(selectedColor);
          materials.Body_FRONT_2664.transparent = false;
          materials.Body_FRONT_2664.needsUpdate = true;
        }
      }
      
      if (materials.Sleeves_FRONT_2669) {
        materials.Sleeves_FRONT_2669.color.set(selectedColor);
      }
      
      // Create back material if it doesn't exist
      if (!materials.Body_BACK_2664 && materials.Body_FRONT_2664) {
        materials.Body_BACK_2664 = materials.Body_FRONT_2664.clone();
        materials.Body_BACK_2664.name = 'Body_BACK_2664';
      }
      
      // Update back material
      if (materials.Body_BACK_2664) {
        if (backTexture) {
          // Use the combined texture that includes base color + designs
          materials.Body_BACK_2664.map = backTexture;
          materials.Body_BACK_2664.transparent = false;
          materials.Body_BACK_2664.needsUpdate = true;
        } else {
          // No designs, just use base color
          materials.Body_BACK_2664.map = null;
          materials.Body_BACK_2664.color.set(selectedColor);
          materials.Body_BACK_2664.transparent = false;
          materials.Body_BACK_2664.needsUpdate = true;
        }
      }
    }
  }, [selectedColor, materials, frontTexture, backTexture]);

  return (
    <group
      {...props}
      dispose={null}
      ref={group}
      scale={scale || 0.3}
      position={position || [1.3, -1, 0]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_6.geometry}
        material={materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_8.geometry}
        material={materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_10.geometry}
        material={materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_11.geometry}
        material={materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_12.geometry}
        material={materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_14.geometry}
        material={materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_15.geometry}
        material={materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_16.geometry}
        material={materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_18.geometry}
        material={materials.Sleeves_FRONT_2669}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_20.geometry}
        material={materials.Sleeves_FRONT_2669}
      />
    </group>
  )
}

useGLTF.preload('/models/t_shirt.glb')

