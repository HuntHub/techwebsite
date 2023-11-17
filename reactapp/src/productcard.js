import React from 'react';
import './productcard.css'

const ProductCard = ({ product }) => {
    return (
      <div className="product-card">
        <div className="product-image-container">
          <img src={product.imageUrl} alt={product.name} className="product-image" />
        </div>
        <div className="product-info">
          <p className="vendor">Best Buy</p>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-regular-price">Regular Price: ${parseFloat(product.regularPrice).toFixed(2)}</p>
          <p className="product-price">Sale Price: ${parseFloat(product.salePrice).toFixed(2)}</p>
          <p className="product-percent-savings">Percent Savings: {parseFloat(product.percentSavings).toFixed(2)}%</p>
          <p className="product-dollar-savings">Total Savings: ${parseFloat(product.dollarSavings).toFixed(2)}</p>
          {product.affiliateLink && <a href={product.affiliateLink} className="product-buy-now">Shop Here</a>}
        </div>
      </div>
    );
  };

export default ProductCard;