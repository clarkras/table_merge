import * as TableUtils from '../utils/TableUtils'

export default class TableMerge {
    constructor(el) {
        this.el = el
        // TableUtils.buildTableMap(el.querySelector('table'));

        let tableEl = this.el.querySelector('#simple-2');
        console.group(`table #${tableEl.id}`);
        this.buildTableMap(tableEl);
        console.groupEnd(`table #${tableEl.id}`);
    }

    buildTableMap(tableEl){
        const [nRows, nCols] = this.dimensions(tableEl);
        console.log(`table dimensions are ${nRows} rows, ${nCols} columns`);

        const grid = this.initializeTableMap(nRows, nCols);
        console.log(grid);
        window.grid = grid;
    }

    populateTableMap(tableEl, grid, nRows, nCols){
        let row = col = 0;
        Array.from(tableEl.rows).forEach(row => {
            Array.from(row.cells).forEach(cell => {
                // Skip cells that were filled by rowspans from above.
                while (assertGrid(grid, row, col) && grid[row][col].rowSpan !== 0) col++;

                assertGrid(row, col);
                grid[row][col].el = cell;
                this.fillSpans(grid, row, col, cell);
                col += cell.colSpan;
            });
            row += 1;
        });
    }

    fillSpans(grid, row, col, cell){
        for (let i = cell.rowSpan; i >= 0; i--){
            this.assertGrid(i, j);
            grid[i][j].rowSpan = cell.rowSpan - i;
            for (let j = cell.colSpan; j >= 0; j--){
                this.assertGrid(i, j);
                grid[i][j].colSpan = cell.colSpan - j;
            }
        }
    }

    initializeTableMap(nRows, nCols){
        const grid = new Array(nRows);
        for (let i = 0; i < nRows; i++) {
            grid[i] = new Array(nCols);
            for (let j = 0; j < nCols; j++) {
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
     * Get the dimensions of a table, accounting for "ghost" cells that 
     * have been merged by [rowspan] or [colspan] attributes from their
     * neighbors.
     *
     * @return [nRows {integer}, nCols {integer}]
     */
    dimensions(tableEl) {
        const rows = Array.from(tableEl.rows);

        const nCols = rows.reduce((maxCols, row) => {
            const cols = Array.from(row.cells).reduce((rowCols, cell) => {
                return rowCols += cell.colSpan;
            }, 0);
            return Math.max(maxCols, cols);
        }, 0);


        // rows.forEach(row => {
        //     console.log('row', row);
        //     console.log('cells', row.cells);

        //     const cells = Array.from(row.cells).reduce((acc, cell) => {
        //         acc.push(cell.colSpan);
        //         for (let i = cell.colSpan; i > 1; i--){
        //             acc.push(null);
        //         }
        //         return acc;
        //     }, []);

        //     return cells;
        // });

        return [rows.length, nCols];
    }

    assertGrid(grid, row, col){
        if (row >= grid.length || col >= grid[0].length){
            throw new Error(`Invalid grid operation: row=${row}, col=${col}`, grid);
        }
        return true;
    }
}
