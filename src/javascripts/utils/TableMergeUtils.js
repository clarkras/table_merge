import * as TableUtils from '../utils/TableUtils'

export function mergeLeft(grid, sourceEl){
    const [row, col] = TableUtils.findCell(grid, sourceEl);
    const destCol = col - grid[row][col - 1].colSpan;
    const destEl = grid[row][destCol].el;

    sourceEl.colSpan += destEl.colSpan;
    destEl.outerHTML = sourceEl.outerHTML;

    const rowEl = sourceEl.parentElement;
    rowEl.removeChild(sourceEl);
}

export function mergeRight(grid, sourceEl){
    const [row, col] = TableUtils.findCell(grid, sourceEl);
    const destCol = col + grid[row][col].colSpan;
    const destEl = grid[row][destCol].el;

    sourceEl.colSpan += destEl.colSpan;

    const rowEl = destEl.parentElement;
    rowEl.removeChild(destEl);
}

export function mergeUp(grid, sourceEl){
    const [row, col] = TableUtils.findCell(grid, sourceEl);
    const destRow = row - grid[row - 1][col].rowSpan;
    const destEl = grid[destRow][col].el;

    sourceEl.rowSpan += destEl.rowSpan;
    destEl.outerHTML = sourceEl.outerHTML;
    const rowEl = sourceEl.parentElement;
    rowEl.removeChild(sourceEl);
    if (rowEl.children.length === 0){
        // This doesn't work because you have to adjust the rowSpan values
        // of the rows above.
        // rowEl.parentElement.removeChild(rowEl);
    }
    // TODO: clean(sourceEl.parentElement);
}

export function mergeDown(grid, sourceEl){
    const [row, col] = TableUtils.findCell(grid, sourceEl);
    const destRow = row + grid[row][col].rowSpan;
    const destEl = grid[destRow][col].el;

    sourceEl.rowSpan += destEl.rowSpan;
    const rowEl = destEl.parentElement;
    rowEl.removeChild(destEl);
    // todo: remove empty row.
}

export function unMerge(grid, sourceEl){
    const [row, col] = TableUtils.findCell(grid, sourceEl);
    const colSpan = sourceEl.colSpan;

    unMergeRow(sourceEl);

    let rowEl = sourceEl.parentElement;
    for (let i = 1; i < sourceEl.rowSpan; i++){
        rowEl = rowEl.nextElementSibling;
        const el = sourceEl.cloneNode(false);
        el.colSpan = colSpan;
        el.rowSpan = 1;
        const nextSibling = grid[row + i][col + colSpan].el;
        rowEl.insertBefore(el, nextSibling);
        unMergeRow(el);
    }

    sourceEl.rowSpan = 1;
}

function unMergeRow(sourceEl){
    for (let i = 1; i < sourceEl.colSpan; i++){
        const el = sourceEl.cloneNode(false);
        el.colSpan = 1;
        el.rowSpan = 1;
        sourceEl.parentElement.insertBefore(el, sourceEl.nextElementSibling);
    }

    sourceEl.colSpan = 1;
}

/**
 * Remove empty rows and columns.
 */
function clean(table){
    throw Error('todo');
}
