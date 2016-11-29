/**
 * Logs table details to the console.
 */
export function dumpTable(tableEl){
    console.log(`${tableEl.tagName} #${tableEl.id}`);
    console.log(tableEl);
    console.dir(tableEl);
    [...tableEl.children].forEach(el => {
        if (el.matches('caption')){
            console.log(`${el.tagName} "${el.textContent}"`);
        } else if (el.matches('tbody, thead, tfoot')){
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
            return `${tagName}[${cell.rowSpan},${cell.colSpan},${cell.rowOffset},${cell.colOffset}]`;
        }).join(' ');
    });
}

export function operationsToString(expected, actual){
    // Use this:
    // console.log(operationsToString(expected, operations));
    return `
        operation    expected, actual
        mergeLeft:   ${expected.mergeLeft},   ${actual.mergeLeft},
        mergeRight:  ${expected.mergeRight},  ${actual.mergeRight},
        mergeAbove:  ${expected.mergeAbove},  ${actual.mergeAbove},
        mergeBelow:  ${expected.mergeBelow},  ${actual.mergeBelow},
        unMerge:     ${expected.unMerge},     ${actual.unMerge},
        insertLeft:  ${expected.insertLeft},  ${actual.insertLeft},
        insertRight: ${expected.insertRight}, ${actual.insertRight},
        insertAbove: ${expected.insertAbove}, ${actual.insertAbove},
        insertBelow: ${expected.insertBelow}, ${actual.insertBelow},
    `;
}

