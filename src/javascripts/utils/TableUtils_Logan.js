import * as DOMUtils from './DOMUtils';

const removeLine = (vertical) => cell => {
    const axis = vertical ? 'x' : 'y';
    const span = vertical ? 'colSpan' : 'rowSpan';

    const table = DOMUtils.getParent(cell, 'table');
    const groupRoot = DOMUtils.getParent(cell, 'table, thead, tbody, tfoot');
    const {rowGroups, columnGroups} = buildTableMap(table);

    const cellTable = rowGroups.get(groupRoot);
    const cellInfo = _.flattenDeep(cellTable).find(info => info.cell === cell);

    _.flattenDeep(Array.from(rowGroups.values()))
            .filter(info => info[axis] === cellInfo[axis])
            .map(info => info.cell)
            .forEach(node => {
                node[span] -= 1;

                if (node[span] < 1) node.remove();
            });
};
export const removeColumn = removeLine(true /* vertical */);
export const removeRow = removeLine(false /* vertical */);

const addLine = (vertical) => (cell, before = false) => {
    const axis = vertical ? 'x' : 'y';
    const span = vertical ? 'colSpan' : 'rowSpan';

    const table = DOMUtils.getParent(cell, 'table');
    const groupRoot = DOMUtils.getParent(cell, 'table, thead, tbody, tfoot');
    const {rowGroups, columnGroups} = buildTableMap(table);

    const cellTable = rowGroups.get(groupRoot);
    const cellInfo = _.flattenDeep(cellTable).find(info => info.cell === cell);

    _.flattenDeep(Array.from(rowGroups.values()))
            .filter(info => info[axis] === cellInfo[axis])
            .forEach(info => {
                const edge = before ? info.axis[axis].first : info.axis[axis].last;

                if (edge){
                    info.cell.parentNode.insertBefore(info.cell.cloneNode(false /* deep */),
                            before ? info.cell : info.cell.nextSibling);
                } else {
                    info.cell[span] += 1;
                }
            });
}
export const addColumn = addLine(true /* vertical */);
export const addRow = addLine(false /* vertical */);

const mergeLeft = cell => {
    const table = DOMUtils.getParent(cell, 'table');
    const groupRoot = DOMUtils.getParent(cell, 'table, thead, tbody, tfoot');
    const {rowGroups, columnGroups} = buildTableMap(table);


}


export function buildTableMap(table){
    if (table.tagName.toLowerCase() !== 'table') throw new Error('Expected a table');

    const children = getElementChildren(table);
    const captions = children.filter(child => matchElement(child, 'caption'));
    const colGroups = children.filter(child => matchElement(child, 'colgroup, col'));

    const tHeads = children.filter(child => matchElement(child, 'thead, tfoot, tbody, tr'));




    const tBodys = children.filter(child => matchElement(child, 'tbody'));
    const trs = children.filter(child => matchElement(child, 'tr'));
    const tFoots = children.filter(child => matchElement(child, 'tfoot'));

    // We don't support operating on tables with colgroups.
    if (colGroups.length > 0) return null;

    // Tables are required to have either trs or tbodys, but not both.
    if (tBodys.length > 0 && trs.length > 0) return null;


    const columnGroups = buildColumnData(colGroups);

    // Pull together an array of <tr> arrays as the top-level mergable groups.
    const rowGroups = new Map([
        [table, trs.length === 0 ? null : trs],
        ...tHeads.map(thead => [thead, getElementChildren(thead)]),
        ...tBodys.map(thead => [thead, getElementChildren(thead)]),
        ...tFoots.map(thead => [thead, getElementChildren(thead)]),
    ].filter(pair => !!pair[1]).map(([root, rowGroup]) => buildCellTable(rowGroup)));

    rowGroups.forEach(([pair, cellTable]) => validateCellData(cellTable));

    return {
        rowGroups,
        columnGroups,
    };
}

/**
 * Given a list of TRs, make a table of the the cells at each location.
 *
 * @param {Array.<HTMLTableCellElement>} rows
 *
 * @return {Array.<Array.<Array<HTMLTableCellElement>>>}
 */
