import * as TableUtils from '../utils/TableUtils'

export function mergeUp(grid, targetEl){
    const [row, col] = TableUtils.findCell(grid, targetEl);

    // Find the origin of the cell above.
    const originRow = row - grid[row - 1][col].rowSpan;
    const origin = grid[originRow][col];

    console.log('origin', origin.el.textContent.trim());

    origin.rowSpan++;
    origin.el.rowSpan++;
    origin.el.innerHTML = targetEl.innerHTML;
    targetEl.parentElement.removeChild(targetEl);
    // TODO: clean(targetEl.parentElement);
    grid[row][col].el = null;
}

/**
 * Remove empty rows and columns.
 */
function clean(table){
    throw Error('todo');
}
