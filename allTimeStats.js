const button = document.getElementById('goBack');
button.addEventListener('click', () => {
    window.location.href = 'index.html';
});

let sortDirection = {
    name: true,
    net: true,
    hours: true,
    hourly: true
};

const loadMasterLedger = async () => {
    try {
        const response = await fetch('https://poker-ledger-1.onrender.com/api/masterLedger');
        
        if (response.ok) {
            const customSet = await response.json();
            
            // Check if customSet is an array and has items
            if (Array.isArray(customSet) && customSet.length > 0) {
                localStorage.setItem('masterLedger', JSON.stringify(customSet));
                customSet.sort((a, b) => b.net - a.net);
                
                // Function to render the table content
                const renderTable = (data) => {
                    let ledgerContent = `
                        <table>
                            <thead>
                                <tr>
                                    <th onclick="sortTable('name')">Name</th>
                                    <th onclick="sortTable('net')">Net</th>
                                    <th onclick="sortTable('hours')">Hours</th>
                                    <th onclick="sortTable('hourly')">Hourly</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;

                    // Populate rows with the data
                    ledgerContent += data.map(item => {
                        const netColor = item.net > 0 ? 'green' : item.net < 0 ? 'red' : 'black';
                        const hourlyRate = item.hours > 0 ? (item.net / item.hours) : 0;
                        const hourlyColor = hourlyRate > 0 ? 'green' : hourlyRate < 0 ? 'red' : 'black';

                        return `
                        <tr>
                            <td>${item.name}</td>
                            <td style="color:${netColor};">${item.net.toFixed(2)}</td>
                            <td>${item.hours.toFixed(2)}</td>
                            <td style="color:${hourlyColor};">${hourlyRate.toFixed(2)}</td>
                        </tr>
                        `;
                    }).join('');

                    // Close table structure
                    ledgerContent += `
                            </tbody>
                        </table>
                    `;

                    // Display the table in the UI
                    document.getElementById('ledgerContent').innerHTML = ledgerContent;
                };

                renderTable(customSet);

                // Sort function
                window.sortTable = (key) => {
                    customSet.sort((a, b) => {
                        if (key === 'name') {
                            return sortDirection[key] ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
                        } else if (key === 'hourly') {
                            // Sort by hourly rate (net / hours)
                            const hourlyA = a.hours > 0 ? a.net / a.hours : 0;
                            const hourlyB = b.hours > 0 ? b.net / b.hours : 0;
                            return sortDirection[key] ? hourlyA - hourlyB : hourlyB - hourlyA;
                        } else {
                            return sortDirection[key] ? a[key] - b[key] : b[key] - a[key];
                        }
                    });
                    sortDirection[key] = !sortDirection[key]; // Toggle sort direction
                    renderTable(customSet);
                };
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
