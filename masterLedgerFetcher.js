import express from 'express';
import { connectDB } from './my-node-app/server.js'; // Adjust imports as needed
import { CustomSet } from './classes.js';
const app = express();
app.use(express.json());

app.get('/api/masterLedger', async (req, res) => {
    await connectDB(); // Connect to the database
    const customSet = await CustomSet.load(); // Load existing set from DB
    res.json(customSet); // Send the customSet data back as JSON
});