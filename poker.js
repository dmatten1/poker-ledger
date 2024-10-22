const csvFile = document.getElementById('csvFile'); //can also be .xlsx
const button = document.getElementById('button');
const statsButton = document.getElementById('goToAllTimeStats');
let resultLedger = "";
let entrySet = new Set(); //for now, only works with csv with time from pokernow
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
      let nameEndIndex = rows[i].indexOf("\"", 1);
      for (let j=1;j<nameEndIndex;j++) {  //check for commas in the name that might screw with the comma splitting
          if (rows[i].charAt(j) == ',') {
              rows[i] = rows[i].substring(0,j) + rows[i].substring(j+1);
              j--;
          }
      }




      const currentRow = rows[i].split(',');
      const key = currentRow[0];

      const value = Math.round(Number.parseFloat(currentRow[(colNum)])/100); // Value from the 8th column



      if (!data.has(key)) {
        data.set(key, value);
        if (fileExtension === 'csv') {
          entrySet.add(new Entry(`${key.slice(1,-1)}`, currentRow[1], currentRow[2], currentRow[3], value));
        }
        
      } else {
        data.set(key, data.get(key) + value);
      }
    }


    data.forEach((value, key) => {
      if (fileExtension === 'csv') {
        resultLedger += (`${key.slice(1,-1)}: ${Number(value)}<br>`);
        

      }
      else {
        resultLedger += (`${key}: ${Number(value)}<br>`);
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
    resultLedger += (`<br><br>` + formatted + `<br><br>`);
    resultLedger += ('Ledger:<br>');

    for (let loser of losers) {
    let amountOwed = Math.abs(data.get(loser));

    for (let winner of winners) {
        if (amountOwed == 0) break; // Loser has paid off all they owe

        let winnerNet = data.get(winner);

        if (winnerNet == 0) continue; // Skip if the winner has been paid off

        // Determine payment
        let payment = Math.min(amountOwed, winnerNet);

        // Print who owes whom
        resultLedger += (`${loser} owes ${winner} $${Number(Math.round(payment))}<br>`);
        // Update remaining amounts
        amountOwed -= payment;
        data.set(winner, data.get(winner)-payment);
        }
        }
        resultLedger += '<br></br>'
        //document.write(resultLedger);   test if resultLedger is correct
        loadLedger();
  };

  //start doing
  if (fileExtension === 'xlsx') {
    reader.readAsArrayBuffer(file); // Read XLSX as binary data
  } 
  else {
    reader.readAsText(file); // Read CSV as plain text
    }
  
  
  });

function loadLedger() {
  localStorage.setItem('ledgerData', resultLedger);
  localStorage.setItem('entrySet', entrySet);
  window.location.href = 'ledgerPage.html';

}

statsButton.addEventListener('click', () => {
  window.location.href = 'allTimeStats.html';

})


class Entry {
  constructor(name, id, startTime, endTime, net) {
    this.name = name;
    this.id = id;
    let time = endTime - startTime; //in Date format
    this.net = net;
  }
}
