import UUID from './UUID';

/**
 * Creates the grid.
 */
export function buildTableMap(tableEl){
    const [nRows, nCols] = dimensions(tableEl);
    const grid = initializeTableMap(nRows, nCols);
    populateTableMap(tableEl, grid, nRows, nCols);
    grid.tableID = tableEl.id;  // for debugging
    return grid;
}

/**
 * Returns an object that describes the operations that are possible on
 * a cell of a table. This is used to populate the edit menu.
 *
 * The operations object has these boolean properties:
 *
 *     mergeLeft
 *     mergeRight
 *     mergeAbove
 *     mergeBelow
 *     insertLeft
 *     insertRight
 *     insertAbove
 *     insertBelow
 *     unMerge
 */
export function operations(grid, el){
    const [row, col] = findCell(grid, el);
    return {
        mergeLeft: canMergeLeft(grid, row, col),
        mergeRight: canMergeRight(grid, row, col),
        mergeAbove: canMergeAbove(grid, row, col),
        mergeBelow: canMergeBelow(grid, row, col),
        unMerge: canUnMerge(grid, row, col),
        insertLeft: canInsertLeft(grid, col),
        insertRight: canInsertRight(grid, row, col),
        insertAbove: canInsertAbove(grid, row),
        insertBelow: canInsertBelow(grid, row, col),
    };
}

/**
 * Returns [row, col].
 */
export function findCell(grid, el){
    for (let row = 0; row < grid.length; row++){
        for (let col = 0; col < grid[row].length; col++){
            if (grid[row][col].el === el) return [row, col];
        }
    }
    throw new Error('findCell: element does not exist');
}

function canMergeLeft(grid, row, col){
    if (col === 0) return false;

    const cell = gridAt(grid, row, col);
    const left = gridAt(grid, row, col - 1);

    if (cell.rowSpan === left.rowSpan){
        const origin = gridAt(grid, row, col - left.colSpan);
        if (origin.el) return true;
    }

    return false;
}

function canMergeRight(grid, row, col){
    const rightCol = col + gridAt(grid, row, col).colSpan;

    if (rightCol === grid[0].length){
        return false;
    }
    return canMergeLeft(grid, row, rightCol);
}

function canMergeAbove(grid, row, col){
    if (row === 0) return false;

    const cell = gridAt(grid, row, col);
    const above = gridAt(grid, row - 1, col);

    if (cell.colSpan === above.colSpan){
        const origin = gridAt(grid, row - above.rowSpan, col);
        if (origin.el) return true;
    }

    return false;
}

function canMergeBelow(grid, row, col){
    const belowRow = row + gridAt(grid, row, col).rowSpan;

    if (belowRow === grid.length){
        return false;
    }
    return canMergeAbove(grid, belowRow, col);
}

function canUnMerge(grid, row, col){
    const el = gridAt(grid, row, col).el;
    return el.rowSpan > 1 || el.colSpan > 1;
}

function canInsertLeft(grid, col){
    if (col === 0) return true;  // We really don't need this.

    for (let row = 0; row < grid.length; row += gridAt(grid, row, col).rowSpan){
        // If it's a virtual cell, we can't split it with a new column.
        if (!gridAt(grid, row, col).el) return false;
    }

    return true;
}

function canInsertRight(grid, row, col){
    const rightCol = col + gridAt(grid, row, col).colSpan;

    if (rightCol === grid[0].length){
        return true;
    }
    return canInsertLeft(grid, rightCol);
}

function canInsertAbove(grid, row){
    if (row === 0) return true;

    for (let col = 0; col < grid[0].length; col += gridAt(grid, row, col).colSpan){
        if (!gridAt(grid, row, col).el) return false;
    }

    return true;
}

function canInsertBelow(grid, row, col){
    const belowRow = row + gridAt(grid, row, col).rowSpan;

    if (belowRow === grid.length){
        return true;
    }
    return canInsertAbove(grid, belowRow);
}

/**
 * Returns an array of strings that represent rows in the grid.
 * Each cell has the form: tagName[rowspan,colspan]. The tagName
 * is '--' if the cell is a virtual cell (from a rowspan or colspan).
 *
 * Example:
 *
 *  [
 *   'TD[2,1] TD[1,1]',
 *   '--[2,1] TD[1,1]',
 *   'TD[1,1] TD[1,1]'
 *  ]
 */
export function logGrid(grid){
    const result = [];
    grid.forEach(row => {
        const line = [];
        row.forEach(cell => {
            const tagName = cell.el && cell.el.tagName ? cell.el.tagName : '--';
            line.push(`${tagName}[${cell.rowSpan},${cell.colSpan}]`);
        });
        result.push(line.join(' '));
    });
    return result;
}

function initializeTableMap(nRows, nCols){
    const grid = new Array(nRows);
    for (let i = 0; i < nRows; i++){
        grid[i] = new Array(nCols);
        for (let j = 0; j < nCols; j++){
            grid[i][j] = {
                el: null,
                colSpan: 0,
                rowSpan: 0,
            };
        }
    }

    return grid;
}

function populateTableMap(tableEl, grid, nRows, nCols){
    let row = 0;
    Array.from(tableEl.rows).forEach(rowEl => {
        let col = 0;
        Array.from(rowEl.cells).forEach(cell => {
            // Skip cells that were filled by rowspans from above. Cells initially have
            // rowSpan = colSpan = 0.
            while (gridAt(grid, row, col).rowSpan !== 0){
                col++;
            }

            gridAt(grid, row, col).el = cell;
            fillSpans(grid, row, col, cell);
            col += cell.colSpan;
        });
        row += 1;
    });
}