function buildCellTable(rows){
    const cellTable = rows
            .map(row => getElementChildren(row))
            // Map the cells to their coordinate metadata.
            .reduce((acc, row, y) => acc.concat(row.map((cell, x) => ({
                cell,
                x,
                y,
            }))), [])
            // Convert the cell coordinate data into a 3D array.
            .reduce((data, info) => {
                // Find the first empty cell on the row.
                let baseX = info.x;
                while (data[info.y] && data[info.y][baseX]) baseX++;

                // Mark every cell based on this row and column span.
                for (let i = 0; i < info.cell.colSpan; i++){
                    for (let j = 0; j < info.cell.rowSpan; j++){
                        const y = info.y + i;
                        const x = baseX + j;

                        data[y] = data[y] || [];
                        data[y][x] = data[y][x] || [];

                        // Each cell in the table lists all overlapping cells.
                        data[y][x].push({
                            cell: info.cell,
                            x,
                            y,
                            axis: {
                                x: {
                                    first: i === 0,
                                    last: i === info.colSpan - 1,
                                },
                                y: {
                                    first: i === 0,
                                    last: i === info.rowSpan - 1,
                                }
                            },
                        });
                    }
                }

                return data;
            }, []);

    return cloneWithoutHoles(cellTable);
}

/**
 * @param {Array.<HTMLTableColElement>} columns
 */
function buildColumnData(columns){
    return columns
            // Flatten the list to just things with span values.
            .reduce((acc, col) => {
                if (col.tagName.toLowerCase() === 'colgroup' && !col.hasAttribute('span')){
                    return acc.concat(getElementChildren(col));
                } else {
                    return acc.concat([col]);
                }
            }, [])
            // Convert the spans into an indexed list based on x coordinate.
            .reduce((acc, col) => {
                for (let i = 0; i < col.span; i++){
                    acc.push({
                        col,
                        x: acc.length,
                    });
                }

                return acc;
            }, []);
}

function cloneWithoutHoles(cellTable){
    // Duplicate the array so we don't have any holes in our arrays.
    return cellTable.map(row => {
        const width = row.reduce((acc, row) => Math.max(acc, row.length), 0);
        const height = row.length;

        const data = Array(height);
        for (let i = 0; i < height; i++){
            data[i] = Array(width);

            for (let j = 0; j < width; j++){
                data[i][j] = row[i][j] || null;
            }
        }
        return data;
    });
}

/**
 *
 */
function getIntegerAttribute(el, attr){
    const value = el.hasAttribute(attr) ? parseInt(el.getAttribute(attr), 10) : null;

    return (Number.isNaN(value) || value === null) ? 1 : value;
}

/**
 *
 */
function matchElement(el, tag){
    return el.nodeType === Node.ELEMENT_NODE && el.matches(tag);
}

/**
 *
 */
function getElementChildren(node){
    const children = Array.from(node.childNodes);
    if (children.some(node => node.nodeType === Element.TEXT_NODE &&
            !DOMUtils.isWhitespaceNode(node))){
        throw new Error('Row has non-whitespace text children.');
    }

    return children.filter(child => child.nodeType === Node.ELEMENT_NODE);
}


/**
 *
 */
function validateCellData(rows){
    rows.forEach((row, y) => {
        row.forEach((item, x) => {
            if (!item) throw new Error(`Missing cell at row ${y} column ${x}`);
            else if (item.length > 1) throw new Error(`Overlapping cells at row ${y} column ${x}`);
        });
    });
}

export const CELL_OPERATIONS = {
    ADD_ROW_ABOVE: Symbol('add row above'),
    ADD_ROW_BELOW: Symbol('add row below'),
    ADD_COLUMN_LEFT: Symbol('add column left'),
    ADD_COLUMN_RIGHT: Symbol('add column right'),
    REMOVE_ROW: Symbol('remove row'),
    REMOVE_COLUMN: Symbol('remove column'),

    MERGE_LEFT: Symbol('merge left'),
    MERGE_RIGHT: Symbol('merge right'),
    MERGE_UP: Symbol('merge up'),
    MERGE_DOWN: Symbol('merge down'),
};
