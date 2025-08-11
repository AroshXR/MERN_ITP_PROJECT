
// import React, { useEffect, useRef } from 'react'
// import { useGLTF } from '@react-three/drei'

// export function CropTopModel({ selectedColor, scale, position, ...props}) {

//   const group = useRef();
//   const { nodes, materials } = useGLTF('/models/crop_top.glb');

//   useEffect(() => {
//     if (materials) {
//       if (materials.Top_Low_obj) {
//         materials.Top_Low_obj.color.set(selectedColor);
//       }

//     }
//   }, [selectedColor, materials]);

//   return (
//     <group
//       {...props}
//       dispose={null}
//       ref={group}
//       scale={scale || 0.3}
//       position={position || [1.3, -1, 0]}
//     >
//       <mesh
//         castShadow
//         receiveShadow
//         geometry={nodes.Top_Low_obj_Top_Low_obj_0.geometry}
//         material={materials.Top_Low_obj}
//         scale={0.01}
//       />
//     </group>
//   )
// }

// useGLTF.preload('/models/crop_top.glb')

