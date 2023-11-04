const fs = require('fs');
const csv = require('csv-parser');

const selectedColumns = ['Close', 'Volume', 'Date']; // Specify the columns you want to select
const data = [];

fs.createReadStream('C.csv') // Replace 'data.csv' with your CSV file path
  .pipe(csv())
  .on('data', (row) => {
    const selectedData = {};
    for (const column of selectedColumns) {
      selectedData[column] = row[column];
    }
    data.push(selectedData);
  })
  .on('end', () => {
    // Write the data to a new JSON file
    fs.writeFile('c.json', JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('Data has been written to selected-data.json');
      }
    });
  });