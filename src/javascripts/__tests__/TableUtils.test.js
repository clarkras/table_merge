import * as TableUtils from '../utils/TableUtils'

function operationsToString(expected, actual){
    return `
        operation    expected, actual
        mergeLeft:   ${expected.mergeLeft}, ${actual.mergeLeft},
        mergeRight:  ${expected.mergeRight}, ${actual.mergeRight},
        mergeAbove:     ${expected.mergeAbove}, ${actual.mergeAbove},
        mergeBelow:   ${expected.mergeBelow}, ${actual.mergeBelow},
        unMerge:     ${expected.unMerge}, ${actual.unMerge},
        insertLeft:  ${expected.insertLeft}, ${actual.insertLeft},
        insertRight: ${expected.insertRight}, ${actual.insertRight},
        insertAbove: ${expected.insertAbove}, ${actual.insertAbove},
        insertBelow: ${expected.insertBelow}, ${actual.insertBelow},
    `;
}
// console.log(operationsToString(expected, operations));

describe('TableUtils', () => {
    let tableEl, grid;

    describe('no spans', () => {

        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = TABLE_HTML['no spans'];
            grid = TableUtils.buildTableMap(tableEl);
        });

        it('builds a map', () => {
            let log = TableUtils.logGrid(grid);

            expect(log[0]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
        });

        describe('target cell (0, 0)', () => {
            it('#operations(0, 0)', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#mergeBelow', () => {
                TableUtils.mergeBelow(grid, grid[0][0].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[2,1] TD[1,1] TD[1,1]');
                expect(log[1]).toBe('--[2,1] TD[1,1] TD[1,1]');
            });

            it('#mergeRight', () => {
                TableUtils.mergeRight(grid, grid[0][0].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,2] --[1,2] TD[1,1]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });
        });

        describe('target cell (0, 1)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][1].el);

                const expected = {
                    mergeLeft: true,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#mergeLeft', () => {
                TableUtils.mergeLeft(grid, grid[0][1].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,2] --[1,2] TD[1,1]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });

            it('#mergeRight', () => {
                TableUtils.mergeRight(grid, grid[0][1].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,1] TD[1,2] --[1,2]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });

            it('#mergeBelow', () => {
                TableUtils.mergeBelow(grid, grid[0][1].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,1] TD[2,1] TD[1,1]');
                expect(log[1]).toBe('TD[1,1] --[2,1] TD[1,1]');
            });
        });

        describe('target cell (1, 2)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[1][2].el);

                const expected = {
                    mergeLeft: true,
                    mergeRight: false,
                    mergeAbove: true,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#mergeLeft', () => {
                TableUtils.mergeLeft(grid, grid[1][2].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,1] TD[1,1] TD[1,1]');
                expect(log[1]).toBe('TD[1,1] TD[1,2] --[1,2]');
            });

            it('#mergeAbove', () => {
                TableUtils.mergeAbove(grid, grid[1][2].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,1] TD[1,1] TD[2,1]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] --[2,1]');
            });
        });
    });

    describe('single colspan top left', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = TABLE_HTML['single colspan top left'];
            grid = TableUtils.buildTableMap(tableEl);
        });

        it('builds a map', () => {
            let log = TableUtils.logGrid(grid);
            expect(log[0]).toBe('TD[1,2] --[1,2] TD[1,1]');
            expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
        });

        describe('target cell (0, 0)', () => {
            it('#operations(0, 0)', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: true,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#mergeRight', () => {
                TableUtils.mergeRight(grid, grid[0][0].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,3] --[1,3] --[1,3]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });

            it('#unMerge', () => {
                TableUtils.unMerge(grid, grid[0][0].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,1] TD[1,1] TD[1,1]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });
        });

        describe('target cell (0, 2)', () => {
            it('#operations(0, 2)', () => {
                const operations = TableUtils.operations(grid, grid[0][2].el);

                const expected = {
                    mergeLeft: true,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#mergeLeft', () => {
                TableUtils.mergeLeft(grid, grid[0][2].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,3] --[1,3] --[1,3]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });
        });

        describe('target cell (1, 1)', () => {
            it('#operations(1, 1)', () => {
                const operations = TableUtils.operations(grid, grid[1][1].el);

                const expected = {
                    mergeLeft: true,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: false,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });
        });
    });

    describe('single colspan top right', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = TABLE_HTML['single colspan top right'];
            grid = TableUtils.buildTableMap(tableEl);
        });

        it('builds a map', () => {
            let log = TableUtils.logGrid(grid);
            expect(log[0]).toBe('TD[1,1] TD[1,2] --[1,2]');
            expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
        });

        describe('target cell (0, 0)', () => {
            it('#operations(0, 0)', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#mergeRight', () => {
                TableUtils.mergeRight(grid, grid[0][0].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,3] --[1,3] --[1,3]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });
        });

        describe('target cell (0, 1)', () => {
            it('#operations(0, 1)', () => {
                const operations = TableUtils.operations(grid, grid[0][1].el);

                const expected = {
                    mergeLeft: true,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: true,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#mergeLeft', () => {
                TableUtils.mergeLeft(grid, grid[0][1].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,3] --[1,3] --[1,3]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });

            it('#unMerge', () => {
                TableUtils.unMerge(grid, grid[0][1].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,1] TD[1,1] TD[1,1]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });
        });

        describe('target cell (1, 1)', () => {
            it('#operations(1, 1)', () => {
                const operations = TableUtils.operations(grid, grid[1][1].el);

                const expected = {
                    mergeLeft: true,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: false,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });
        });

        describe('target cell (1, 2)', () => {
            it('#operations(1, 2)', () => {
                const operations = TableUtils.operations(grid, grid[1][2].el);

                const expected = {
                    mergeLeft: true,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: false,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });
        });
    });

    describe('single rowspan', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = TABLE_HTML['single rowspan'];
            grid = TableUtils.buildTableMap(tableEl);
        });

        it('builds a map', () => {
            let log = TableUtils.logGrid(grid);
            expect(log[0]).toBe('TD[2,1] TD[1,1] TD[1,1]');
            expect(log[1]).toBe('--[2,1] TD[1,1] TD[1,1]');
        });

        describe('target cell (0, 0)', () => {
            it('#operations(0, 0)', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: true,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#unMerge', () => {
                TableUtils.unMerge(grid, grid[0][0].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,1] TD[1,1] TD[1,1]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });
        });

        describe('target cell (1, 1)', () => {
            it('#operations(1, 1)', () => {
                const operations = TableUtils.operations(grid, grid[1][1].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: true,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: false,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });
        });
    });

    describe('rowspan above', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = TABLE_HTML['rowspan above'];
            grid = TableUtils.buildTableMap(tableEl);
        });

        it('builds a map', () => {
            let log = TableUtils.logGrid(grid);
            expect(log[0]).toBe('TD[2,1] TD[1,1]');
            expect(log[1]).toBe('--[2,1] TD[1,1]');
            expect(log[2]).toBe('TD[1,1] TD[1,1]');
        });

        describe('target cell (2, 0)', () => {
            it('#operations(2, 0)', () => {
                const operations = TableUtils.operations(grid, grid[2][0].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: true,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#mergeAbove', () => {
                TableUtils.mergeAbove(grid, grid[2][0].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[3,1] TD[1,1]');
                expect(log[1]).toBe('--[3,1] TD[1,1]');
                expect(log[2]).toBe('--[3,1] TD[1,1]');
            });
        });
    });

    describe('colspan and rowspan', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = TABLE_HTML['colspan and rowspan'];
            grid = TableUtils.buildTableMap(tableEl);
        });

        it('builds a map', () => {
            let log = TableUtils.logGrid(grid);
            expect(log[0]).toBe('TD[2,2] --[2,2] TD[1,1]');
            expect(log[1]).toBe('--[2,2] --[2,2] TD[1,1]');
            expect(log[2]).toBe('TD[1,1] TD[1,1] TD[1,1]');
        });

        describe('target cell (0, 0)', () => {
            it('#operations(0, 0)', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: true,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });

            it('#unMerge', () => {
                TableUtils.unMerge(grid, grid[0][0].el);

                let log = TableUtils.logGrid(TableUtils.buildTableMap(tableEl));

                expect(log[0]).toBe('TD[1,1] TD[1,1] TD[1,1]');
                expect(log[1]).toBe('TD[1,1] TD[1,1] TD[1,1]');
                expect(log[2]).toBe('TD[1,1] TD[1,1] TD[1,1]');
            });
        });

        describe('target cell (1, 2)', () => {
            it('#operations(1, 2)', () => {
                const operations = TableUtils.operations(grid, grid[1][2].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: false,
                    mergeAbove: true,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: false,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });
        });

        describe('target cell (2, 0)', () => {
            it('#operations(2, 0)', () => {
                const operations = TableUtils.operations(grid, grid[2][0].el);

                const expected = {
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: false,
                    insertAbove: true,
                    insertBelow: true,
                };

                expect(operations).toEqual(expected);
            });
        });
    });
});

