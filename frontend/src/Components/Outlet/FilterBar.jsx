import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import './FilterBar.css';

const FilterBar = ({ 
  filters, 
  setFilters, 
  onApply, 
  categoryOptions, 
  materialOptions, 
  colorOptions, 
  sizeOptions 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState(null);

  // Color hex mapping for visual swatches
  const colorMap = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Grey': '#808080',
    'Blue': '#0000FF',
    'Navy': '#000080',
    'Red': '#FF0000',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Pink': '#FFC0CB',
    'Purple': '#800080',
    'Brown': '#A52A2A',
    'Beige': '#F5F5DC',
    'Maroon': '#800000',
    'Orange': '#FFA500'
  };

  // Debounced search only (triggers on non-empty search)
  useEffect(() => {
    if (searchDebounce) clearTimeout(searchDebounce);
    
    if (filters.q.trim() === '') {
      return; // Don't auto-apply on empty search
    }
    
    const timer = setTimeout(() => {
      onApply();
    }, 600);
    setSearchDebounce(timer);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [filters.q]);

  // Handle filter changes without auto-apply
  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, [setFilters]);

  const clearFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
    setTimeout(onApply, 50);
  };

  const clearAll = () => {
    setFilters({ 
      q: "", category: "", brand: "", material: "", 
      color: "", size: "", minPrice: "", maxPrice: "" 
    });
    setTimeout(onApply, 50);
  };

  // Count active filters
  const activeCount = Object.entries(filters).filter(([k, v]) => v !== "").length;

  return (
    <div className="filter-bar-sticky chetha-filter-bar" data-chetha="filter-bar">
      <div className="filter-bar-container">
        
        {/* Search Bar */}
        <div className="filter-search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search clothing items..."
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="filter-search-input"
          />
          {filters.q && (
            <button onClick={() => clearFilter('q')} className="clear-search-btn">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Filters Row */}
        <div className="filter-quick-row">
          {/* Category */}
          <select 
            value={filters.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          {/* Material */}
          <select 
            value={filters.material} 
            onChange={(e) => handleFilterChange('material', e.target.value)}
            className="filter-select"
          >
            <option value="">All Materials</option>
            {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          {/* Brand */}
          <input 
            type="text"
            placeholder="Brand"
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="filter-input"
          />

          {/* Apply Button */}
          <button 
            onClick={onApply} 
            className="filter-apply-btn"
          >
            Apply Filters
          </button>

          {/* Advanced Toggle */}
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className="filter-toggle-btn"
          >
            {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            {showAdvanced ? 'Less' : 'More'} Filters
          </button>

          {activeCount > 0 && (
            <button onClick={clearAll} className="filter-clear-all-btn">
              Clear All ({activeCount})
            </button>
          )}
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showAdvanced && (
          <div className="filter-advanced">
            {/* Size Pills */}
            <div className="filter-section">
              <label className="filter-label">Size</label>
              <div className="filter-pills">
                {sizeOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => handleFilterChange('size', filters.size === s ? '' : s)}
                    className={`filter-pill ${filters.size === s ? 'active' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="filter-section">
              <label className="filter-label">Color</label>
              <div className="filter-color-swatches">
                {colorOptions.map(c => (
                  <button
                    key={c}
                    onClick={() => handleFilterChange('color', filters.color === c ? '' : c)}
                    className={`color-swatch ${filters.color === c ? 'active' : ''}`}
                    style={{ 
                      backgroundColor: colorMap[c] || '#ccc',
                      border: c === 'White' ? '1px solid #ddd' : 'none'
                    }}
                    title={c}
                  >
                    {filters.color === c && <span className="color-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <label className="filter-label">Price Range</label>
              <div className="filter-price-range">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="filter-price-input"
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="filter-price-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeCount > 0 && (
          <div className="filter-chips">
            {filters.category && (
              <span className="filter-chip">
                Category: {filters.category}
                <X size={14} onClick={() => clearFilter('category')} />
              </span>
            )}
            {filters.material && (
              <span className="filter-chip">
                Material: {filters.material}
                <X size={14} onClick={() => clearFilter('material')} />
              </span>
            )}
            {filters.brand && (
              <span className="filter-chip">
                Brand: {filters.brand}
                <X size={14} onClick={() => clearFilter('brand')} />
              </span>
            )}
            {filters.size && (
              <span className="filter-chip">
                Size: {filters.size}
                <X size={14} onClick={() => clearFilter('size')} />
              </span>
            )}
            {filters.color && (
              <span className="filter-chip">
                <span 
                  className="chip-color-dot" 
                  style={{ backgroundColor: colorMap[filters.color] || '#ccc' }}
                />
                {filters.color}
                <X size={14} onClick={() => clearFilter('color')} />
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="filter-chip">
                Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                <X size={14} onClick={() => { clearFilter('minPrice'); clearFilter('maxPrice'); }} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
