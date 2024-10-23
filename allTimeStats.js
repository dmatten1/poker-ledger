
const button = document.getElementById('goBack');
button.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// const loadMasterLedger = async () => {
//     // Make a fetch call to the server to get the master ledger data
//     const response = await fetch('/api/masterLedger');
//     if (response.ok) {
//         const customSet = await response.json(); // Assuming the server sends JSON data
//         localStorage.setItem('masterLedger', JSON.stringify(customSet)); // Save to local storage
//         // Optionally, display the customSet data in the UI here
//     } else {
//         console.error('Failed to load master ledger:', response.status);
//     }
// };

// loadMasterLedger(); // Call the function to load the master ledger data