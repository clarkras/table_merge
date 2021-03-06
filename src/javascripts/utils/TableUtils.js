import * as DOMUtils from './DOMUtils';
import UUID from './UUID';
import * as XMLUtilities from './XMLUtilities';

/**
 * A collection of utilities for performing merge and insert operations on a table.
 *
 * A table element is represented by a "grid" data structure. The grid makes it easier to traverse
 * a table and query the possible cell operations. A table cell's rowspan and colspan
 * attributes complicate table operations because of "virtual" cells that do not have TD
 * or TH elements.
 *
 * A grid is a two-dimensional array of cell objects. Each cell object contains information
 * about the row and column span properties of each cell.
 *
 * A grid cell contains the following properties:
 *
 *     - rowSpan {number} The rowSpan.
 *     - colSpan {number} The colSpan.
 *     - rowOffset {number} The number of rows to the origin cell.
 *     - colOffset {number} The number of columns to the origin cell.
 *     - el {HTMLTableCellElement} The <TD> or <TH> element, or null if it's a virtual cell.
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
 * The first element is the column span origin cell, and the second element is a
 * virtual cell. Virtual cells have a null `el` value, and the same rowSpan and colSpan
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
 *     - deleteColumn
 *     - deleteRow
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
        insertLeft: true,
        insertRight: true,
        insertAbove: true,
        insertBelow: true,
    };
}

/**
 * Returns true if the specified table operation is applicable for the given context.
 *
 * @param {string} operation The table operation.
 * @param {object} The selection context.
 *
 * @return {boolean} True if the operation applies.
 */
export function isApplicable(operation, selectionContext){
    if (!app.isFeatureEnabled(ConfigurationModel.FEATURES.TABLE_CELL_MERGE)) return true;

    if (!selectionContext.singleNode) return false;

    let el = selectionContext.singleNode;

    if (el.matches('tr')) el = el.cells[0];

    if (!TABLE_CELL_TAG_NAMES.includes(el.tagName.toLowerCase())){
        el = el.parentElement;
    }

    if (TABLE_CELL_TAG_NAMES.includes(el.tagName.toLowerCase())){
        // TODO (Clark): If operation is a merge operation, use the section (thead, tbody, or
        // tfoot) instead of the table. This disallows merges across sections, which
        // aren't currently supported.
        const parentTable = DOMUtils.getParent(el, 'table');
        if (parentTable){
            const grid = createTableGrid(parentTable);
            const validOperations = operations(grid, el);
            return validOperations[operation];
        }
    }

    return false;
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
        const el = cloneCell(sourceEl);
        if (colSpan > 1) el.colSpan = colSpan;
        const nextSibling = gridAt(safeGrid, row + i, col + colSpan).el;
        rowEl.insertBefore(el, nextSibling);

        unMergeColumns(el);
    }

    sourceEl.removeAttribute('rowspan');
}

export function insertColumn(grid, sourceEl, direction){
    let [row, col] = findCell(grid, sourceEl);
    const insertLeft = direction === 'left';

    // If we're inserting at the start of a colspan, let's insert after the cell.
    if (!insertLeft) col += sourceEl.colSpan - 1;

    const tableRows = DOMUtils.getParent(sourceEl, 'table').rows;

    for (let row = 0; row < grid.length;){
        const rowEl = tableRows[row];
        const cell = gridAt(grid, row, col);

        const origin = findOrigin(grid, row, col, cell);
        if (insertLeft && cell.el){
            // It's a single column or start of a colspan.
            const newCell = cloneCell(cell.el);
            if (cell.rowSpan > 1) newCell.rowSpan = cell.rowSpan;
            rowEl.insertBefore(newCell, cell.el);
        } else if (!insertLeft && cell.colSpan === cell.colOffset + 1){
            // It's a single column or the end of a colspan.
            const newCell = cloneCell(origin.el);
            if (origin.rowSpan > 1) newCell.rowSpan = origin.rowSpan;
            rowEl.insertBefore(newCell, origin.el.nextElementSibling);
        } else {
            // We're in the middle of a colspan.
            origin.el.colSpan += 1;
        }

        row += cell.rowSpan;
    }
}

export function insertRow(grid, sourceEl, direction){
    let [row] = findCell(grid, sourceEl);
    const insertAbove = direction === 'above'; 

    // If we're inserting below a rowspan, use the bottom of the cell.
    if (!insertAbove) row += sourceEl.rowSpan - 1;

    const currentRow = sourceEl.parentElement;
    const newRow = currentRow.cloneNode();

    for (let col = 0; col < grid[0].length;){
        const cell = gridAt(grid, row, col);
        const origin = findOrigin(grid, row, col, cell);

        if ((insertAbove && cell.el) || (!insertAbove && cell.rowSpan === cell.rowOffset + 1)){
            const newCell = cloneCell(origin.el);
            if (cell.colSpan > 1) newCell.colSpan = cell.colSpan;
            newRow.appendChild(newCell);
        } else {
            // Extend the cell down by bumping the rowSpan.
            origin.el.rowSpan++;
        }

        col += cell.colSpan;
    }

    let insertionRow = currentRow;

    if (!insertAbove){
        // Find the row below, handling rowspans.
        for (let i = sourceEl.rowSpan; insertionRow && i > 0; i--){
            insertionRow = insertionRow.nextElementSibling;
        }
    }

    currentRow.parentElement.insertBefore(newRow, insertionRow);
}