/**
 * Returns the dimensions of a table, accounting for "ghost" cells that
 * have been merged by [rowspan] or [colspan] attributes from their
 * neighbors.
 *
 * @return [nRows {integer}, nCols {integer}]
 */
function dimensions(tableEl){
    const rows = Array.from(tableEl.rows);

    const nCols = rows.reduce((maxCols, row) => {
        const cols = Array.from(row.cells).reduce((rowCols, cell) => {
            return rowCols + cell.colSpan;
        }, 0);
        return Math.max(maxCols, cols);
    }, 0);

    return [rows.length, nCols];
}

/**
 * Extends a cell based on rowspan and colspan attributes.
 *
 * @param grid The grid
 * @param row The current row.
 * @param col The current column.
 * cell The table element.
 */
function fillSpans(grid, row, col, cell){
    for (let i = 0; i < cell.rowSpan; i++){
        for (let j = 0; j < cell.colSpan; j++){
            gridAt(grid, row + i, col + j).rowSpan = cell.rowSpan;
            gridAt(grid, row + i, col + j).colSpan = cell.colSpan;
        }
    }
}

/**
 * Gets the grid element at [row][col] after validating the `row` and `col` values.
 * Throws an error if they are not valid.
 *
 * @param {Array.<Object>} row The row index.
 * @param {number} row The row index.
 * @param {number} col The column index. Returns the row array if omitted.
 *
 * @return {Object} The grid element, or {Array.<Object>} the row array.
 */
function gridAt(grid, row, col = null){
    if (row >= grid.length || col !== null && col >= grid[row].length){
        console.log(logGrid(grid));
        throw new Error(`Invalid grid operation at (${row}, ${col}) in table #${grid.tableID}`);
    }

    if (col === null) return grid[row];
    return grid[row][col];
}

/**
 * Logs table details to the console.
 */
export function dumpTable(tableEl){
    console.log(`${tableEl.tagName} #${tableEl.id}`);
    console.log(tableEl);
    console.dir(tableEl);
    [...tableEl.children].forEach(el => {
        if (el.tagName === 'CAPTION'){
            console.log(`${el.tagName} "${el.textContent}"`);
        } else if (el.tagName === 'TBODY' || el.tagName === 'THEAD'){
            console.log(el.tagName);
            [...el.children].forEach((el, rowNum) => {
                console.log(`  ${rowNum}`, el.tagName);
                [...el.children].forEach((el, colNum) => {
                    const text = el.textContent.trim();
                    const span = `rowspan=${el.rowSpan}, colspan=${el.colSpan}`;
                    console.log(`    ${colNum} ${el.tagName} [${span}] "${text}"`);

                });
            });
        }
    });
}


export function mergeLeft(grid, sourceEl){
    const destEl = sourceEl.previousElementSibling;
    sourceEl.parentElement.removeChild(sourceEl);
    destEl.parentElement.replaceChild(sourceEl, destEl);
    sourceEl.colSpan += destEl.colSpan;
}

export function mergeRight(grid, sourceEl){
    const destEl = sourceEl.nextElementSibling;
    sourceEl.colSpan += destEl.colSpan;
    destEl.parentElement.removeChild(destEl);
}

export function mergeAbove(grid, sourceEl){
    const [row, col] = findCell(grid, sourceEl);
    const destRow = row - gridAt(grid, row - 1, col).rowSpan;
    const destEl = gridAt(grid, destRow, col).el;

    sourceEl.parentElement.removeChild(sourceEl);
    destEl.parentElement.replaceChild(sourceEl, destEl);
    sourceEl.rowSpan += destEl.rowSpan;
    // TODO: Remove empty row.
}

export function mergeBelow(grid, sourceEl){
    const [row, col] = findCell(grid, sourceEl);
    const destRow = row + gridAt(grid, row, col).rowSpan;
    const destEl = gridAt(grid, destRow, col).el;

    sourceEl.rowSpan += destEl.rowSpan;
    const rowEl = destEl.parentElement;
    rowEl.removeChild(destEl);
    // TODO: Remove empty row.
}

export function unMerge(grid, sourceEl){
    const [row, col] = findCell(grid, sourceEl);
    const colSpan = sourceEl.colSpan;

    unMergeRow(sourceEl);

    // Add an extra "safety" column to handle colSpans that go to the end of the row.
    const safeGrid = grid.map(row => row.concat({el: null}));

    let rowEl = sourceEl.parentElement;
    for (let i = 1; i < sourceEl.rowSpan; i++){
        rowEl = rowEl.nextElementSibling;
        const el = sourceEl.cloneNode(false);
        el.colSpan = colSpan;
        el.rowSpan = 1;
        const nextSibling = gridAt(safeGrid, row + i, col + colSpan).el;
        rowEl.insertBefore(el, nextSibling);
        unMergeRow(el);
    }

    sourceEl.rowSpan = 1;
}

/**
 * Unmerges cells on a single row.
 */
function unMergeRow(sourceEl){
    for (let i = 1; i < sourceEl.colSpan; i++){

        const el = sourceEl.cloneNode(false);

        // Generate a new UUID, because cloneNode clones the data-uuid.
        el.dataset.uuid = UUID();

        // The ToolbarTableCommandCapability#addTableColumn_ method simply sets the innerHTML:
        // el.innerHTML =  ToolbarTableCommandCapability.DEFAULT_CELL_CONTENT_;

        el.colSpan = 1;
        el.rowSpan = 1;
        sourceEl.parentElement.insertBefore(el, sourceEl.nextElementSibling);
    }

    sourceEl.colSpan = 1;
}
