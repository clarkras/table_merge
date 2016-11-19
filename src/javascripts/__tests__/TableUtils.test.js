import * as TableUtils from '../utils/TableUtils'

describe('Utilities:TableUtils', () => {
    let tableEl;
    let grid;

    beforeEach(function(){
        this.addMatchers({
            toMatchWithoutWhitespace(str){
                const replaceRegExp = /\s{2,}/g;
                const expected = new RegExp(str.replace(replaceRegExp, ''));
                const actual = this.actual.replace(replaceRegExp, '');
                return expected.test(actual);
            },
        });
    });

    describe('no spans', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <tr>
                    <td>A1</td><td>A2</td><td>A3</td>
                </tr>
                <tr>
                    <td>B1</td><td>B2</td><td>B3</td>
                </tr>
            `;
            grid = TableUtils.createTableGrid(tableEl);
        });

        describe('target cell (0, 0)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#addRowBelow', () => {
                const row = document.createElement('tr');
                const cells = TableUtils.addRowBelow(grid, grid[0][0].el);
                cells.forEach(cell => row.appendChild(cell));

                expect(row.innerHTML).toMatchWithoutWhitespace(`
                    <td data-uuid="[a-h0-9]{32}"><br></td>
                    <td data-uuid="[a-h0-9]{32}"><br></td>
                    <td data-uuid="[a-h0-9]{32}"><br></td>
                `);
            });

            it('#mergeBelow', () => {
                TableUtils.mergeBelow(grid, grid[0][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td rowspan="2">A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#mergeRight', () => {
                TableUtils.mergeRight(grid, grid[0][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="2">A1</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });
        });

        describe('target cell (0, 1)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][1].el);

                expect(operations).toEqual({
                    mergeLeft: true,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#mergeLeft', () => {
                TableUtils.mergeLeft(grid, grid[0][1].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="2">A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#mergeRight', () => {
                TableUtils.mergeRight(grid, grid[0][1].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td colspan="2">A2</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#mergeBelow', () => {
                TableUtils.mergeBelow(grid, grid[0][1].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td rowspan="2">A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B3</td>
                    </tr>
                `);
            });
        });

        describe('target cell (1, 2)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[1][2].el);

                expect(operations).toEqual({
                    mergeLeft: true,
                    mergeRight: false,
                    mergeAbove: true,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#addRowBelow', () => {
                const cells = TableUtils.addRowBelow(grid, grid[1][2].el);
                const row = document.createElement('tr');
                cells.forEach(cell => row.appendChild(cell));

                expect(row.innerHTML).toMatchWithoutWhitespace(`
                    <td data-uuid="[a-h0-9]{32}"><br></td>
                    <td data-uuid="[a-h0-9]{32}"><br></td>
                    <td data-uuid="[a-h0-9]{32}"><br></td>
                `);
            });

            it('#mergeLeft', () => {
                TableUtils.mergeLeft(grid, grid[1][2].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>A2</td><td>A3</td></tr>
                    <tr>
                        <td>B1</td><td colspan="2">B3</td>
                    </tr>
                `);
            });

            it('#mergeAbove', () => {
                TableUtils.mergeAbove(grid, grid[1][2].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>A2</td><td rowspan="2">B3</td></tr>
                    <tr>
                        <td>B1</td><td>B2</td>
                    </tr>
                `);
            });
        });
    });

    describe('single colspan top left', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <tr>
                    <td colspan="2">A1, A2</td><td>A3</td>
                </tr>
                <tr>
                    <td>B1</td><td>B2</td><td>B3</td>
                </tr>
            `;
            grid = TableUtils.createTableGrid(tableEl);
        });

        describe('target cell (0, 0)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: true,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#mergeRight', () => {
                TableUtils.mergeRight(grid, grid[0][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="3">A1, A2</td></tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#unMerge', () => {
                TableUtils.unMerge(grid, grid[0][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1, A2</td> <td data-uuid="[a-h0-9]{32}"><br></td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#addRowBelow', () => {
                const row = document.createElement('tr');
                const cells = TableUtils.addRowBelow(grid, grid[0][0].el);
                cells.forEach(cell => row.appendChild(cell));

                expect(row.innerHTML).toMatchWithoutWhitespace(`
                    <td data-uuid="[a-h0-9]{32}" colspan="2"><br></td>
                    <td data-uuid="[a-h0-9]{32}"><br></td>
                `);
            });
        });

        describe('target cell (0, 2)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][2].el);

                expect(operations).toEqual({
                    mergeLeft: true,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#mergeLeft', () => {
                TableUtils.mergeLeft(grid, grid[0][2].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="3">A3</td></tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });
        });

        describe('target cell (1, 1)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[1][1].el);

                expect(operations).toEqual({
                    mergeLeft: true,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: false,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });
        });
    });

    describe('single colspan top right', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <tr>
                  <td>A1</td><td colspan="2">A2, A3</td>
                </tr>
                <tr>
                  <td>B1</td><td>B2</td><td>B3</td>
                </tr>
            `;
            grid = TableUtils.createTableGrid(tableEl);
        });

        describe('target cell (0, 0)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#mergeRight', () => {
                TableUtils.mergeRight(grid, grid[0][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="3">A1</td></tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });
        });

        describe('target cell (0, 1)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][1].el);

                expect(operations).toEqual({
                    mergeLeft: true,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: true,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#mergeLeft', () => {
                TableUtils.mergeLeft(grid, grid[0][1].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="3">A2, A3</td></tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#unMerge', () => {
                TableUtils.unMerge(grid, grid[0][1].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>A2, A3</td><td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#addRowBelow', () => {
                const row = document.createElement('tr');
                const cells = TableUtils.addRowBelow(grid, grid[0][1].el);
                cells.forEach(cell => row.appendChild(cell));

                expect(row.innerHTML).toMatchWithoutWhitespace(`
                    <td data-uuid="[a-h0-9]{32}"><br></td>
                    <td data-uuid="[a-h0-9]{32}" colspan="2"><br></td>
                `);
            });
        });

        describe('target cell (1, 1)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[1][1].el);

                expect(operations).toEqual({
                    mergeLeft: true,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: false,
                    insertAbove: true,
                    insertBelow: true,
                });
            });
        });

        describe('target cell (1, 2)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[1][2].el);

                expect(operations).toEqual({
                    mergeLeft: true,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: false,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });
        });
    });

    describe('single rowspan', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <tr>
                    <td rowspan="2">A1</td><td>A2</td><td>A3</td>
                </tr>
                <tr>
                    <td>B2</td><td>B3</td>
                </tr>
            `;
            grid = TableUtils.createTableGrid(tableEl);
        });

        describe('target cell (0, 0)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: true,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#unMerge', () => {
                TableUtils.unMerge(grid, grid[0][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });
        });

        describe('target cell (1, 1)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[1][1].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: true,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: false,
                    insertBelow: true,
                });
            });
        });
    });

    describe('rowspan above', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <tr>
                    <td rowspan="2">A1 B1</td><td>A2</td>
                </tr>
                <tr>
                    <td>B2</td>
                </tr>
                <tr>
                    <td>C1</td><td>C2</td>
                </tr>
            `;
            grid = TableUtils.createTableGrid(tableEl);
        });

        describe('target cell (2, 0)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[2][0].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: true,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#mergeAbove', () => {
                TableUtils.mergeAbove(grid, grid[2][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td rowspan="3">C1</td><td>A2</td>
                    </tr>
                    <tr>
                        <td>B2</td>
                    </tr>
                    <tr>
                        <td>C2</td>
                    </tr>
                `);
            });
        });
    });

    describe('colspan and rowspan', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <tr>
                    <td colspan="2" rowspan="2">A1, A2</td><td>A3</td>
                </tr>
                <tr>
                    <td>B3</td>
                </tr>
                <tr>
                    <td>C1</td><td>C2</td><td>C3</td>
                </tr>
            `;
            grid = TableUtils.createTableGrid(tableEl);
        });

        describe('target cell (0, 0)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][0].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: false,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: true,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#unMerge', () => {
                TableUtils.unMerge(grid, grid[0][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1, A2</td> <td data-uuid="[a-h0-9]{32}"><br></td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td> <td data-uuid="[a-h0-9]{32}">
                        <br></td><td>B3</td>
                    </tr>
                    <tr>
                        <td>C1</td><td>C2</td><td>C3</td>
                    </tr>
                `);
            });
        });

        describe('target cell (1, 2)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[1][2].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: false,
                    mergeAbove: true,
                    mergeBelow: true,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: false,
                    insertBelow: true,
                });
            });
        });

        describe('target cell (2, 0)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[2][0].el);

                expect(operations).toEqual({
                    mergeLeft: false,
                    mergeRight: true,
                    mergeAbove: false,
                    mergeBelow: false,
                    unMerge: false,
                    insertLeft: true,
                    insertRight: false,
                    insertAbove: true,
                    insertBelow: true,
                });
            });
        });
    });
});
