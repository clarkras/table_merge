import * as TableUtils from '../utils/TableUtils'

export function mergeUp(grid, cell){
    const [row, col] = TableUtils.findCell(grid, cell);

    // Find the origin of the cell above.
    let origin; 
    for (let i = row - 1; i >= 0; i--){
        origin = grid[i][col];
        if (origin.el) break;
    }

    console.log('origin', origin.el.textContent);

    origin.rowSpan++;
    origin.el.rowSpan++;
    origin.el.innerHTML = cell.innerHTML;
    cell.parentElement.removeChild(cell);
    grid[row][col].el = null;
}
