// "use client"
// import { Html } from "@react-three/drei"

// // Fallback T-Shirt Model using geometry (more realistic than before)
// export default function TShirtModel({
//   color = "#ffffff",
//   designs = [],
//   ...props
// }: { color?: string; designs?: any[] }) {
//   return (
//     <group {...props} dispose={null}>
//       {/* Main body - more realistic t-shirt shape */}
//       <mesh position={[0, 0, 0]} castShadow receiveShadow>
//         <boxGeometry args={[1.4, 1.8, 0.1]} />
//         <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
//       </mesh>

//       {/* Left sleeve */}
//       <mesh position={[-0.9, 0.4, 0]} rotation={[0, 0, -0.1]} castShadow receiveShadow>
//         <boxGeometry args={[0.4, 0.6, 0.1]} />
//         <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
//       </mesh>

//       {/* Right sleeve */}
//       <mesh position={[0.9, 0.4, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
//         <boxGeometry args={[0.4, 0.6, 0.1]} />
//         <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
//       </mesh>

//       {/* Neck opening */}
//       <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
//         <cylinderGeometry args={[0.15, 0.15, 0.12]} />
//         <meshStandardMaterial color="#f0f0f0" roughness={0.9} metalness={0.0} />
//       </mesh>

//       {/* Sleeve cuffs */}
//       <mesh position={[-0.9, 0.1, 0]} castShadow receiveShadow>
//         <cylinderGeometry args={[0.12, 0.12, 0.12]} />
//         <meshStandardMaterial color="#f0f0f0" roughness={0.9} metalness={0.0} />
//       </mesh>
//       <mesh position={[0.9, 0.1, 0]} castShadow receiveShadow>
//         <cylinderGeometry args={[0.12, 0.12, 0.12]} />
//         <meshStandardMaterial color="#f0f0f0" roughness={0.9} metalness={0.0} />
//       </mesh>

//       {/* Bottom hem */}
//       <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
//         <cylinderGeometry args={[0.7, 0.7, 0.12]} />
//         <meshStandardMaterial color="#f0f0f0" roughness={0.9} metalness={0.0} />
//       </mesh>

//       {/* Design area outline - positioned on chest area */}
//       <Html position={[0, 0.3, 0.06]} transform>
//         <div
//           style={{
//             width: "120px",
//             height: "120px",
//             border: "2px dashed rgba(100, 100, 100, 0.3)",
//             borderRadius: "8px",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             pointerEvents: "none",
//             transform: "translate(-50%, -50%)",
//           }}
//         />
//       </Html>

//       {/* Render placed designs */}
//       {designs.map((design) => (
//         <DesignElement key={design.id} design={design} />
//       ))}
//     </group>
//   )
// }

// // Individual Design Element Component
// function DesignElement({ design }: { design: any }) {
//   return (
//     <Html
//       position={[design.position.x, design.position.y, 0.07]}
//       transform
//       style={{
//         pointerEvents: "auto",
//         userSelect: "none",
//       }}
//     >
//       <div
//         style={{
//           width: `${design.size}px`,
//           height: `${design.size}px`,
//           backgroundImage: `url(${design.preview})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           border: design.selected ? "2px solid #3b82f6" : "2px solid rgba(255,255,255,0.8)",
//           borderRadius: "4px",
//           transform: "translate(-50%, -50%)",
//           cursor: "move",
//           position: "relative",
//         }}
//         onClick={(e) => {
//           e.stopPropagation()
//           // Handle design selection
//         }}
//       >
//         {design.selected && (
//           <>
//             {/* Resize handles */}
//             <div
//               style={{
//                 position: "absolute",
//                 bottom: "-5px",
//                 right: "-5px",
//                 width: "10px",
//                 height: "10px",
//                 backgroundColor: "#3b82f6",
//                 borderRadius: "50%",
//                 cursor: "se-resize",
//               }}
//             />
//             <div
//               style={{
//                 position: "absolute",
//                 top: "-5px",
//                 right: "-5px",
//                 width: "10px",
//                 height: "10px",
//                 backgroundColor: "#3b82f6",
//                 borderRadius: "50%",
//                 cursor: "ne-resize",
//               }}
//             />
//           </>
//         )}
//       </div>
//     </Html>
//   )
// }