export function deleteRow(grid, sourceEl){
    let [row, col] = findCell(grid, sourceEl);

    const gridRow = gridAt(grid, row);
    const rowEl = sourceEl.parentElement;

    // Get the next row element down. We need this if we encounter a non-virtual cell with a
    // rowSpan > 1. We copy the cell to the next row below and decrement the rowSpan value.
    // This could be null if we're deleting the last row, but if a cell has a rowSpan > 1,
    // the table is inconsistent.
    const nextRowEl = rowEl.parentElement.rows[rowEl.rowIndex + 1];

    for (let col = 0; col < gridRow.length;){
        const cell = gridRow[col];

        if (cell.rowSpan > 1) {
            if (cell.el){
                // We're at the top of a rowSpan; move the cell to the row below and set rowspan=1.

                if (row === grid.length) throw new Error('invalid rowSpan on last row');

                // Find the next cell below to the right. This can be null.
                const nextRowCell = grid[row + 1].find((cell, i) => i > col && cell.el);

                cell.el.rowSpan -= 1;
                if (cell.el.rowSpan === 1) cell.el.removeAttribute('rowspan');
                nextRowEl.insertBefore(cell.el, nextRowCell && nextRowCell.el || null);

            } else {
                // We're in the rowspan virtual space; shrink the cell vertically.
                const origin = findOrigin(grid, row, col, cell);
                origin.el.rowSpan--;
            }
        }

        col += cell.colSpan;
    }

    rowEl.parentElement.removeChild(rowEl);
}

export function deleteColumn(grid, sourceEl){
    let [row, col] = findCell(grid, sourceEl);
    const tableRows = DOMUtils.getParent(sourceEl, 'table').rows;

    for (let row = 0; row < grid.length;){
        const cell = grid[row][col];
        const rowEl = tableRows[row];

        if (cell.colSpan === 1){
            rowEl.removeChild(cell.el);
        } else {
            const origin = findOrigin(grid, row, col, cell);
            origin.el.colSpan--;
            if (origin.colSpan === 1) origin.el.removeAttribute('colspan');
        }

        row += cell.rowSpan;
    }
}

/**
 * Returns the origin cell of a virtual cell.
 */
function findOrigin(grid, row, col, cell = gridAt(grid, row, col)){
    if (cell.el) return cell;
    return gridAt(grid, row - cell.rowOffset, col - cell.colOffset);
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
    Array.from(tableEl.rows).forEach((rowEl, row) => {
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

    const maxWidth = Math.max(...rows.map(rowEl => {
        return Array.from(rowEl.cells).reduce((rowCols, cell) => {
            return rowCols + cell.colSpan;
        }, 0);
    }));

    return [rows.length, maxWidth];
}

/**
 * Extends a grid cell based on rowspan and colspan attributes.
 *
 * @param {Array.<Array<Object>>} grid The grid.
 * @param {number} row The current row.
 * @param {number} col The current column.
 * @param {HTMLTableCellElement} el The table cell element.
 */
function fillSpans(grid, row, col, el){
    for (let i = 0; i < el.rowSpan; i++){
        for (let j = 0; j < el.colSpan; j++){
            const cell = gridAt(grid, row + i, col + j);
            cell.colSpan = el.colSpan;
            cell.rowSpan = el.rowSpan;
            cell.rowOffset = i;
            cell.colOffset = j;
        }
    }
}

/**
 * Returns the grid element at [row][col] after validating that the `row` and `col` values exist
 * in the grid. Throws an error if they are not valid. Returns the row array if the column
 * argument is omitted.
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
        const el = cloneCell(sourceEl);
        const row = sourceEl.parentElement;

        row.insertBefore(row.ownerDocument.createTextNode(' '), sourceEl.nextElementSibling);
        row.insertBefore(el, sourceEl.nextElementSibling);
    }

    sourceEl.removeAttribute('colspan');
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

/**
 * Clones a table element and sets the new element's properties and content to default values.
 *
 * @param {HTMLTableCellElement} sourceEl The source element.
 * @return {HTMLTableCellElement} A new element.
 */
function cloneCell(sourceEl){
    const el = sourceEl.cloneNode(false /* deep */);

    XMLUtilities.setS9ID(el, UUID());
    el.innerHTML = DEFAULT_CELL_CONTENT_;
    el.removeAttribute('colspan');
    el.removeAttribute('rowspan');

    return el;
}

/**
 * The content used for newly inserted table cells.
 *
 * @type {string}
 */
const DEFAULT_CELL_CONTENT_ = '<br/>';

/**
 * The tag names of table cells.
 *
 * @type {string}
 */
export const TABLE_CELL_TAG_NAMES = ['td', 'th'];

/**
 * The tag names of table cells.
 *
 * @type {string}
 */
export const OPERATIONS = {
    MERGE_LEFT: 'mergeLeft',
    MERGE_RIGHT: 'mergeRight',
    MERGE_ABOVE: 'mergeAbove',
    MERGE_BELOW: 'mergeBelow',
    UNMERGE: 'unMerge',
    INSERT_LEFT: 'insertLeft',
    INSERT_RIGHT: 'insertRight',
    INSERT_ABOVE: 'insertAbove',
    INSERT_BELOW: 'insertBelow',
    DELETE_COLUMN: 'deleteColumn',
    DELETE_ROW: 'deleteRow',
};
