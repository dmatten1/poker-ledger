import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 4000;
const corsOptions = {
  origin: '*', // or specify allowed origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
  exposedHeaders: 'Access-Control-Allow-Private-Network',
};
app.use(cors(corsOptions));
app.use(express.json()); // JSON parsing

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '../')));

// Connect to MongoDB database
mongoose.connect('mongodb+srv://dmatten1:C79GRKUVmqXfDg@pokerledger.w9rjc.mongodb.net/pokerledger?retryWrites=true&w=majority', {})
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define item schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  net: { type: Number, required: true },
  hours: { type: Number, required: true, default: 0}
});

// Define custom set schema
const customSetSchema = new mongoose.Schema({
  items: [itemSchema],
});

const CustomSetModel = mongoose.model('CustomSet', customSetSchema);

// API endpoint to load the custom set
app.get('/api/masterLedger', async (req, res) => {
  try {
    const customSetDocs = await CustomSetModel.find();
    if (customSetDocs && customSetDocs.length > 0) {
      res.status(200).json(customSetDocs[0].items);
    } else {
      res.status(404).json({ message: 'No CustomSet found' });
    }
  } catch (error) {
    console.error('Error fetching CustomSet:', error);
    res.status(500).json({ error: 'Failed to fetch CustomSet' });
  }
});

// API endpoint to save the custom set
app.post('/api/saveCustomSet', async (req, res) => {
  const { items } = req.body;
  try {
    let customSet = await CustomSetModel.findOne();
    if (customSet) {
      customSet.items = items;
    } else {
      customSet = new CustomSetModel({ items });
    }
    await customSet.save();
    res.status(200).json({ message: 'CustomSet saved successfully!' });
  } catch (error) {
    console.error('Error saving CustomSet:', error);
    res.status(500).json({ error: 'Failed to save CustomSet' });
  }
});

// Endpoint to add or update entries in the master ledger
app.post('/api/addToAllTime', async (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Entries must be a non-empty array' });
  }

  try {
    let customSet = await CustomSetModel.findOne();
    if (!customSet) {
      customSet = new CustomSetModel({ items: entries });
    } else {
      entries.forEach(entry => {
        // Find item in the current set that matches the entry id
        const existingItem = customSet.items.find(item => item.id === entry.id || item.name === entry.name);
        
        if (existingItem) {
          // Update net and hours for matching items
          existingItem.net += entry.net;
          existingItem.hours += entry.hours;
          console.log(`Updated entry with id ${entry.id}: net is now ${existingItem.net}, hours are now ${existingItem.hours}`);
        } else {
          // Add new entry if no match found
          customSet.items.push(entry);
          console.log(`Added new entry with id ${entry.id}`);
        }
      });
    }
    customSet.items.sort((a, b) => b.net - a.net);
    await customSet.save();
    res.status(200).json({ message: 'Master ledger updated successfully!' });
  } catch (error) {
    console.error('Error updating master ledger:', error);
    res.status(500).json({ error: 'Failed to update master ledger' });
  }
});

// API endpoint to create a new custom set
app.post('/api/createCustomSet', async (req, res) => {
  const { items } = req.body;
  try {
    const newCustomSet = new CustomSetModel({ items });
    await newCustomSet.save();
    res.status(201).json({ message: 'CustomSet created successfully!', customSet: newCustomSet });
  } catch (error) {
    console.error('Error creating CustomSet:', error);
    res.status(500).json({ error: 'Failed to create CustomSet' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});