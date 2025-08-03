import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function TShirtModel({ selectedColor, scale, position, ...props }) {

  const group = useRef();
  const { nodes, materials } = useGLTF('/models/t_shirt.glb');

  useEffect(() => {
    if (materials) {
      if (materials.Body_FRONT_2664) {
        materials.Body_FRONT_2664.color.set(selectedColor);
      }
      if (materials.Sleeves_FRONT_2669) {
        materials.Sleeves_FRONT_2669.color.set(selectedColor);
      }
    }
  }, [selectedColor, materials]);

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

