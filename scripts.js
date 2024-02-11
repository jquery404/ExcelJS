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
});