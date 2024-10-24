const addAllTimeButton = document.getElementById('addToAllTime');

// Fetch the entrySet from local storage and parse it
const rawEntrySet = localStorage.getItem('entrySet'); // Get raw value
console.log('Raw entrySet from localStorage:', rawEntrySet); // Debug log

const entrySet = JSON.parse(rawEntrySet) || []; // Default to an empty array if null
console.log('Parsed entrySet:', entrySet); // Debug log
console.log(entrySet.items.length);

addAllTimeButton.addEventListener('click', async () => {
    if (entrySet.items.length > 0) {
        await run(entrySet.items); // Call run function with entrySet
    } else {
        console.error('No entries found to add to All Time.');
    }
});

const run = async (entries) => {
    try {
        const response = await fetch('http://localhost:4000/api/addToAllTime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entries }), // Wrap entries in an object
        });

        // Check if the response is OK
        if (response.ok) {
            const result = await response.json();
            console.log(result.message); // Log the success message from server
            window.location.href = 'index.html'; // Redirect after successful addition
        } else {
            console.error('Failed to add to all time:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding to all-time:', error);
    }
};
