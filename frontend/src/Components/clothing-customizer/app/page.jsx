"use client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useState, useCallback } from "react"
import { Upload, Palette, Shirt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TShirtGLB } from "@/components/assets/t_shirt.glb"
import Hoodie from "@/components/Hoodie"
import PresetDesign from "@/components/PresetDesign"
import PriceCalculator from "@/components/PriceCalculator"

export default function ClothingCustomizer() {
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [selectedDesign, setSelectedDesign] = useState(null)
  const [hasCustomImage, setHasCustomImage] = useState(false)
  const [clothingType, setClothingType] = useState("tshirt")
  const [placedDesigns, setPlacedDesigns] = useState([])
  const [designSize, setDesignSize] = useState(80)
  const [selectedDesignId, setSelectedDesignId] = useState(null)

  // Sample preset designs
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
      // Constrain to design area (chest area of t-shirt)
      const constrainedX = Math.max(-0.2, Math.min(0.2, position.x))
      const constrainedY = Math.max(0.1, Math.min(0.5, position.y))

      const newDesign = {
        ...design,
        id: `${design.id}-${Date.now()}`,
        position: { x: constrainedX, y: constrainedY },
        size: designSize,
        placedAt: Date.now(),
        selected: true,
      }

      // Deselect other designs
      setPlacedDesigns((prev) => [...prev.map((d) => ({ ...d, selected: false })), newDesign])
      setSelectedDesignId(newDesign.id)
    },
    [designSize],
  )

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setHasCustomImage(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result
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

  // Calculate total price including placed designs
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
              // No action for unknown direction
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
      prev.map((design) => {
        if (design.id === selectedDesignId) {
          return { ...design, size: newSize }
        }
        return design
      }),
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
                    <Button variant="outline" size="sm" asChild>
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
                  <div className="flex gap-2">
                    <Button
                      variant={clothingType === "tshirt" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClothingType("tshirt")}
                    >
                      T-Shirt
                    </Button>
                    <Button
                      variant={clothingType === "hoodie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClothingType("hoodie")}
                    >
                      Hoodie
                    </Button>
                  </div>
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
                      {clothingType === "tshirt" ? (
                        <TShirtGLB
                          color={selectedColor}
                          designs={placedDesigns}
                          position={[0, -0.5, 0]}
                          scale={[1.2, 1.2, 1.2]}
                        />
                      ) : (
                        <Hoodie color={selectedColor} designs={placedDesigns} />
                      )}
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
              basePrice={clothingType === "tshirt" ? 25 : 35}
              designPrice={totalDesignPrice}
              customImagePrice={0}
              selectedDesign={null}
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
                        <Button variant="outline" size="sm" onClick={() => moveSelectedDesign("up")}>
                          ↑
                        </Button>
                        <div></div>
                        <Button variant="outline" size="sm" onClick={() => moveSelectedDesign("left")}>
                          ←
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => moveSelectedDesign("down")}>
                          ↓
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => moveSelectedDesign("right")}>
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

                <Button variant="outline" size="sm" onClick={() => setPlacedDesigns([])} className="w-full">
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
