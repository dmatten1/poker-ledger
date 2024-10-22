

const addAllTimeButton = document.getElementById('addToAllTime');
const entrySet = localStorage.getItem('entrySet'); // Parse if stored as JSON

addAllTimeButton.addEventListener('click', async () => {
    await run(); // Call run function
    window.location.href = 'index.html'; // Redirect after running
});

const run = async () => {
    // Make a fetch call to the server to add the entries to the database
    await fetch('/api/addToAllTime', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entrySet), // Send the entrySet to the server
    });
};