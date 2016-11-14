import UUID from './UUID';

/**
 * A collection of utilities for performing merge and insert operations on a table.
 *
 * A table element is represented by a "grid" data structure. A grid makes it easier to traverse
 * a table and query about cell operations. Rowspan and colspan attributes complicate table
 * operations by creating "virtual" that do not have TD or TH elements. A grid differs
 * from a table because all
 *
 * A grid is a two-dimensional array of cell objects. Each cell object contains information
 * about the row and column span properties of each cell.
 *
 *  {
 *      rowSpan {number} The rowSpan.
 *      colSpan {number} The colSpan.
 *      el {HTMLTableCellElement} The <TD> or <TH> element.
 *  }
 *
 * As an example, here is a row that has a 2-column span:
 *
 *      <tr><td colspan="2">Spans 2 columns</td><td>Spans 1 column</td></tr>
 *
 * The grid row would contain:
 *
 *      [
 *          {rowSpan: 1, colSpan: 2, el: HTMLTableCellElement},
 *          {rowSpan: 1, colSpan: 2, el: null},
 *          {rowSpan: 1, colSpan: 1, el: HTMLTableCellElement}
 *      ]
 *
 * The first element is the origin cell of the column span, and the second element is a
 * virtual cell. Virtual cells have a null el value, and the same rowSpan and colSpan
 * values as the origin cell.
 */

/**
 * Creates the grid.
 *
 * @param {HTMLTableElement} tableEl The table element.
 *
 * @returns {Array.<Array<Object>>} The grid.
 */
export function createTableGrid(tableEl){
    const [nRows, nCols] = dimensions(tableEl);
    const grid = initializeGrid(nRows, nCols);
    populateGrid(tableEl, grid, nRows, nCols);
    return grid;
}

/**
 * Returns an object that describes the operations that are possible on
 * a cell of a table. This is used to populate the edit menu.
 *
 * The operations object has these boolean properties:
 *
 *     - mergeLeft
 *     - mergeRight
 *     - mergeAbove
 *     - mergeBelow
 *     - insertLeft
 *     - insertRight
 *     - insertAbove
 *     - insertBelow
 *     - unMerge
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {HTMLTableCellElement} el The TD or TH element.
 * @returns {Object} Boolean properties describing the table operations for cell.
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
 * Finds the cell in a grid that contains the specified element. Returns the row and column as
 * a tuple.
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {HTMLTableCellElement} el The TD or TH element.
 *
 * @returns {[number, number]} A tuple containing the row index and column index.
 */
export function findCell(grid, el){
    for (let row = 0; row < grid.length; row++){
        for (let col = 0; col < grid[row].length; col++){
            if (grid[row][col].el === el) return [row, col];
        }
    }

    throw new Error('findCell: element does not exist');
}

/*
 * Merges a cell with the cell to the left.
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {HTMLTableCellElement} sourceEl The TD or TH element to be merged.
 */
export function mergeLeft(grid, sourceEl){
    const destEl = sourceEl.previousElementSibling;
    sourceEl.parentElement.removeChild(sourceEl);
    destEl.parentElement.replaceChild(sourceEl, destEl);
    sourceEl.colSpan += destEl.colSpan;
}

/*
 * Merges a cell with the cell to the right.
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {HTMLTableCellElement} sourceEl The TD or TH element to be merged.
 */
export function mergeRight(grid, sourceEl){
    const destEl = sourceEl.nextElementSibling;
    sourceEl.colSpan += destEl.colSpan;
    destEl.parentElement.removeChild(destEl);
}

/*
 * Merges a cell with the cell above.
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {HTMLTableCellElement} sourceEl The TD or TH element to be merged.
 */
export function mergeAbove(grid, sourceEl){
    const [row, col] = findCell(grid, sourceEl);
    const destRow = row - gridAt(grid, row - 1, col).rowSpan;
    const destEl = gridAt(grid, destRow, col).el;

    sourceEl.parentElement.removeChild(sourceEl);
    destEl.parentElement.replaceChild(sourceEl, destEl);
    sourceEl.rowSpan += destEl.rowSpan;
    // TODO (Clark): Do we want to check for an empty row and remove it?
}

/*
 * Merges a cell with the cell below.
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {HTMLTableCellElement} sourceEl The TD or TH element to be merged.
 */
export function mergeBelow(grid, sourceEl){
    const [row, col] = findCell(grid, sourceEl);
    const destRow = row + gridAt(grid, row, col).rowSpan;
    const destEl = gridAt(grid, destRow, col).el;

    sourceEl.rowSpan += destEl.rowSpan;
    const rowEl = destEl.parentElement;
    rowEl.removeChild(destEl);
    // TODO (Clark): Do we want to check for an empty row and remove it?
}

/*
 * Unmerges a cell.
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {HTMLTableCellElement} sourceEl The TD or TH element to be merged.
 */
export function unMerge(grid, sourceEl){
    const [row, col] = findCell(grid, sourceEl);
    const colSpan = sourceEl.colSpan;

    // Unmerge the cell horizontally.
    unMergeColumns(sourceEl);

    // Add an extra "safety" column to handle colSpans that go to the end of the row.
    const safeGrid = grid.map(row => row.concat({el: null}));

    for (let i = 1, rowEl = sourceEl.parentElement; i < sourceEl.rowSpan; i++){
        // Get the next row.
        rowEl = rowEl.nextElementSibling;

        // Create and insert a new cell.
        const el = sourceEl.cloneNode(false);
        el.colSpan = colSpan;
        el.rowSpan = 1;
        const nextSibling = gridAt(safeGrid, row + i, col + colSpan).el;
        rowEl.insertBefore(el, nextSibling);

        unMergeColumns(el);
    }

    sourceEl.rowSpan = 1;
}

/**
 * Creates an empty grid of nRows x nCols.
 */
function initializeGrid(nRows, nCols){
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

/**
 * Populates a grid's cells from a table element.
 */
function populateGrid(tableEl, grid, nRows, nCols){
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
 * Returns the dimensions of a table as a tuple, accounting for virtual cells that have been
 * merged by [rowspan] or [colspan] attributes from their neighbors.
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
 * @param {Array.<Array<Object>>} grid The grid.
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
 * Returns the grid element at [row][col] after validating that the `row` and `col` values exist
 * in the grid. Throws an error if they are not valid.
 * Returns the row array if the column argument is omitted.
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {number} row The row index.
 * @param {number} col (Optional) The column index.
 *
 * @return {Object} The grid element, or {Array.<Object>} the row array.
 */
function gridAt(grid, row, col = null){
    if (row >= grid.length || col !== null && col >= grid[row].length){
        throw new Error(`Invalid grid operation at (${row}, ${col}) in table #${grid.tableID}`);
    }

    if (col === null) return grid[row];
    return grid[row][col];
}

/**
 * Unmerges cells with colSpan > 1.
 */
function unMergeColumns(sourceEl){
    for (let i = 1; i < sourceEl.colSpan; i++){
        const el = sourceEl.cloneNode(false);

        // Generate a new UUID, because cloneNode clones the data-uuid.
        el.dataset.uuid = UUID();

        // TODO (Clark): Do we want to clone the node or use DEFAULT_CELL_CONTENT?
        // The ToolbarTableCommandCapability#addTableColumn_ method simply sets the innerHTML:
        // el.innerHTML =  ToolbarTableCommandCapability.DEFAULT_CELL_CONTENT_;

        el.colSpan = 1;
        el.rowSpan = 1;
        sourceEl.parentElement.insertBefore(el, sourceEl.nextElementSibling);
    }

    sourceEl.colSpan = 1;
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
    if (col === 0) return true;

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
