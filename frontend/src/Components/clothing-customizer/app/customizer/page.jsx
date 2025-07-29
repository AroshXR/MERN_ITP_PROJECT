"use client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei"
import { Suspense, useState, useCallback } from "react"
import { Upload, Palette, Shirt, DollarSign } from "lucide-react"

// Simple Button Component
function Button({ children, onClick, className = "", variant = "default", disabled = false, ...props }) {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
  }
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Simple Card Component
function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
}

function CardHeader({ children, className = "" }) {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
}

function CardContent({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
}

// Simple Badge Component
function Badge({ children, variant = "default", className = "" }) {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

// Simple Separator Component
function Separator({ className = "" }) {
  return <hr className={`border-gray-200 ${className}`} />
}

// T-Shirt GLB Component
function TShirtGLB({ color = "#ffffff", designs = [], ...props }) {
  const { nodes, materials } = useGLTF("frontend/src/Components/clothing-customizer/assets/t_shirt.glb")

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

      {/* Design area outline */}
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
        <Html key={design.id} position={[design.position.x, design.position.y, 0.07]} transform>
          <div
            style={{
              width: `${design.size}px`,
              height: `${design.size}px`,
              backgroundImage: `url(${design.preview})`,
              backgroundSize: "cover",
              border: design.selected ? "2px solid #3b82f6" : "2px solid rgba(255,255,255,0.8)",
              borderRadius: "4px",
              transform: "translate(-50%, -50%)",
              cursor: "move",
            }}
          >
            {design.selected && (
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
            )}
          </div>
        </Html>
      ))}
    </group>
  )
}

useGLTF.preload("/t_shirt.glb")

// Preset Design Component
function PresetDesign({ design, onSelect }) {
  const handleDragStart = (event) => {
    event.dataTransfer.setData("application/json", JSON.stringify(design))
    event.dataTransfer.effectAllowed = "copy"
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
      onClick={() => onSelect(design)}
    >
      <div draggable onDragStart={handleDragStart} className="p-3">
        <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
          <img
            src={design.preview || "/placeholder.svg?height=100&width=100&text=Design"}
            alt={design.name}
            className="w-full h-full object-cover rounded-md"
            draggable={false}
          />
        </div>
        <h4 className="font-medium text-sm">{design.name}</h4>
        <Badge variant="secondary" className="mt-1">
          ${design.price}
        </Badge>
        <p className="text-xs text-gray-500 mt-1">Drag to design area</p>
      </div>
    </Card>
  )
}

