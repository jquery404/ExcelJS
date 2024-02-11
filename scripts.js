// Grid stuffs
const gridLabel = document.getElementById('grid-label');
const gridContainer = document.getElementById('grid-container');
const cellNumbers = {};
const cellData = {};

let nCol;
let nRow;

// Form on submit ->
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault(); 

    nRow = document.getElementById('rowNumber').value;
    nCol = document.getElementById('columnNumber').value;

    gridContainer.innerHTML = '';
    gridContainer.style.cssText = `
        grid-template-rows: repeat(${nRow}, 50px);
        grid-template-columns: repeat(${nCol}, 50px);
        width: calc(${nCol} * 50px + 100px);
        height: calc(${nRow} * 50px + 100px);
    `;

    for (let row = 1; row <= nRow; row++) {
        for (let col = 0; col < nCol; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.textContent = '';
            gridContainer.appendChild(cell);
        }
    }

    // Label print
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.getAttribute('data-row'));
        const col = parseInt(cell.getAttribute('data-col'));
        
        if (row === 1 && col === 0) {
            createParagraph(cell, 'A', 20, -45);
            createParagraph(cell, '1', -20, 0);
        } else if (row === 1) {
            const label = getColumnLabel(col);
            createParagraph(cell, label, 20, -45);
        } else if (col === 0) {
            createParagraph(cell, row, -20, 0);
        }
    });

    function createParagraph(cell, text, leftOffset, topOffset) {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        paragraph.style.position = 'absolute';
        paragraph.style.left = `${cell.offsetLeft + leftOffset}px`;
        paragraph.style.top = `${cell.offsetTop + topOffset}px`;
        cell.insertAdjacentElement('afterend', paragraph);
    }

    function getColumnLabel(col) {
        let label = '';
        let quotient = col + 1;
        do {
            const remainder = quotient % 26;
            if (remainder === 0) {
                label = 'Z' + label;
                quotient = Math.floor(quotient / 26) - 1;
            } else {
                label = String.fromCharCode(64 + remainder) + label;
                quotient = Math.floor(quotient / 26);
            }
        } while (quotient > 0);
        return label;
    }

    repopulateGrid();
});

// Repopulate the grid from cellData object
function repopulateGrid() {
    Object.entries(cellData).forEach(([key, cellInfo]) => {
        const [row, col] = key.split('-').map(Number);
        const cell = gridContainer.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            // cell.textContent = value;
            const value = cellInfo.formula ? evaluateFormula(cellInfo.formula.substring(1)) : cellInfo.value;
            cell.textContent = value;
        }
    });
}

// Cell click event listener
gridContainer.addEventListener('click', function(event) {
    const cell = event.target;
    if (cell.classList.contains('cell')) {
      const row = cell.dataset.row;
      const col = cell.dataset.col;
      console.log(row, col);
  
      const cellInfo = cellData[`${row}-${col}`];
      const cellValue = cellInfo ? (cellInfo.formula || cellInfo.value) : '';
      const input = prompt(`Enter number for cell ${String.fromCharCode(65 + parseInt(col))}${row}`, cellValue)
      
      handleCellInput(row, col, input);
      repopulateGrid();
    }
});


// Handle cell input 
function handleCellInput(row, col, input) {
    if (input === null || input.trim() === '') {
        return; 
    }

    let cellContent, cellDataType;

    if (input.startsWith('=')) {
        const formula = input.substring(1);
        const result = evaluateFormula(formula);

        if (result !== null) {
            cellContent = result;
            cellDataType = input;
        } else {
            alert('Invalid formula.');
            return;
        }
    } else {
        const parsedValue = parseFloat(input);
        if (!isNaN(parsedValue)) {
            cellContent = parsedValue;
            cellDataType = null; 
        } else {
            alert('Enter a valid number.');
            return; 
        }
    }

    const cell = gridContainer.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.textContent = cellContent;
    }

    cellData[`${row}-${col}`] = {
        formula: cellDataType,
        value: cellContent
    };
}

function evaluateFormula(formula) {

    const sumRegex = /^SUM\((\w+\d+:\w+\d+)\)$/i;
    const sumMatch = formula.match(sumRegex);

    const cellRefs = formula.match(/[A-Z]+\d+/g);


    if (sumMatch) {
        const range = sumMatch[1].split(':');
        const startCell = range[0];
        const endCell = range[1];
        return sumRange(startCell, endCell);
    }
    else if (cellRefs) { 
        const evaluatedFormula = formula.replace(/[A-Z]+\d+/g, (cellRef) => {
            const [colStr, rowStr] = cellRef.match(/([A-Z]+)(\d+)/).slice(1);
            const col = colStr.charCodeAt(0) - 65; 
            const row = parseInt(rowStr); 
            const cellValue = cellData[`${row}-${col}`].value;
            if (cellValue !== undefined) {
                return cellValue.toString();
            } else {
                return '#REF!'; 
            }
        });
        try {
            return eval(evaluatedFormula);
        } catch (error) {
            console.error(error);
            return null; 
        }
    }
    
    return null;
}