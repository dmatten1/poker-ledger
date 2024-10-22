import express from 'express';
import mongoose from 'mongoose'; // Make sure to import mongoose
import cors from 'cors';

// Initialize Express app
const app = express();
app.use(cors());                      // Enable CORS
app.use(express.json());              // Use built-in JSON parser in Express

// Connect to MongoDB database
mongoose.connect('mongodb+srv://dmatten1:C79GRKUVmqXfDg@pokerledger.w9rjc.mongodb.net/', {
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
export default CustomSetModel; // Export the model for use in your app
// Create a model for the custom set
//export const CustomSet = mongoose.model('CustomSet', customSetSchema);


// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export const connectDB = async () => {
  await mongoose.connect('mongodb+srv://dmatten1:C79GRKUVmqXfDg@cluster.mongodb.net/?retryWrites=true&w=majority&appName=appname', {
  });
};