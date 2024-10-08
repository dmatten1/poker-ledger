const csvFile = document.getElementById('csvFile');
const button = document.getElementById('button');

button.addEventListener('click', () => {
  const file = csvFile.files[0]; // Get the file from the input element
  const reader = new FileReader();

  reader.onload = (event) => {
    const csvData = event.target.result;
    const rows = csvData.split('\n');
    
    let data = new Map(); // Ensure data is a Map

    for (let i = 1; i < rows.length-1; i++) {
      const currentRow = rows[i].split(',');
      const key = currentRow[0]; // Unique value in first column
      const value = Math.round(Number.parseFloat(currentRow[7])/100); // Value from the 8th column

      if (!data.has(key)) {
        data.set(key, value);
      } else {
        data.set(key, data.get(key) + value);
      }
    }

    console.log(data); // Map of accumulated values
    console.log([data.entries()]);

    data.forEach((value, key) => {
      document.write(`${key.slice(1,-1)}: ${Number(value)}<br>`);
    });

    //actually start doing the math
    const winners = [];
    const losers = [];



// Categorize winners and losers
    data.forEach((value,key) => {
        value = Number(value);
        if (value > 0) {
            winners.push(key);
        } else if (value < 0) {
            losers.push(key);
        }
    });
    // Sort winners and losers
    winners.sort((a, b) => data.get(b) - data.get(a)); // Largest winner first
    losers.sort((a, b) => data.get(a) - data.get(b)); // Largest loser first

    // Get the current date
    let cal = new Date();
    let formatted = cal.toISOString().split('T')[0]; // Format the date as yyyy-MM-dd
    document.write(`<br><br>` + formatted + `<br><br>`);
    document.write('Ledger:<br>');

    for (let loser of losers) {
    let amountOwed = Math.abs(data.get(loser));

    for (let winner of winners) {
        if (amountOwed == 0) break; // Loser has paid off all they owe

        let winnerNet = data.get(winner);

        if (winnerNet == 0) continue; // Skip if the winner has been paid off

        // Determine payment
        let payment = Math.min(amountOwed, winnerNet);

        // Print who owes whom
        document.write(`${loser} owes ${winner} $${Number(Math.round(payment))}<br>`);

        // Update remaining amounts
        amountOwed -= payment;
        data.set(winner, data.get(winner)-payment);
        }
        }

  };

  reader.readAsText(file); // Read the file
  
});
