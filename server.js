const express = require('express');
const path = require('path');
const fs = require('fs'); // Added File System module to save files
const app = express();
const PORT = 3000;

// Setup pathways to find files
const DATA_FILE = path.join(__dirname, 'products.json');

// MIDDLEWARE to handle form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve all static images and website files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read items from our permanent JSON file
function readProductsFromFile() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return []; // Return empty list if file doesn't exist yet
        }
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileData);
    } catch (err) {
        console.error("Error reading data file:", err);
        return [];
    }
}

// Helper function to write items down onto the hard drive
function saveProductsToFile(products) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing data file:", err);
    }
}

// Fallback route to serve index.html for the main store
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route for storefront to fetch the saved items
app.get('/api/products', (req, res) => {
    const products = readProductsFromFile();
    res.json(products);
});

// Route to handle adding new products from admin dashboard
app.post('/add-product', (req, res) => {
    const { name, price, image } = req.body;
    
    if (name && price && image) {
        // 1. Grab the existing products from the file
        const products = readProductsFromFile();
        
        // 2. Add the new product to the list
        products.push({ name, price: Number(price), image });
        
        // 3. Save the updated list back to the hard drive permanently
        saveProductsToFile(products);
        
        console.log(`Product Permanently Saved: ${name}`);
        
        // Success browser popup redirect
        res.send(`
            <script>
                alert('Product "${name}" successfully published to your store!');
                window.location.href = '/admin.html';
            </script>
        `);
    } else {
        res.status(400).send('Error: Missing product information.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`🚀 Yacht Club Server is running perfectly!`);
    console.log(`👉 View Storefront: http://localhost:3000`);
    console.log(`👉 View Admin Dashboard: http://localhost:3000/admin.html`);
    console.log(`===========================================`);
});