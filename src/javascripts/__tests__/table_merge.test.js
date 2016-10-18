import TableMerge from '../modules/table_merge'
import * as TableUtils from '../utils/TableUtils'

describe('buildTableMap', () => {
    let tableEl;

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
        });

        it('builds a map', () => {
            const grid = TableUtils.buildTableMap(tableEl);

            let log = TableUtils.logGrid(grid);
            assert.equal(log[0], '1,1,TD 1,1,TD 1,1,TD');
            assert.equal(log[1], '1,1,TD 1,1,TD 1,1,TD');
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
            assert.equal(log[0], '1,2,TD 1,1,-- 1,1,TD');
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
            assert.equal(log[1], '1,1,-- 1,1,TD 1,1,TD');
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
            assert.equal(log[0], '2,2,TD 2,1,-- 1,1,TD');
            assert.equal(log[1], '1,2,-- 1,1,-- 1,1,TD');
            assert.equal(log[2], '1,1,TD 1,1,TD 1,1,TD');
        });
    });
});

