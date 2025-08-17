import React, { useState } from 'react';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './ClothCustomizer.css';
import { TShirtModel } from './components/TShirtModel';
import { CropTopModel } from './components/CropTopModel';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds } from '@react-three/drei';

import print1 from './customizer_preset_designs/print 1.jpg'
import print2 from './customizer_preset_designs/print 2.jpg'
import print3 from './customizer_preset_designs/print 3.jpg'
import print4 from './customizer_preset_designs/print 4.jpg'
import print5 from './customizer_preset_designs/print 5.jpg'
import print6 from './customizer_preset_designs/print 6.jpg'
import { Link } from 'react-router-dom';


function ClothCustomizer() {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [clothingType, setClothingType] = useState("tshirt");
  const [placedDesigns, setPlacedDesigns] = useState([]);
  const [designSize, setDesignSize] = useState(80);
  const [selectedClothSize, setSelectedClothSize] = useState(null);
  const [designPosition, setDesignPosition] = useState({ x: 0, y: 0 });


  //Inputing design
  const [selectedSide] = useState("front"); // front or back
  const [frontDesigns, setFrontDesigns] = useState([]);
  const [activeDesignId, setActiveDesignId] = useState(null);

  const controlsRef = React.useRef();
  const [selectedSize, setSelectedSize] = useState(null);

  // Sample preset designs
  const presetDesigns = [
    { id: 1, name: "Design 1", price: 15, preview: print1 },
    { id: 2, name: "Design 2", price: 20, preview: print2 },
    { id: 3, name: "Design 3", price: 18, preview: print3 },
    { id: 4, name: "Design 4", price: 12, preview: print4 },
    { id: 5, name: "Design 5", price: 10, preview: print5 },
    { id: 6, name: "Design 6", price: 8, preview: print6 },
  ];

  const colors = [
    "#f5f5f5",
    "#2e2e2e",
    "#e57373",
    "#81c784",
    "#64b5f6",
    "#fff176",
    "#ba68c8",
    "#4dd0e1"
  ];


  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result;
        const customDesign = {
          id: `custom-${Date.now()}`,
          name: "Custom Image",
          price: 25,
          preview: imageUrl,
          position: { designPosition },
          size: designSize,
        };
        setSelectedDesign(customDesign);

      };
      reader.readAsDataURL(file);
    }
  };

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
    
    const designWithPlacement = {
      ...design,
      id: `${design.id}-${Date.now()}`,
      side: selectedSide,
      position: { x: 0, y: 0 },
      size: designSize,
    };

    setFrontDesigns((prev) => [...prev, designWithPlacement]);
    setActiveDesignId(designWithPlacement.id);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size) => {
    setDesignSize(size);

    if (activeDesignId) {
      updateDesignProperty(activeDesignId, 'size', size);
    }
  };

  const handlePositionChange = (axis, value) => {
    const newPosition = { ...designPosition, [axis]: value };
    setDesignPosition(newPosition);

    if (activeDesignId) {
      updateDesignProperty(activeDesignId, 'position', newPosition);
    }
  };


  const updateDesignProperty = (designId, property, value) => {
    const updateDesign = (designs) =>
      designs.map(design =>
        design.id === designId ? { ...design, [property]: value } : design
      );

    setFrontDesigns(prev => updateDesign(prev));
    setPlacedDesigns(prev => updateDesign(prev));
  };

  const getSizeExtraPrice = () => {
    if (selectedSize === "L") return 3;
    if (selectedSize === "XL") return 5;
    if (selectedSize === "XXL") return 8;
    return 0;
  };

  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value) => {
    if (value >= 1) setQuantity(value);
  };

  // Calculate total price including placed designs

  const basePrice = clothingType === "tshirt" ? 25 : 35;
  const designPrice = selectedDesign ? selectedDesign.price : 0;
  const sizeExtraPrice = getSizeExtraPrice();
  const totalPrice = basePrice + designPrice + sizeExtraPrice;

  return (
    <div className="customizer-container">
      <NavBar />
      <div className="customizer-content">
        <div className="customizer-header">
          <h1>Clothing Customizer</h1>
          <p>Design your perfect outfit with our easy-to-use customizer</p>
        </div>
        {/* Cloth type changer */}
        <div className="customizer-main">
          <div className="customizer-panel">
            <div className="panel-section">
              <h3>Clothing Type</h3>
              <div className="clothing-options">
                <button
                  className={`clothing-btn ${clothingType === "tshirt" ? "active" : ""}`}
                // onClick={() => handleClothingTypeChange("tshirt")}
                >
                  T-Shirt
                </button>
                {/* <button
                  className={`clothing-btn ${clothingType === "croptop" ? "active" : ""}`}
                  onClick={() => handleClothingTypeChange("croptop")}
                >
                  Crop-Top
                </button> */}
              </div>
            </div>

            {/* Cloth colour changer */}
            <div className="panel-section">
              <h3>Color Selection</h3>
              <div className="color-palette">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
            {/* Cloth size changer         */}
            {/* <div className="panel-section">
              <h3>Design Placement</h3>
              <div className="side-options">
                <button
                  className={`side-btn ${selectedSide === "front" ? "active" : ""}`}
                  onClick={() => handleSideSelect("front")}
                >
                  Front
                </button>
                <button
                  className={`side-btn ${selectedSide === "back" ? "active" : ""}`}
                  onClick={() => handleSideSelect("back")}
                >
                  Back
                </button>
              </div>
            </div> */}

            {/* Cloth image adding part*/}
            <div className="panel-section">
              <h3>Upload Custom Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                style={{ width: '90%' }}
              />
              <p className="side-info">Will be placed on: <strong>{selectedSide}</strong></p>
            </div>

            {/* Cloth design controller*/}
            <div className="panel-section">
              <h3>Preset Designs</h3>
              <div className="design-grid">
                {presetDesigns.map((design) => (
                  <div
                    key={design.id}
                    className={`design-item ${selectedDesign?.id === design.id ? "selected" : ""}`}
                    onClick={() => handleDesignSelect(design)}
                  >
                    <img src={design.preview} alt={design.name} />
                    <p>{design.name}</p>
                    <span className="price">${design.price}</span>
                  </div>
                ))}
              </div>
              <p className="side-info">Will be placed on: <strong>{selectedSide}</strong></p>
            </div>

            <div className="panel-section">
              <h3>Design Size</h3>
              <input
                type="range"
                min="20"
                max="150"
                value={designSize}
                onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                className="size-slider"
              />
              <span className="size-value">{designSize}px</span>
            </div>

            {activeDesignId && (
              <div className="panel-section">
                <h3>Design Position</h3>
                <div className="position-controls">
                  <div className="position-control">
                    <label>X Position:</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={designPosition.x}
                      onChange={(e) => handlePositionChange('x', parseInt(e.target.value))}
                      className="position-slider"
                    />
                    <span>{designPosition.x}</span>
                  </div>
                  <div className="position-control">
                    <label>Y Position:</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={designPosition.y}
                      onChange={(e) => handlePositionChange('y', parseInt(e.target.value))}
                      className="position-slider"
                    />
                    <span>{designPosition.y}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="panel-section">
              <h3>Pricing</h3>

              <div className="size-selector">
                <p><strong>Select Size:</strong></p>
                <div className="design-grid" style={{ marginBottom: '15px' }}>
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      className={`clothing-btn ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="quantity-selector" style={{ marginTop: '10px', marginBottom: '15px' }}>
                <p><strong>Quantity:</strong></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    style={{ padding: '5px 10px' }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    style={{ padding: '5px 10px' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="price-breakdown" style={{ marginTop: '10px' }}>
                <p>Base Price: ${basePrice}</p>
                <p>Designs: ${designPrice}</p>
                {selectedSize && <p>Size Extra: ${sizeExtraPrice}</p>}
                <p><strong>Quantity:</strong> {quantity}</p>
                <p className="total-price">
                  Total: ${totalPrice * quantity}
                </p>
              </div>
              <Link to="/orderManagement">
                <button className="order-btn">Save & Add to Cart</button>
              </Link>

            </div>
          </div>


          <div style={{
            flex: 1,
            height: '70vh',
            background: 'linear-gradient(135deg, #6b6b6bff 0%, #000000ff 100%)',
            borderRadius: '20px'
          }}>

            {/* T-Shirt/CropTop Component */}

            <Canvas
              camera={{
                position: [5, 0, 5],
                fov: 45
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={0.3} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={0.1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[-5, 5, 5]} intensity={0.5} />

              <Bounds fit clip observe margin={1.2}>
                <TShirtModel
                  selectedColor={selectedColor}
                  chestDesignUrl={selectedDesign?.preview || null}
                  position={[0, 0, 0]}
                  scale={2}
                />
              </Bounds>

              {/* <Bounds fit clip observe margin={1.2}>
                {clothingType === "tshirt" ? (
                  <TShirtModel
                    selectedColor={selectedColor}
                    chestDesignUrl={selectedDesign?.preview || null}
                    position={[0, 0, 0]}
                    scale={2}
                  />
                ) : (
                  <CropTopModel
                    selectedColor={selectedColor}
                    frontDesigns={frontDesigns}
                    backDesigns={backDesigns}
                    position={[0, 0, 0]}
                    scale={3}
                  />
                )}
              </Bounds> */}

              <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                enablePan={false}
                enableRotate={true}
                minDistance={2}
                maxDistance={8}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
                autoRotate={false}
                autoRotateSpeed={-2.5}
                target={clothingType === "tshirt" ? [0, 2.5, 0] : [0, 3.5, 0]}
              />
            </Canvas>



          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ClothCustomizer;
