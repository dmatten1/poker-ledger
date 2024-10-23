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
  id: { type: Number, required: true },
  hours: { type: Number, required: true },
  net: { type: Number, required: true },
  hourly: { type: Number, required: true },
});

// Define custom set schema
const customSetSchema = new mongoose.Schema({
  items: [itemSchema],
});

const CustomSetModel = mongoose.model('CustomSet', customSetSchema);

// API endpoint to load the custom set
app.get('/api/masterLedger', async (req, res) => {
  try {
    const customSetDoc = await CustomSetModel.findOne();
    if (customSetDoc) {
      res.status(200).json(customSetDoc.items);
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

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
