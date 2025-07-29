import { Html } from "@react-three/drei"

// 3D Hoodie Component
function Hoodie({ color = "#ffffff", designs = [] }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.5, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />

        <mesh position={[-0.85, 0.3, 0]}>
          <boxGeometry args={[0.5, 0.9, 0.12]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[0.85, 0.3, 0]}>
          <boxGeometry args={[0.5, 0.9, 0.12]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
        </mesh>

        <mesh position={[0, 0.8, 0.1]}>
          <boxGeometry args={[0.8, 0.4, 0.3]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
        </mesh>

        <mesh position={[0, -0.2, 0.05]}>
          <boxGeometry args={[0.6, 0.3, 0.05]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
        </mesh>

        <mesh position={[-0.1, 0.65, 0.08]}>
          <cylinderGeometry args={[0.01, 0.01, 0.2]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.1, 0.65, 0.08]}>
          <cylinderGeometry args={[0.01, 0.01, 0.2]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </mesh>

      {/* Design area for hoodie */}
      <mesh position={[0, 0.2, 0.07]}>
        <Html transform>
          <div
            style={{
              width: "120px",
              height: "120px",
              border: "2px dashed rgba(100, 100, 100, 0.3)",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Html>
      </mesh>

      {/* Render designs for hoodie */}
      {designs.map((design) => (
        <mesh key={design.id} position={[design.position.x, design.position.y, 0.08]}>
          <Html transform>
            <div
              style={{
                width: `${design.size}px`,
                height: `${design.size}px`,
                backgroundImage: `url(${design.preview})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: design.selected ? "2px solid #3b82f6" : "2px solid rgba(255,255,255,0.8)",
                borderRadius: "4px",
                transform: "translate(-50%, -50%)",
                cursor: "move",
                position: "relative",
              }}
            >
              {design.selected && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-5px",
                      right: "-5px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#3b82f6",
                      borderRadius: "50%",
                      cursor: "se-resize",
                    }}
                  />
                </>
              )}
            </div>
          </Html>
        </mesh>
      ))}
    </group>
  )
}

export default Hoodie
