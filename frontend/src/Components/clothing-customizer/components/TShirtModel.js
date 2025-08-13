import React, { useEffect, useRef, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function TShirtModel({ selectedColor, presetDesign, chestDesignUrl, frontDesigns = [], scale, position, ...props }) {
  const group = useRef();
  const { nodes, materials } = useGLTF('/models/t_shirt.glb');

  const activeDesignUrl = presetDesign?.imageUrl || chestDesignUrl

  const designTexture = useTexture(activeDesignUrl || "/logo192.png")

  const designMaterial = useMemo(() => {
    if (activeDesignUrl) {
      const material = new THREE.MeshStandardMaterial({
        map: designTexture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.FrontSide,
      })

      // Configure texture
      designTexture.flipY = false
      designTexture.wrapS = THREE.ClampToEdgeWrapping
      designTexture.wrapT = THREE.ClampToEdgeWrapping
      designTexture.minFilter = THREE.LinearFilter
      designTexture.magFilter = THREE.LinearFilter

      return material
    }
    return null
  }, [activeDesignUrl, designTexture])

  // Update material colors and textures
  useEffect(() => {
    if (materials) {
      // Update front material
      if (materials.Body_FRONT_2664) {
        materials.Body_FRONT_2664.map = null;
        materials.Body_FRONT_2664.color.set(selectedColor);
        materials.Body_FRONT_2664.transparent = false;
        materials.Body_FRONT_2664.needsUpdate = true;
      }

      if (materials.Sleeves_FRONT_2669) {
        materials.Sleeves_FRONT_2669.color.set(selectedColor);
      }

      // Create back material if it doesn't exist
      if (!materials.Body_BACK_2664 && materials.Body_FRONT_2664) {
        materials.Body_BACK_2664 = materials.Body_FRONT_2664.clone();
        materials.Body_BACK_2664.name = 'Body_BACK_2664';
      }
    }
  }, [materials, selectedColor]);

  useEffect(() => {
    if (nodes.ChestDesignFace && materials) {
      if (!materials.DesignArea) {
        materials.DesignArea = materials.Body_FRONT_2664.clone();
        materials.DesignArea.name = 'DesignArea';
      }

      if (chestDesignUrl) {
        materials.DesignArea.map = designTexture;
        materials.DesignArea.map.flipY = false;
        materials.DesignArea.needsUpdate = true;
      } else {
        materials.DesignArea.map = null;
        materials.DesignArea.color.set(selectedColor);
      }
      materials.DesignArea.needsUpdate = true;
    }
  }, [nodes, materials, selectedColor, chestDesignUrl, designTexture]);


  return (
    <group
      {...props}
      dispose={null}
      ref={group}
      scale={scale || 0.3}
      position={position || [1.3, -1, 0]}
    >
      {/* <mesh
        castShadow
        receiveShadow
        geometry={nodes.ChestDesignFace?.geometry}
        material={materials.DesignArea || materials.Body_FRONT_2664}
        position={[0.004, 0, 0.01]}
      /> */}

      {/* Chest design area - will show the image */}
      {nodes.ChestDesignFace && activeDesignUrl && designMaterial && (
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.ChestDesignFace.geometry}
          material={designMaterial}
          position={[0.004, 0, 0.015]}
        />
      )}

      {nodes.ChestDesignFace && !activeDesignUrl && (
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.ChestDesignFace.geometry}
          material={materials.DesignArea || materials.Body_FRONT_2664}
          position={[0.004, 0, 0.01]}
        />
      )}

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

