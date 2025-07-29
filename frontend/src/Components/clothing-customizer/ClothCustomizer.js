import React, { useState } from 'react';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './ClothCustomizer.css';

function ClothCustomizer() {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [clothingType, setClothingType] = useState("tshirt");
  const [placedDesigns, setPlacedDesigns] = useState([]);
  const [designSize, setDesignSize] = useState(80);

  // Sample preset designs
  const presetDesigns = [
    { id: 1, name: "Vintage Logo", price: 15, preview: "https://via.placeholder.com/100x100/cccccc/666666?text=Logo" },
    { id: 2, name: "Abstract Art", price: 20, preview: "https://via.placeholder.com/100x100/cccccc/666666?text=Art" },
    { id: 3, name: "Nature Scene", price: 18, preview: "https://via.placeholder.com/100x100/cccccc/666666?text=Nature" },
    { id: 4, name: "Geometric Pattern", price: 12, preview: "https://via.placeholder.com/100x100/cccccc/666666?text=Geo" },
    { id: 5, name: "Typography", price: 10, preview: "https://via.placeholder.com/100x100/cccccc/666666?text=Text" },
    { id: 6, name: "Minimalist", price: 8, preview: "https://via.placeholder.com/100x100/cccccc/666666?text=Mini" },
  ];

  const colors = ["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

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
        };
        setPlacedDesigns((prev) => [...prev, customDesign]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleClothingTypeChange = (type) => {
    setClothingType(type);
  };

  const handleSizeChange = (size) => {
    setDesignSize(size);
  };

  // Calculate total price including placed designs
  const totalDesignPrice = placedDesigns.reduce((sum, design) => sum + design.price, 0);
  const basePrice = clothingType === "tshirt" ? 25 : 35;
  const totalPrice = basePrice + totalDesignPrice;

  return (
    <div className="customizer-container">
      <NavBar />
      <div className="customizer-content">
        <div className="customizer-header">
          <h1>Clothing Customizer</h1>
          <p>Design your perfect outfit with our easy-to-use customizer</p>
        </div>

        <div className="customizer-main">
          <div className="customizer-panel">
            <div className="panel-section">
              <h3>Clothing Type</h3>
              <div className="clothing-options">
                <button 
                  className={`clothing-btn ${clothingType === "tshirt" ? "active" : ""}`}
                  onClick={() => handleClothingTypeChange("tshirt")}
                >
                  T-Shirt
                </button>
                <button 
                  className={`clothing-btn ${clothingType === "hoodie" ? "active" : ""}`}
                  onClick={() => handleClothingTypeChange("hoodie")}
                >
                  Hoodie
                </button>
              </div>
            </div>

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

            <div className="panel-section">
              <h3>Upload Custom Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
            </div>

            <div className="panel-section">
              <h3>Preset Designs</h3>
              <div className="design-grid">
                {presetDesigns.map((design) => (
                  <div
                    key={design.id}
                    className="design-item"
                    onClick={() => handleDesignSelect(design)}
                  >
                    <img src={design.preview} alt={design.name} />
                    <p>{design.name}</p>
                    <span className="price">${design.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-section">
              <h3>Selected Designs</h3>
              <div className="selected-designs">
                {placedDesigns.map((design) => (
                  <div key={design.id} className="selected-design">
                    <img src={design.preview} alt={design.name} />
                    <p>{design.name}</p>
                    <span className="price">${design.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-section">
              <h3>Pricing</h3>
              <div className="price-breakdown">
                <p>Base Price: ${basePrice}</p>
                <p>Designs: ${totalDesignPrice}</p>
                <p className="total-price">Total: ${totalPrice}</p>
              </div>
              <button className="order-btn">Add to Cart</button>
            </div>
          </div>

          <div className="preview-section">
            <div className="preview-container">
              <div 
                className="clothing-preview"
                style={{ backgroundColor: selectedColor }}
              >
                <div className="clothing-type-indicator">
                  {clothingType === "tshirt" ? "👕" : "🧥"}
                </div>
                {selectedDesign && (
                  <div 
                    className="design-preview"
                    style={{
                      width: `${designSize}px`,
                      height: `${designSize}px`,
                      backgroundImage: `url(${selectedDesign.preview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ClothCustomizer;