// Price Calculator Component
function PriceCalculator({ basePrice, designPrice, customImagePrice, hasCustomImage }) {
  const totalPrice = basePrice + designPrice + (hasCustomImage ? customImagePrice : 0)

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Price Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>Base T-Shirt:</span>
          <span>${basePrice}</span>
        </div>

        {designPrice > 0 && (
          <div className="flex justify-between">
            <span>Designs:</span>
            <span>${designPrice}</span>
          </div>
        )}

        {hasCustomImage && (
          <div className="flex justify-between">
            <span>Custom Image:</span>
            <span>${customImagePrice}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${totalPrice}</span>
        </div>

        <Button className="w-full mt-4">Add to Cart</Button>
      </CardContent>
    </Card>
  )
}

// Main Customizer Component
export default function ClothingCustomizer() {
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [selectedDesign, setSelectedDesign] = useState(null)
  const [hasCustomImage, setHasCustomImage] = useState(false)
  const [placedDesigns, setPlacedDesigns] = useState([])
  const [designSize, setDesignSize] = useState(80)
  const [selectedDesignId, setSelectedDesignId] = useState(null)

  const presetDesigns = [
    { id: 1, name: "Vintage Logo", price: 15, preview: "/placeholder.svg?height=100&width=100&text=Logo" },
    { id: 2, name: "Abstract Art", price: 20, preview: "/placeholder.svg?height=100&width=100&text=Art" },
    { id: 3, name: "Nature Scene", price: 18, preview: "/placeholder.svg?height=100&width=100&text=Nature" },
    { id: 4, name: "Geometric Pattern", price: 12, preview: "/placeholder.svg?height=100&width=100&text=Geo" },
    { id: 5, name: "Typography", price: 10, preview: "/placeholder.svg?height=100&width=100&text=Text" },
    { id: 6, name: "Minimalist", price: 8, preview: "/placeholder.svg?height=100&width=100&text=Mini" },
  ]

  const colors = ["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]

  const handleDesignDrop = useCallback(
    (design, position) => {
      const constrainedX = Math.max(-0.2, Math.min(0.2, position.x))
      const constrainedY = Math.max(0.1, Math.min(0.5, position.y))

      const newDesign = {
        ...design,
        id: `${design.id}-${Date.now()}`,
        position: { x: constrainedX, y: constrainedY },
        size: designSize,
        selected: true,
      }

      setPlacedDesigns((prev) => [...prev.map((d) => ({ ...d, selected: false })), newDesign])
      setSelectedDesignId(newDesign.id)
    },
    [designSize],
  )

  const handleImageUpload = (event) => {
    const file = event.target.files && event.target.files[0]
    if (file) {
      setHasCustomImage(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target && e.target.result
        const customDesign = {
          id: `custom-${Date.now()}`,
          name: "Custom Image",
          price: 25,
          preview: imageUrl,
          position: { x: 0, y: 0.3 },
          size: designSize,
          selected: true,
        }
        setPlacedDesigns((prev) => [...prev.map((d) => ({ ...d, selected: false })), customDesign])
        setSelectedDesignId(customDesign.id)
      }
      reader.readAsDataURL(file)
    }
  }

  const totalDesignPrice = placedDesigns.reduce((sum, design) => sum + design.price, 0)

  const moveSelectedDesign = (direction) => {
    if (!selectedDesignId) return

    setPlacedDesigns((prev) =>
      prev.map((design) => {
        if (design.id === selectedDesignId) {
          const step = 0.03
          let newX = design.position.x
          let newY = design.position.y

          switch (direction) {
            case "up":
              newY = Math.min(0.5, newY + step)
              break
            case "down":
              newY = Math.max(0.1, newY - step)
              break
            case "left":
              newX = Math.max(-0.2, newX - step)
              break
            case "right":
              newX = Math.min(0.2, newX + step)
              break
            default:
              // No movement for unknown direction
              break
          }

          return { ...design, position: { x: newX, y: newY } }
        }
        return design
      }),
    )
  }

  const resizeSelectedDesign = (newSize) => {
    if (!selectedDesignId) return

    setPlacedDesigns((prev) =>
      prev.map((design) => (design.id === selectedDesignId ? { ...design, size: newSize } : design)),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">3D Clothing Customizer</h1>
          <p className="text-gray-600">Design your perfect custom clothing</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Preset Designs */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Preset Designs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {presetDesigns.map((design) => (
                    <PresetDesign key={design.id} design={design} onSelect={setSelectedDesign} />
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Custom Image Upload */}
                <div className="space-y-3">
                  <h4 className="font-medium">Upload Custom Image</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Drag & drop or click to upload</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button variant="outline">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Fixed price: $25</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - 3D Model */}
          <div className="col-span-6">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shirt className="w-5 h-5" />
                    3D Preview
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="h-full p-0">
                <div
                  className="h-full bg-gradient-to-b from-gray-100 to-gray-200 relative"
                  onDrop={(event) => {
                    event.preventDefault()
                    const designData = event.dataTransfer.getData("application/json")
                    if (designData) {
                      const design = JSON.parse(designData)
                      const rect = event.currentTarget.getBoundingClientRect()
                      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
                      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
                      const worldX = x * 0.5
                      const worldY = y * 0.5
                      handleDesignDrop(design, { x: worldX, y: worldY })
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                  }}
                  style={{
                    border: "2px dashed transparent",
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault()
                    event.currentTarget.style.border = "2px dashed #3b82f6"
                    event.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)"
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault()
                    event.currentTarget.style.border = "2px dashed transparent"
                    event.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <Canvas camera={{ position: [0, 0, 3], fov: 50 }} shadows>
                    <Suspense fallback={null}>
                      <ambientLight intensity={0.4} />
                      <directionalLight
                        position={[10, 10, 5]}
                        intensity={1}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                      />
                      <TShirtGLB
                        color={selectedColor}
                        designs={placedDesigns}
                        position={[0, -0.5, 0]}
                        scale={[1.2, 1.2, 1.2]}
                      />
                      <OrbitControls enablePan={false} enableZoom={true} minDistance={2} maxDistance={6} />
                      <Environment preset="studio" />
                    </Suspense>
                  </Canvas>
                </div>

                {/* Color Picker */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4" />
                    <span className="font-medium">Colors:</span>
                  </div>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color ? "border-gray-800" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Price Calculator */}
          <div className="col-span-3">
            <PriceCalculator
              basePrice={25}
              designPrice={totalDesignPrice}
              customImagePrice={0}
              hasCustomImage={false}
            />

            {/* Design Controls */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Design Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDesignId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Move Design</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div></div>
                        <Button variant="outline" onClick={() => moveSelectedDesign("up")}>
                          ↑
                        </Button>
                        <div></div>
                        <Button variant="outline" onClick={() => moveSelectedDesign("left")}>
                          ←
                        </Button>
                        <Button variant="outline" onClick={() => moveSelectedDesign("down")}>
                          ↓
                        </Button>
                        <Button variant="outline" onClick={() => moveSelectedDesign("right")}>
                          →
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Design Size</label>
                      <input
                        type="range"
                        min="40"
                        max="120"
                        value={placedDesigns.find((d) => d.id === selectedDesignId)?.size || 80}
                        onChange={(e) => resizeSelectedDesign(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Small</span>
                        <span>Large</span>
                      </div>
                    </div>
                  </>
                )}

                <Button variant="outline" onClick={() => setPlacedDesigns([])} className="w-full">
                  Clear All Designs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
