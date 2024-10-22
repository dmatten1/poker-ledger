const express = require('express');      // Import Express framework
const mongoose = require('mongoose');    // Import Mongoose to interact with MongoDB
const bodyParser = require('body-parser'); // To handle JSON request bodies
const cors = require('cors');            // To allow cross-origin requests

// Initialize Express app
const app = express();
app.use(cors());                        // Enable CORS
app.use(bodyParser.json());             // Parse JSON bodies

// Connect to MongoDB database
mongoose.connect('mongodb+srv://dmatten1:C79GRKUVmqXfDg@pokerledger.w9rjc.mongodb.net/?retryWrites=true&w=majority&appName=pokerledger', {
})
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

// Define a schema for your table data
const TableSchema = new mongoose.Schema({
    name: String,
    age: Number,
    country: String
});

// Create a model from the schema
const TableRow = mongoose.model('TableRow', TableSchema);

// API route to get all table rows
app.get('/api/table', async (req, res) => {
    try {
        const rows = await TableRow.find(); // Retrieve all rows from the database
        res.json(rows);                    // Send them back as JSON
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API route to add a new row
app.post('/api/table', async (req, res) => {
    const newRow = new TableRow(req.body); // Create a new row from the request body
    try {
        const savedRow = await newRow.save(); // Save it to the database
        res.status(201).json(savedRow);      // Return the saved row
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// API route to delete a row by ID
app.delete('/api/table/:id', async (req, res) => {
    try {
        const deletedRow = await TableRow.findByIdAndDelete(req.params.id);
        if (!deletedRow) return res.status(404).json({ message: "Row not found" });
        res.json({ message: "Row deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server on port 5000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));