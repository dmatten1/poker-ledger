export class Entry {
    constructor(name, id, startTime, endTime, net) {
      this.name = name;
      this.id = id;
      let time = endTime - startTime; //in Date format
      time = time/3600000; //hours
      this.net = net;
    }
}
import { CustomSetModel } from './my-node-app/server.js';

export class CustomSet { //that will compare either names or ids
    constructor() {
    this.items = [];
    }

    // Add an item to the set
    add(item) {
    const existingIndex = this.findIndex(item);

    if (existingIndex === -1) {
        // Item not found, add it to the set
        this.items.push(item);
    } else {
        // Item exists, modify the existing one (update properties as needed)
        this.items[existingIndex].hours += item.time;
        this.items[existingIndex].net += item.net;
    }
    }

    // Custom "has" method that uses a custom equals method
    has(item) {
    return this.items.some(existingItem => this.equals(existingItem, item));
    }
    findIndex(item) {
    return this.items.findIndex(existingItem => this.equals(existingItem, item));
    }

    equals(item1, item2) {
    return item1.id === item2.id || item1.name === item2.name;
    }

    // Get all items in the custom set
    values() {
    return this.items;
    }

    // Save the current CustomSet to MongoDB
    
    async save() {
        try {
        const customSet = new CustomSetModel({ items: this.items });
        await customSet.save();
        console.log('CustomSet saved to database!');
        } catch (error) {
        console.error('Error saving CustomSet:', error);
        }
    }

    // Load the CustomSet from MongoDB
    static async load() {
        try {
        const customSetDoc = await CustomSetModel.findOne(); // Fetch the first document
        if (customSetDoc) {
            const customSet = new CustomSet();
            customSet.items = customSetDoc.items;
            console.log('CustomSet loaded from database!');
            return customSet;
        }
        console.log('No CustomSet found in database.');
        return new CustomSet(); // Return an empty set if none found
        } catch (error) {
        console.error('Error loading CustomSet:', error);
        }
    }
}
//module.exports = CustomSet;
