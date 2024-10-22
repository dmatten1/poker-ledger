import express from 'express';
import { connectDB, CustomSet } from './my-node-app/server.js'; // Adjust imports as needed

const app = express();
app.use(express.json());

app.post('/api/addToAllTime', async (req, res) => {
    const entrySet = req.body; // Get data from the request
    await connectDB(); // Connect to the database
    
    const customSet = await CustomSet.load(); // Load existing set from DB
    
    // Add to customSet logic here
    
    await customSet.save(); // Save the updated set to DB
    res.status(200).send('Entries added to all time stats.');
});