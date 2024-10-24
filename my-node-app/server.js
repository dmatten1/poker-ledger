import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json()); // JSON parsing

// Connect to MongoDB database
mongoose.connect('mongodb+srv://dmatten1:C79GRKUVmqXfDg@pokerledger.w9rjc.mongodb.net/pokerledger?retryWrites=true&w=majority', {
})
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define item schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  net: { type: Number, required: true }
});

// Define custom set schema
const customSetSchema = new mongoose.Schema({
  items: [itemSchema],
});

const CustomSetModel = mongoose.model('CustomSet', customSetSchema);

// API endpoint to load the custom set
app.get('/api/masterLedger', async (req, res) => {
  try {
    const customSetDocs = await CustomSetModel.find(); // Returns an array
    if (customSetDocs && customSetDocs.length > 0) {
      res.status(200).json(customSetDocs[0].items); // Return items from the first document
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
  const { entries } = req.body; // Expecting an array of entries in the request body

  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Entries must be a non-empty array' });
  }

  try {
    // Fetch the current custom set from the database
    let customSet = await CustomSetModel.findOne();
    
    if (!customSet) {
      // If no custom set exists, create a new one with the entries
      customSet = new CustomSetModel({ items: entries });
    } else {
      // Loop over each entry in the request
      entries.forEach(entry => {
        let found = false;
        
        // Loop over each item in the customSet
        customSet.items.forEach((item) => {
          if (item.id === entry.id) {
            // Update existing entry's net value
            item.net += entry.net;
            found = true;
          }
        });
        
        // If no matching entry is found, add it to customSet
        if (!found) {
          customSet.items.push(entry);
        }
      });
    }

    // Save the updated custom set back to the database
    await customSet.save();
    res.status(200).json({ message: 'Master ledger updated successfully!' });
    
  } catch (error) {
    console.error('Error updating master ledger:', error);
    res.status(500).json({ error: 'Failed to update master ledger' });
  }
});

// API endpoint to create a new custom set
app.post('/api/createCustomSet', async (req, res) => {
  const { items } = req.body; // Expecting an array of items in the request body

  try {
    // Create a new instance of CustomSetModel
    const newCustomSet = new CustomSetModel({
      items, // Items should be an array of objects matching the itemSchema
    });

    // Save the new custom set to the database
    await newCustomSet.save();

    // Respond with a success message and the newly created CustomSet
    res.status(201).json({
      message: 'CustomSet created successfully!',
      customSet: newCustomSet,
    });
  } catch (error) {
    console.error('Error creating CustomSet:', error);
    res.status(500).json({ error: 'Failed to create CustomSet' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
