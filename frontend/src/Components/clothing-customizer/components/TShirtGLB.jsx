"use client"
import { useGLTF, Html } from "@react-three/drei"

// Individual Design Element Component
function DesignElement({ design }) {
  return (
    <Html
      position={[design.position.x, design.position.y, 0.07]}
      transform
      style={{
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
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
        onClick={(e) => {
          e.stopPropagation()
          // Handle design selection
        }}
      >
        {design.selected && (
          <>
            {/* Resize handles */}
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
            <div
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                width: "10px",
                height: "10px",
                backgroundColor: "#3b82f6",
                borderRadius: "50%",
                cursor: "ne-resize",
              }}
            />
          </>
        )}
      </div>
    </Html>
  )
}

export function TShirtGLB({ color = "#ffffff", designs = [], ...props }) {
  const { nodes, materials } = useGLTF("/public/t_shirt.glb")

  // Clone and modify materials to use the selected color
  const modifiedMaterial = materials.Body_FRONT_2664?.clone()
  if (modifiedMaterial) {
    modifiedMaterial.color.set(color)
  }

  const sleeveMaterial = materials.Sleeves_FRONT_2669?.clone()
  if (sleeveMaterial) {
    sleeveMaterial.color.set(color)
  }

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_6?.geometry}
        material={modifiedMaterial || materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_8?.geometry}
        material={modifiedMaterial || materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_10?.geometry}
        material={modifiedMaterial || materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_11?.geometry}
        material={modifiedMaterial || materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_12?.geometry}
        material={modifiedMaterial || materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_14?.geometry}
        material={modifiedMaterial || materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_15?.geometry}
        material={modifiedMaterial || materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_16?.geometry}
        material={modifiedMaterial || materials.Body_FRONT_2664}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_18?.geometry}
        material={sleeveMaterial || materials.Sleeves_FRONT_2669}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_20?.geometry}
        material={sleeveMaterial || materials.Sleeves_FRONT_2669}
      />

      {/* Design area outline - positioned on chest area */}
      <Html position={[0, 0.3, 0.06]} transform>
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

      {/* Render placed designs */}
      {designs.map((design) => (
        <DesignElement key={design.id} design={design} />
      ))}
    </group>
  )
}

useGLTF.preload("/public/t_shirt.glb")
