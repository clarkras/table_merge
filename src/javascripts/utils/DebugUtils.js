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
