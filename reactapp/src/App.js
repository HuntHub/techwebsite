import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductCard from './productcard.js';
import MainNavBar from './mainnavbar.js';

function App() {

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('products_table_1');
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [

    { name: 'Best Overall', tableName: 'products_table_1', subcategories: []},
    { name: 'CPUs', tableName: 'products_table_2', subcategories: [

      { name: 'AMD', tableName: 'products_table_15' },
      { name: 'Intel', tableName: 'products_table_16' }

    ]},

    { name: 'Cooling', tableName: 'products_table_3', subcategories: [
      { name: 'Case fans', tableName: 'products_table_17' },
      { name: 'CPU cooling', tableName: 'products_table_18' },
      { name: 'Water cooling', tableName: 'products_table_19' }
    ]},

    { name: 'GPUs', tableName: 'products_table_4', subcategories: [

      { name: '8GB VRAM', tableName: 'products_table_9' },
      { name: '10GB VRAM', tableName: 'products_table_10' },
      { name: '12GB VRAM', tableName: 'products_table_11' },
      { name: '16GB VRAM', tableName: 'products_table_12' },
      { name: '20GB VRAM', tableName: 'products_table_13' },
      { name: '24GB VRAM', tableName: 'products_table_14' }

    ]},
 
    { name: 'SSDs', tableName: 'products_table_5', subcategories: []},
    { name: 'Mobos', tableName: 'products_table_6', subcategories: [

      { name: 'AM4', tableName: 'products_table_20' },
      { name: 'AM5', tableName: 'products_table_21' },
      { name: 'LGA 1700', tableName: 'products_table_22' },

    ]},

    { name: 'PSUs', tableName: 'products_table_7', subcategories: []},
    { name: 'Cases', tableName: 'products_table_8', subcategories: []},

  ];

const ALB_ENDPOINT = 'https://api.maxbudgetbuilds.com'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${ALB_ENDPOINT}/products/${selectedCategory}`);
        setProducts(response.data);
      } catch (error) {
        console.error(`Error fetching products for ${selectedCategory}:`, error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleMouseEnter = (categoryName) => {
    setHoveredCategory(categoryName);
  };

  const handleMouseLeave = () => {
    setHoveredCategory(null);
  };

  return (
    <div className="App">
      <MainNavBar />
      <header>
        <nav className="category-navbar">
          {categories.map((category) => (
            <div 
              key={category.tableName}
              onMouseEnter={() => handleMouseEnter(category.name)}
              onMouseLeave={handleMouseLeave}
              className="category-container"
            >
              <button
                onClick={() => setSelectedCategory(category.tableName)}
                className="category-button">
                {category.name}
              </button>
              {hoveredCategory === category.name && category.subcategories.length > 0 && (
                <div className="dropdown-content">
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub.tableName}
                      onClick={() => setSelectedCategory(sub.tableName)}
                      className="dropdown-item">
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </header>
      <main>
      <div className="products-container">
          {products.map(product => (
            <ProductCard key={product.sku} product={product} />
          ))}
          </div>
      </main>
    </div>
  );
}

export default App;