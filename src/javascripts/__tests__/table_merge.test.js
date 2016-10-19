import TableMerge from '../modules/table_merge'
import * as TableUtils from '../utils/TableUtils'

describe('TableUtils', () => {
    let tableEl, grid;

    describe('no spans', () => {

        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <tr>
                    <td>A1</td>
                    <td>A2</td>
                    <td>A3</td>
                </tr>
                <tr>
                    <td>B1</td>
                    <td>B2</td>
                    <td>B3</td>
                </tr>
            `;

            grid = TableUtils.buildTableMap(tableEl);
        });

        it('builds a map', () => {
            let log = TableUtils.logGrid(grid);

            assert.equal(log[0], '1,1,TD 1,1,TD 1,1,TD');
            assert.equal(log[1], '1,1,TD 1,1,TD 1,1,TD');
        });

        it('#operations(0, 0)', () => {
            const operations = TableUtils.operations(grid, grid[0][0].el);

            const expected = {
                mergeLeft: false,
                mergeRight: true,
                mergeUp: false,
            };

            assert.deepEqual(operations, expected);
        });

        it('#operations(0, 1)', () => {
            const operations = TableUtils.operations(grid, grid[0][1].el);

            const expected = {
                mergeLeft: true,
                mergeRight: true,
                mergeUp: false,
            };

            assert.deepEqual(operations, expected);
        });

        it('#operations(1, 2)', () => {
            const operations = TableUtils.operations(grid, grid[1][2].el);

            const expected = {
                mergeLeft: true,
                mergeRight: false,
                mergeUp: true,
            };

            assert.deepEqual(operations, expected);
        });
    });

    describe('single colspan', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                    <tr>
                      <td colspan="2">A1</td>
                      <td>A3</td>
                    </tr>
                    <tr>
                      <td>B1</td>
                      <td>B2</td>
                      <td>B3</td>
                    </tr>
                `;
        });

        it('builds a map', () => {
            const grid = TableUtils.buildTableMap(tableEl);

            let log = TableUtils.logGrid(grid);
            assert.equal(log[0], '1,2,TD 1,2,-- 1,1,TD');
            assert.equal(log[1], '1,1,TD 1,1,TD 1,1,TD');
        });
    });

    describe('single rowspan', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                    <tr>
                      <td rowspan="2">A1</td>
                      <td>A2</td>
                      <td>A3</td>
                    </tr>
                    <tr>
                      <td>B2</td>
                      <td>B3</td>
                    </tr>
                `;
        });

        it('builds a map', () => {
            const grid = TableUtils.buildTableMap(tableEl);

            let log = TableUtils.logGrid(grid);
            assert.equal(log[0], '2,1,TD 1,1,TD 1,1,TD');
            assert.equal(log[1], '2,1,-- 1,1,TD 1,1,TD');
        });
    });

    describe('colspan and rowspan', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <tr>
                      <td colspan="2" rowspan="2">A1</td>
                      <td>A3</td>
                    </tr>
                    <tr>
                      <td>B3</td>
                    </tr>
                    <tr>
                      <td>C1</td>
                      <td>C2</td>
                      <td>C3</td>
                    </tr>
                `;
        });

        it('builds a map', () => {
            const grid = TableUtils.buildTableMap(tableEl);

            let log = TableUtils.logGrid(grid);
            log.forEach(line => console.log(line));
            assert.equal(log[0], '2,2,TD 2,2,-- 1,1,TD');
            assert.equal(log[1], '2,2,-- 2,2,-- 1,1,TD');
            assert.equal(log[2], '1,1,TD 1,1,TD 1,1,TD');
        });
    });
});
