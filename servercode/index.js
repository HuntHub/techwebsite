const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2/promise');
const cron = require('node-cron');

//Declare env vars
require('dotenv').config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const bbapiKey = process.env.BB_API_KEY;
const corsdomains = JSON.parse(process.env.CORS_DOMAINS);
const affiliateBaseUrl = process.env.affiliateBaseUrl;

// Initialize database connection pool
const pool = mysql.createPool({
    host: dbHost,
    port: '3306',
    user: dbUser,
    password: dbPassword,
    database: 'techwebsite',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//Declare categories and subcategories
const categories = [

    { categoryId: 'abcat0507000', tableName: 'products_table_1', subcategories: [] },
    { categoryId: 'abcat0507010', tableName: 'products_table_2', subcategories: [

        { categoryId: 'abcat0507010&search=AMD', tableName: 'products_table_15' },
        { categoryId: 'abcat0507010&search=Intel', tableName: 'products_table_16' }

    ] },

    { categoryId: 'abcat0507007', tableName: 'products_table_3', subcategories: [

        { categoryId: 'pcmcat339900050005', tableName: 'products_table_17' },
        { categoryId: 'pcmcat339900050006', tableName: 'products_table_18' },
        { categoryId: 'pcmcat339900050008', tableName: 'products_table_19' }

    ] },

    { categoryId: 'abcat0507002', tableName: 'products_table_4', subcategories: [

        { categoryId: 'abcat0507002&search=8gb', tableName: 'products_table_9' },
        { categoryId: 'abcat0507002&search=10gb', tableName: 'products_table_10' },
        { categoryId: 'abcat0507002&search=12gb', tableName: 'products_table_11' },
        { categoryId: 'abcat0507002&search=16gb', tableName: 'products_table_12' },
        { categoryId: 'abcat0507002&search=20gb', tableName: 'products_table_13' },
        { categoryId: 'abcat0507002&search=24gb', tableName: 'products_table_14' }

    ] },

    { categoryId: 'abcat0504001', tableName: 'products_table_5', subcategories: [] },
    { categoryId: 'abcat0507008', tableName: 'products_table_6', subcategories: [

        { categoryId: 'abcat0507008&search=AM4', tableName: 'products_table_20' },
        { categoryId: 'abcat0507008&search=AM5', tableName: 'products_table_21' },
        { categoryId: 'abcat0507008&search=1700', tableName: 'products_table_22' }
        
    ] },

    { categoryId: 'abcat0507009', tableName: 'products_table_7', subcategories: [] },
    { categoryId: 'abcat0507006', tableName: 'products_table_8', subcategories: [] },

];

// Middleware to parse JSON data
app.use(express.json());

// Enable CORS for React app domain
app.use(cors({
    origin: [corsdomains]
}));

app.get('/health', (res) => {
    res.status(200).send('OK');
});

// Function to fetch from Best Buy and insert into the database
async function fetchAndStoreCategory(categoryId, tableName) {
  try {
    const response = await axios.get(`https://api.bestbuy.com/v1/products(categoryPath.id=${categoryId})?format=json&show=sku,name,salePrice,onSale,percentSavings,dollarSavings,regularPrice,largeFrontImage,url&sort=percentSavings.desc&pageSize=20&apiKey=${bbapiKey}`);
    const products = response.data.products;

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete existing items from the category table
      await connection.query('DELETE FROM ??', [tableName]);

      // Insert new items into the category table
      for (const product of products) {

        const imageUrl = product.largeFrontImage;
        const affiliateLink = product.url;

        await connection.query(`
          INSERT INTO ?? (sku, name, salePrice, onSale, percentSavings, dollarSavings, regularPrice, imageUrl, affiliateLink) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          tableName,
          product.sku,
          product.name,
          product.salePrice,
          product.onSale ? 1 : 0,
          product.percentSavings,
          product.dollarSavings,
          product.regularPrice,
          imageUrl,
          affiliateLink
        ]);
      }

      // Commit the transaction
      await connection.commit();
    } 
    catch (error) {
      // If an error occurs, roll back the transaction
      await connection.rollback();
      throw error;
    } 
    finally {
      // Release the connection back to the pool
      connection.release();
    }

    return 'Data fetched and stored successfully';
    } 
    catch (error) {
    console.error(`Error in fetchAndStoreCategory for ${tableName}:`, error);
    throw error; // Rethrow the error so it can be handled upstream if needed
    }
}

//Function to find categories
function findCategoryByTableName(tableName) {
    let foundCategory = null;

    // Search in main categories
    categories.forEach(category => {
        if (category.tableName === tableName) {
            foundCategory = category;
        }

        // Search in subcategories
        category.subcategories.forEach(subcategory => {
            if (subcategory.tableName === tableName) {
                foundCategory = subcategory;
            }
        });
    });

    return foundCategory;
}

// Endpoint to fetch from Best Buy and insert into the database
app.get('/fetch-and-store', async (res) => {
  try {
        const message = await fetchAndStoreCategory();
        res.json({ message });
  } 
  catch (error) {
        console.error('Error in /fetch-and-store endpoint:', error);
        res.status(500).send('Server error');
  }
});

// Endpoint to retrieve products from a specific table in the database
app.get('/products/:tableName', async (req, res) => {
    const { tableName } = req.params;
    // Add a list of valid table names for security checks
    const validTableNames = ['products_table_1',
                             'products_table_2', 
                             'products_table_3', 
                             'products_table_4', 
                             'products_table_5', 
                             'products_table_6', 
                             'products_table_7', 
                             'products_table_8',
                             'products_table_9',
                             'products_table_10',
                             'products_table_11',
                             'products_table_12',
                             'products_table_13',
                             'products_table_14',
                             'products_table_15',
                             'products_table_16',
                             'products_table_17',
                             'products_table_18',
                             'products_table_19',
                             'products_table_20',
                             'products_table_21',
                             'products_table_22',
                             'products_table_23',
                             'products_table_24',];
  
    if (!validTableNames.includes(tableName)) {
        return res.status(400).json({ error: 'Invalid table name' });
    }
  
    try {
        const [products] = await pool.query('SELECT * FROM ?? ORDER BY percentSavings DESC', [tableName]);
        res.json(products);
    } 
    catch (error) {
        console.error(`Error in /products/${tableName} endpoint:`, error);
        res.status(500).json({ error: 'Server error' });
    }
  });

// Endpoint to retrieve products from all tables in the database
app.get('/products/all', async (res) => {
    try {
      const allProducts = {};
      for (const category of categories) {
        const [products] = await pool.query('SELECT * FROM ??', [category.tableName]);
        allProducts[category.tableName] = products;
      }
      res.json(allProducts);
    } 
    catch (error) {
        console.error('Error in /products/all endpoint:', error);
        res.status(500).json({ error: 'Server error' });
    }
  });

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Schedule tasks to be run on the server.
cron.schedule('0 0 0 12 * *', async () => {
    console.log('Running task 1');
    try {
        const message = await fetchAndStoreCategory(categories[0].categoryId, categories[0].tableName);
        console.log(message);
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('2 0 0 12 * *', async () => {
    console.log('Running task 2');
    try {
        const message = await fetchAndStoreCategory(categories[1].categoryId, categories[1].tableName);
        console.log(message);
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('4 0 0 12 * *', async () => {
    console.log('Running task 3');
    try {
        const message = await fetchAndStoreCategory(categories[2].categoryId, categories[2].tableName);
        console.log(message);
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('6 0 0 12 * *', async () => {
    console.log('Running task 4');
    try {
        const message = await fetchAndStoreCategory(categories[3].categoryId, categories[3].tableName);
        console.log(message);
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('8 0 0 12 * *', async () => {
    console.log('Running task 5');
    try {
        const message = await fetchAndStoreCategory(categories[4].categoryId, categories[4].tableName);
        console.log(message);
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('10 0 0 12 * *', async () => {
    console.log('Running task 6');
    try {
        const message = await fetchAndStoreCategory(categories[5].categoryId, categories[5].tableName);
        console.log(message);
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('12 0 0 12 * *', async () => {
    console.log('Running task 7');
    try {
        const message = await fetchAndStoreCategory(categories[6].categoryId, categories[6].tableName);
        console.log(message);
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('14 0 0 12 * *', async () => {
    console.log('Running task 8');
    try {
        const message = await fetchAndStoreCategory(categories[7].categoryId, categories[7].tableName);
        console.log(message);
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('16 0 0 12 * *', async () => {
    console.log('Running task 9');
    try {
        const subcategory = findCategoryByTableName('products_table_9'); //We use our second function to find the subcategory in a given category
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('18 0 0 12 * *', async () => {
    console.log('Running task 10');
    try {
        const subcategory = findCategoryByTableName('products_table_10');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('20 0 0 12 * *', async () => {
    console.log('Running task 11');
    try {
        const subcategory = findCategoryByTableName('products_table_11');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('22 0 0 12 * *', async () => {
    console.log('Running task 12');
    try {
        const subcategory = findCategoryByTableName('products_table_12');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('24 0 0 12 * *', async () => {
    console.log('Running task 13');
    try {
        const subcategory = findCategoryByTableName('products_table_13');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('26 0 0 12 * *', async () => {
    console.log('Running task 14');
    try {
        const subcategory = findCategoryByTableName('products_table_14');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});
cron.schedule('28 0 0 12 * *', async () => {
    console.log('Running task 15');
    try {
        const subcategory = findCategoryByTableName('products_table_15');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('30 0 0 12 * *', async () => {
    console.log('Running task 16');
    try {
        const subcategory = findCategoryByTableName('products_table_16');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('32 0 0 12 * *', async () => {
    console.log('Running task 17');
    try {
        const subcategory = findCategoryByTableName('products_table_17');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('34 0 0 12 * *', async () => {
    console.log('Running task 18');
    try {
        const subcategory = findCategoryByTableName('products_table_18');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('36 0 0 12 * *', async () => {
    console.log('Running task 19');
    try {
        const subcategory = findCategoryByTableName('products_table_19');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('38 0 0 12 * *', async () => {
    console.log('Running task 20');
    try {
        const subcategory = findCategoryByTableName('products_table_20');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('40 0 0 12 * *', async () => {
    console.log('Running task 21');
    try {
        const subcategory = findCategoryByTableName('products_table_21');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});

cron.schedule('42 0 0 12 * *', async () => {
    console.log('Running task 22');
    try {
        const subcategory = findCategoryByTableName('products_table_22');
        if (subcategory) {
            const message = await fetchAndStoreCategory(subcategory.categoryId, subcategory.tableName);
            console.log(message);
        } else {
            console.log('Subcategory not found');
        }
    } 
    catch (error) {
        console.error('Error in scheduled fetch-and-store task:', error);
    }
});