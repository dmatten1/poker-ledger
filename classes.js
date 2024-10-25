// Define Entry class on the client!! side
export class Entry {
    constructor(name, id, net) {
      this.name = name;
      this.id = id.toString();
    //   if (startTime === "") {
        
    //   }
    //   if (endTime === "") {
    //     let cal = new Date();
    //     let formatted = cal.toISOString().split('T')[0]; //i have no clue what this does
    //     endTime = formatted;
    //   }
    //   this.time = (endTime - startTime) / 3600000; // Calculate time in hours
      this.net = net;
    }
  }
  
  // Define CustomSet class on the client side
  export class CustomSet {
    constructor() {
      this.items = [];
    }
  
    // Add an item to the set
    add(item) {
      const existingIndex = this.findIndex(item);
  
      if (existingIndex === -1) {
        this.items.push(item); // If not found, add to set
      } else {
        //this.items[existingIndex].hours += item.time;
        this.items[existingIndex].net += item.net;
      }
    }
     // Method to add entries, with duplicate check and net update logic
     addEntry(name, id, net) {
        let duplicateFound = false;

        // Iterate over the existing items in the set to check for duplicates
        this.items.forEach((entry) => {
            if (entry.name === name || entry.id === id) {
                console.log(`Duplicate found for ${name}. Old net: ${entry.net}, adding: ${net}`);
                entry.net += Number(net); 
                console.log(`New net for ${name}: ${entry.net}`);
                duplicateFound = true;
            }
        });

        // If no duplicate was found, create a new entry and add it to the set
        if (!duplicateFound) {
            const newEntry = new Entry(name, id, net); // Use currentRow[0] for name, and currentRow[1] for ID
            this.items.push(newEntry); // Add the new entry to the items array
        }
    }
  
    // Check if an item exists in the set
    has(item) {
      return this.items.some(existingItem => this.equals(existingItem, item));
    }
  
    // Find index of the item in the set
    findIndex(item) {
      return this.items.findIndex(existingItem => this.equals(existingItem, item));
    }
  
    // Equality check (based on id or name)
    equals(item1, item2) {
      return item1.id === item2.id || item1.name === item2.name;
    }
  
    // Get all items in the set
    values() {
      return this.items;
    }
  
    // Save the custom set to the server (using API call)
    async save() {
      try {
        const response = await fetch('http://localhost:4000/api/saveCustomSet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.items),
        });
        const result = await response.json();
        console.log('CustomSet saved:', result);
      } catch (error) {
        console.error('Error saving CustomSet:', error);
      }
    }
  
    // Load the custom set from the server (using API call)
    static async load() {
      try {
        const response = await fetch('http://localhost:4000/api/masterLedger');
        const data = await response.json();
        const customSet = new CustomSet();
        customSet.items = data;
        console.log('CustomSet loaded:', customSet);
        return customSet;
      } catch (error) {
        console.error('Error loading CustomSet:', error);
      }
    }
    stringPrint() {
        let s = "";
        this.items.forEach(e => {
            s += e.name + ": " + e.net + "<br>";
        });
        return s;
    }
    get(name) {
        this.items.forEach(element => {
            if (name === element.name) {
                return element.net;
            }
        });
    }
    set(name, net) {
        this.items.forEach(element => {
            if (name === element.name) {
                element.net = net;
            }
        });
    }
  }