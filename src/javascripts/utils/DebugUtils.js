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
    return grid.map((row) => {
        return row.map((cell) => {
            const tagName = cell.el && cell.el.tagName ? cell.el.tagName : '--';
            return `${tagName}[${cell.rowSpan},${cell.colSpan}]`;
        }).join(' ');
    });
}