const TABLE_HTML = {
    'no spans': `
        <tr>
            <td>A1</td> <td>A2</td> <td>A3</td>
        </tr>
        <tr>
            <td>B1</td> <td>B2</td> <td>B3</td>
        </tr>
    `,
    'single colspan top left': `
        <tr>
            <td colspan="2">A1, A2</td> <td>A3</td>
        </tr>
        <tr>
            <td>B1</td> <td>B2</td> <td>B3</td>
        </tr>
    `,
    'single colspan top right': `
        <tr>
          <td>A1</td><td colspan="2">A2, A3</td>
        </tr>
        <tr>
          <td>B1</td><td>B2</td><td>B3</td>
        </tr>
    `,
    'single rowspan': `
        <tr>
            <td rowspan="2">A1</td> <td>A2</td> <td>A3</td>
        </tr>
        <tr>
            <td>B2</td> <td>B3</td>
        </tr>
    `,
    'colspan and rowspan': `
        <tr>
            <td colspan="2" rowspan="2">A1, A2</td> <td>A3</td>
        </tr>
        <tr>
            <td>B3</td>
        </tr>
        <tr>
            <td>C1</td> <td>C2</td> <td>C3</td>
        </tr>
    `,
    'rowspan above': `
        <tr>
            <td rowspan="2">A1 B1</td> <td>A2</td>
        </tr>
        <tr>
            <td>B2</td>
        </tr>
        <tr>
            <td>C1</td> <td>C2</td>
        </tr>
    `,
};
