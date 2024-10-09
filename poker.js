const csvFile = document.getElementById('csvFile'); //can also be .xlsx
const button = document.getElementById('button');
button.addEventListener('click', () => {
  const column = document.getElementById('colNum').value;
  const colNum = Number(column);

  const file = csvFile.files[0]; // Get the file from the input element, can be .csv or .xlsx
  if (!file) {
    alert("Please select a file.");
    return;
  } 
  if (!column) {
    alert("Please select a number.");
    return;
  }
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = (event) => {
    let csvData;
    if (fileExtension === 'xlsx') {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Get the first sheet
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      csvData = XLSX.utils.sheet_to_csv(worksheet);
    }
    else {
      csvData = event.target.result;
    }
    
    const rows = csvData.split('\n');
    
    let data = new Map();
    let endpoint;
    if (fileExtension === 'csv') {endpoint = rows.length-1;}
    else {
      endpoint = rows.length;
    }

    for (let i = 1; i < endpoint; i++) {
      const currentRow = rows[i].split(',');
      const key = currentRow[0];

      console.log(colNum);
      console.log(typeof colNum);
      console.log(currentRow[colNum]);

      const value = Math.round(Number.parseFloat(currentRow[Number(colNum)])/100); // Value from the 8th column

      // console.log(value);
      // console.log(typeof value)
      if (!data.has(key)) {
        data.set(key, value);
      } else {
        data.set(key, data.get(key) + value);
      }
    }


    data.forEach((value, key) => {
      if (fileExtension === 'csv') {document.write(`${key.slice(1,-1)}: ${Number(value)}<br>`);}
      else {
        document.write(`${key}: ${Number(value)}<br>`);
      }
      
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
  if (fileExtension === 'xlsx') {
    reader.readAsArrayBuffer(file); // Read XLSX as binary data
  } 
  else {
    reader.readAsText(file); // Read CSV as plain text
    }});
