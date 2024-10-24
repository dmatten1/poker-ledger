const button = document.getElementById('goBack');
button.addEventListener('click', () => {
    window.location.href = 'index.html';
});

const loadMasterLedger = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/masterLedger');
        
        if (response.ok) {
            const customSet = await response.json();
            
            // Check if customSet is an array and has items
            if (Array.isArray(customSet) && customSet.length > 0) {
                localStorage.setItem('masterLedger', JSON.stringify(customSet));
                customSet.sort((a, b) => b.net - a.net)
                // Create table structure
                let ledgerContent = `
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Net</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                // Populate rows with the data
                ledgerContent += customSet.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.net}</td>
                    </tr>
                `).join('');

                // Close table structure
                ledgerContent += `
                        </tbody>
                    </table>
                `;

                // Display the table in the UI
                document.getElementById('ledgerContent').innerHTML = ledgerContent;
            } else {
                console.error('No items found in customSet:', customSet);
                document.getElementById('ledgerContent').innerHTML = "No items found.";
            }
        } else {
            console.error('Failed to load master ledger:', response.status);
        }
    } catch (error) {
        console.error('Error fetching master ledger:', error);
    }
};

loadMasterLedger();