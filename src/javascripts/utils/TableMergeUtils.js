import * as TableUtils from '../utils/TableUtils'

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

export function mergeUp(grid, sourceEl){
    const [row, col] = TableUtils.findCell(grid, sourceEl);
    const destRow = row - grid[row - 1][col].rowSpan;
    const destEl = grid[destRow][col].el;

    sourceEl.parentElement.removeChild(sourceEl);
    destEl.parentElement.replaceChild(sourceEl, destEl);
    sourceEl.rowSpan += destEl.rowSpan;
    // TODO: Remove empty row.
}

export function mergeDown(grid, sourceEl){
    const [row, col] = TableUtils.findCell(grid, sourceEl);
    const destRow = row + grid[row][col].rowSpan;
    const destEl = grid[destRow][col].el;

    sourceEl.rowSpan += destEl.rowSpan;
    const rowEl = destEl.parentElement;
    rowEl.removeChild(destEl);
    // TODO: Remove empty row.
}

export function unMerge(grid, sourceEl){
    const [row, col] = TableUtils.findCell(grid, sourceEl);
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
        const nextSibling = safeGrid[row + i][col + colSpan].el;
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
        el.colSpan = 1;
        el.rowSpan = 1;
        sourceEl.parentElement.insertBefore(el, sourceEl.nextElementSibling);
    }

    sourceEl.colSpan = 1;
}
