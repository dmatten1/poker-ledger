
import { CustomSet } from './classes.js';
import { Entry } from './classes.js';
let holdForS = "";
const csvFile = document.getElementById('csvFile'); //can also be .xlsx
const button = document.getElementById('button');
const statsButton = document.getElementById('goToAllTimeStats');
let resultLedger = "";
let entrySet = new CustomSet(); //for now, only works with csv with time from pokernow



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
           //no time
        } //addEntry is overengineered, never gets here
        
      } else {
        data.set(key, data.get(key) + value);
      }
      if(currentRow[3].length<4) { //completely arbitrary, just want to ensure that it catches no dates bc idk how excel works
        let endDate = new Date();
        entrySet.addEntry(`${key.slice(1,-1)}`, currentRow[1], value, currentRow[2], endDate); //do we need mongoose's now?
      }
      else {entrySet.addEntry(`${key.slice(1,-1)}`, currentRow[1], value, currentRow[2], currentRow[3]);}
    }


    // data.forEach((value, key) => {
    //   if (fileExtension === 'csv') {
    //     resultLedger += (`${key.slice(1,-1)}: ${Number(value)}<br>`);
        

    //   }
    //   else {
    //     resultLedger += (`${key}: ${Number(value)}<br>`);
    //   }
      
    // });

    //actually start doing the math
    const winners = [];
    const losers = [];



// Categorize winners and losers
    // data.forEach((value,key) => {
    //     value = Number(value);
    //     if (value > 0) {
    //         winners.push(key);
    //     } else if (value < 0) {
    //         losers.push(key);
    //     }
    // });
    entrySet.items.forEach(e => {
      let value = Number(e.net);
      if (value > 0) {
        winners.push(new Entry(e.name, e.id, e.net, e.start, e.end));
      } else if (value < 0) {
        losers.push(new Entry(e.name, e.id, e.net, e.start, e.end)); 
      } //arrays of entries
    });
    // Sort winners and losers
    winners.sort((a, b) => entrySet.get(b) - entrySet.get(a)); // Largest winner first
    losers.sort((a, b) => entrySet.get(a) - entrySet.get(b)); // Largest loser first

    // Get the current date
    let cal = new Date();
    let formatted = cal.toISOString().split('T')[0]; // Format the date as yyyy-MM-dd
    resultLedger += (`<br><br>` + formatted + `<br><br>`);
    resultLedger += ('Ledger:<br>');

    for (let loser of losers) {
      let amountOwed = Math.abs(loser.net);  // Get the amount the loser owes
    
      for (let winner of winners) {
        if (amountOwed === 0) break; // Loser has paid off all they owe
    
        let winnerNet = winner.net;
    
        if (winnerNet === 0) continue; // Skip if the winner has been paid off
    
        // Determine payment
        let payment = Math.min(amountOwed, winnerNet);
    
        // Display who owes whom
        resultLedger += (`${loser.name} owes ${winner.name} $${Number(Math.round(payment))}<br>`);
        holdForS += (`${loser.name} owes ${winner.name} $${Number(Math.round(payment))}<br>`);
    
        // Update remaining amounts
        amountOwed -= payment;
        winner.net -= payment; // Reduce the winner's net by the payment
      }
    }
        resultLedger += '<br></br>';
        holdForS += '<br></br>';
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
  //localStorage.setItem('ledgerData', resultLedger);
  let s = entrySet.stringPrint();
  let cal = new Date();
  let formatted = cal.toISOString().split('T')[0]; // Format the date as yyyy-MM-dd
  s += (`<br><br>` + formatted + `<br><br>`);
  s += ('Ledger:<br>');
  s += holdForS;
  localStorage.setItem('ledgerData', s);
  localStorage.setItem('entrySet', JSON.stringify(entrySet));
  window.location.href = 'ledgerPage.html';

}

statsButton.addEventListener('click', () => {
  window.location.href = 'allTimeStats.html';

})



