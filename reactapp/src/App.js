import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductCard from './productcard.js';
import MainNavBar from './mainnavbar.js';

// Define the main functional component
function App() {

  //Initialize state variables; products to remain empty until
  const [products, setProducts] = useState([]);  // Initialize products state var as empty. Will fill when we fetch data
  const [selectedCategory, setSelectedCategory] = useState('products_table_1');  // Initialize selectedCategory state var as products_table_1 to show that table on loadup
  const [hoveredCategory, setHoveredCategory] = useState(null);  // Initialize hoveredCategory as null because no category will be hovered over until user does so

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

  // Declare the useEffect hook and the fetchProducts function within it
  useEffect(() => {                       // Anonymous callback function
    const fetchProducts = async () => {   // Define fetchProducts as an asynchronous function
      try {                               // Try...catch to implement API call and error handling
        const response = await axios.get(`${ALB_ENDPOINT}/products/${selectedCategory}`); // await used so that we don't setProducts before we have response data to use
        setProducts(response.data);       // When the above await is resolved, we set the response to our setProducts variable
      } catch (error) {
        console.error(`Error fetching products for ${selectedCategory}:`, error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Function that changes the setHoveredCategory state when mouse enters category container
  const handleMouseEnter = (categoryName) => {
    setHoveredCategory(categoryName);
  };

  // Function that restores our hover-over state to null once mouse leaves the category container
  const handleMouseLeave = () => {
    setHoveredCategory(null);
  };

  return (
    <div className="App">
      <MainNavBar />
      <header>
        <nav className="category-navbar">
          { /*Iterate over the categories array to create JSX elements for each category
              Each category gets everything in this div container associated with it
              Use the tableName property as the unique identifier for the mapping process
              Event listener to trigger mouse enter function
              Event listener to trigger mouse leave function*/ }
          {categories.map((category) => (
            <div
              key={category.tableName}
              onMouseEnter={() => handleMouseEnter(category.name)}
              onMouseLeave={handleMouseLeave}
              className="category-container"
            > { /*Configure button for each category container to change SelectedCategory to tableName on click*/ }
              <button
                onClick={() => setSelectedCategory(category.tableName)}
                className="category-button"
                >
                {category.name}
              </button> 
              { /*Configure button below to create container and show dropdown menu if conditions are met
                  Iterate over the subcategories of the selected category and generate "sub" map
                  Set the tableName property as the unique identifier
                  When user clicks on button in dropdown menu, trigger setSelectedCategory function using 
                          data from specific table on "sub" map*/ }
              {hoveredCategory === category.name && category.subcategories.length > 0 && (
                <div className="dropdown-content">
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub.tableName}
                      onClick={() => setSelectedCategory(sub.tableName)}
                      className="dropdown-item"
                      >
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
      { /*Iterate over products state array to generate product map
          Pass product map to ProductCard component
          Set key to product.sku
          Pass product object as a prop to ProductCard component*/ }
      <div className="products-container">
          {products.map(product => (
            <ProductCard key={product.sku} product={product}/>
          ))}
          </div>
      </main>
    </div>
  );
}

export default App;