export function buildTableMap(tableEl){
    const [nRows, nCols] = dimensions(tableEl);
    const grid = initializeTableMap(nRows, nCols);
    populateTableMap(tableEl, grid, nRows, nCols);
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
 *     mergeUp
 *     mergeDown
 *     insertLeft
 *     insertRight
 *     insertAbove
 *     insertBelow
 *     unMerge
 */
export function operations(grid, el){
    const [row, col] = findCell(grid, el);
    const cell = grid[row][col];
    return {
        mergeLeft: canMergeLeft(grid, row, col),
        mergeRight: canMergeRight(grid, row, col),
        mergeUp: canMergeUp(grid, row, col),
        mergeDown: canMergeDown(grid, row, col),
        insertLeft: canInsertLeft(grid, col),
        insertRight: canInsertRight(grid, row, col),
        insertAbove: canInsertAbove(grid, row),
        insertBelow: canInsertBelow(grid, row, col),
    }
}

/**
 * Returns [row, col].
 */
function findCell(grid, el){
    for (let row = 0; row < grid.length; row++){
        for (let col = 0; col < grid[row].length; col++){
            if (grid[row][col].el === el) return [row, col];
        }
    }
    throw new Error('findCell: element does not exist');
}

function canMergeLeft(grid, row, col){
    if (col === 0) return false;

    const cell = grid[row][col];
    const left = grid[row][col - 1];

    if (cell.rowSpan === left.rowSpan){
        const anchor = grid[row][col - left.colSpan];
        if (anchor.el) return true;
    }

    return false;
}

function canMergeRight(grid, row, col){
    const rightCol = col + grid[row][col].colSpan;

    if (rightCol === grid[0].length){
        return false;
    } else {
        return canMergeLeft(grid, row, rightCol);
    }
}

function canMergeUp(grid, row, col){
    if (row === 0) return false;

    const cell = grid[row][col];
    const above = grid[row - 1][col];

    if (cell.colSpan === above.colSpan){
        const anchor = grid[row - above.rowSpan][col];
        if (anchor.el) return true;
    }

    return false;
}

function canMergeDown(grid, row, col){
    const belowRow = row + grid[row][col].rowSpan;

    if (belowRow === grid.length){
        return false;
    } else {
        return canMergeUp(grid, belowRow, col);
    }
}

function canInsertLeft(grid, col){
    if (col === 0) return true;  // We really don't need this.

    for (let row = 0; row < grid.length; row += grid[row][col].rowSpan){
        // If it's a virtual cell, we can't split it with a new column.
        if (!grid[row][col].el) return false;
    }

    return true;
}

function canInsertRight(grid, row, col){
    const rightCol = col + grid[row][col].colSpan;

    if (rightCol === grid[0].length){
        return true;
    } else {
        return canInsertLeft(grid, rightCol);
    }
}

function canInsertAbove(grid, row){
    if (row === 0) return true;

    for (let col = 0; col < grid[0].length; col += grid[row][col].colSpan){
        if (!grid[row][col].el) return false;
    }

    return true;
}

function canInsertBelow(grid, row, col){
    const belowRow = row + grid[row][col].rowSpan;

    if (belowRow === grid.length){
        return true;
    } else {
        return canInsertAbove(grid, belowRow);
    }

    return false;
}

/**
 * Returns an array of strings that represent rows in the grid.
 * Each cell has the form: rowspan,colspan,tagName. The tagName
 * is '--' if the cell is a virtual cell (from a rowspan or colspan).
 *
 * Example:
 *
 *   '2,2,TD 2,2,-- 1,1,TD'
 *   '2,2,-- 2,2,-- 1,1,TD'
 *   '1,1,TD 1,1,TD 1,1,TD'
 *
 */
export function logGrid(grid){
    const result = [];
    grid.forEach(row => {
        let line = [];
        row.forEach(cell => {
            const tagName = cell.el && cell.el.tagName ? cell.el.tagName : '--';
            line.push(`${cell.rowSpan},${cell.colSpan},${tagName}`);
        });
        result.push(line.join(' '));
    });
    return result;
}

function initializeTableMap(nRows, nCols){
    const grid = new Array(nRows);
    for (let i = 0; i < nRows; i++) {
        grid[i] = new Array(nCols);
        for (let j = 0; j < nCols; j++) {
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
            // Skip cells that were filled by rowspans from above.
            while (assertGrid(grid, row, col) && grid[row][col].rowSpan !== 0){
                col++;
            }

            assertGrid(grid, row, col);
            grid[row][col].el = cell;
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
function dimensions(tableEl) {
    const rows = Array.from(tableEl.rows);

    const nCols = rows.reduce((maxCols, row) => {
        const cols = Array.from(row.cells).reduce((rowCols, cell) => {
            return rowCols += cell.colSpan;
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
    assertGrid(grid, row, col);
    grid[row][col].el = cell;
    for (let i = 0; i < cell.rowSpan; i++){
        for (let j = 0; j < cell.colSpan; j++){
            assertGrid(grid, row + i, col + j);
            grid[row + i][col + j].rowSpan = cell.rowSpan;
            grid[row + i][col + j].colSpan = cell.colSpan;
        }
    }
}

function assertGrid(grid, row, col){
    // console.log(row, col);
    if (row >= grid.length || col >= grid[0].length){
        throw new Error(`Invalid grid operation: row=${row}, col=${col}`, grid);
    }
    return true;
}
