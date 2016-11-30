import * as TableUtils from '../utils/TableUtils'

describe('Utilities:TableUtils', () => {
    let tableEl;
    let grid;

    beforeEach(function(){
        this.addMatchers({
            toMatchWithoutWhitespace(str){
                const replaceRegExp = /\s{2,}/g;
                str = `^${str.replace(replaceRegExp, '')}$`;
                const expected = new RegExp(str);
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

            it('#insertAbove', () => {
                TableUtils.insertRow(grid, grid[0][0].el, 'above');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[0][0].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#insertRight', () => {
                TableUtils.insertColumn(grid, grid[0][0].el, 'right');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td data-uuid="[a-h0-9]{32}"><br></td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td data-uuid="[a-h0-9]{32}"><br></td><td>B2</td><td>B3</td>
                    </tr>
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

            it('#insertAbove', () => {
                TableUtils.insertRow(grid, grid[1][2].el, 'above');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[1][2].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                `);
            });

            it('#insertRight', () => {
                TableUtils.insertColumn(grid, grid[1][2].el, 'right');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>A2</td><td>A3</td><td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td><td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
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

            it('#insertRight', () => {
                TableUtils.insertColumn(grid, grid[0][0].el, 'right');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="2">A1, A2</td><td data-uuid="[a-h0-9]{32}"><br></td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td data-uuid="[a-h0-9]{32}"><br></td><td>B3</td>
                    </tr>
                `);
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

            it('#insertAbove', () => {
                TableUtils.insertRow(grid, grid[0][0].el, 'above');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td data-uuid="[a-h0-9]{32}" colspan="2"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td colspan="2">A1, A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[0][0].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="2">A1, A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}" colspan="2"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
            });
        });

        describe('target cell (1, 0)', () => {
            it('#insertRight', () => {
                TableUtils.insertColumn(grid, grid[1][0].el, 'right');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="3">A1, A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td data-uuid="[a-h0-9]{32}"><br></td><td>B2</td><td>B3</td>
                    </tr>
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
                    insertLeft: true,
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#insertRight', () => {
                TableUtils.insertColumn(grid, grid[1][1].el, 'right');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="2">A1, A2</td><td data-uuid="[a-h0-9]{32}"><br></td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td data-uuid="[a-h0-9]{32}"><br></td><td>B3</td>
                    </tr>
                `);
            });

            it('#insertAbove', () => {
                TableUtils.insertRow(grid, grid[1][1].el, 'above');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="2">A1, A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
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

            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[0][1].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                      <td>A1</td><td colspan="2">A2, A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}" colspan="2"><br></td>
                    </tr>
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
                    insertLeft: true,
                    insertRight: true,
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
                    insertLeft: true,
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

            it('#deleteRow', () => {
                TableUtils.deleteRow(grid, grid[0][0].el);

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td>A1</td><td>B2</td><td>B3</td>
                    </tr>
                `);
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

        describe('target cell (0, 1)', () => {
            it('#operations', () => {
                const operations = TableUtils.operations(grid, grid[0][1].el);

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

            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[0][1].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td rowspan="3">A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B2</td><td>B3</td>
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
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#insertAbove', () => {
                TableUtils.insertRow(grid, grid[1][1].el, 'above');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td rowspan="3">A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B2</td><td>B3</td>
                    </tr>
                `);
            });

            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[1][1].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td rowspan="2">A1</td><td>A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B2</td><td>B3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                `);
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

        describe('target cell (0, 0)', () => {
            it('#insertRight', () => {
                TableUtils.insertColumn(grid, grid[0][0].el, 'right');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td rowspan="2">A1 B1</td><td data-uuid="[a-h0-9]{32}" rowspan="2"><br></td><td>A2</td>
                    </tr>
                    <tr>
                        <td>B2</td>
                    </tr>
                    <tr>
                        <td>C1</td><td data-uuid="[a-h0-9]{32}"><br></td><td>C2</td>
                    </tr>
                `);
            });

            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[0][0].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td rowspan="2">A1 B1</td><td>A2</td>
                    </tr>
                    <tr>
                        <td>B2</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>C1</td><td>C2</td>
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

            it('#insertBelow', () => {
                const row = document.createElement('tr');
                TableUtils.insertRow(grid, grid[0][0].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="2" rowspan="2">A1, A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}" colspan="2"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>C1</td><td>C2</td><td>C3</td>
                    </tr>
                `);
            });
        });

        describe('target cell (0, 2)', () => {
            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[0][2].el, 'below');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="2" rowspan="3">A1, A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td>B3</td>
                    </tr>
                    <tr>
                        <td>C1</td><td>C2</td><td>C3</td>
                    </tr>
                `);
            });

            it('#insertAbove', () => {
                TableUtils.insertRow(grid, grid[0][2].el, 'above');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td data-uuid="[a-h0-9]{32}" colspan="2"><br></td>
                        <td data-uuid="[a-h0-9]{32}"><br></td>
                    </tr>
                    <tr>
                        <td colspan="2" rowspan="2">A1, A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B3</td>
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
                    insertAbove: true,
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
                    insertRight: true,
                    insertAbove: true,
                    insertBelow: true,
                });
            });

            it('#insertRight', () => {
                TableUtils.insertColumn(grid, grid[2][0].el, 'right');

                expect(tableEl.tBodies[0].innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="3" rowspan="2">A1, A2</td><td>A3</td>
                    </tr>
                    <tr>
                        <td>B3</td>
                    </tr>
                    <tr>
                        <td>C1</td><td data-uuid="[a-h0-9]{32}"><br></td><td>C2</td><td>C3</td>
                    </tr>
                `);
            });

        });
    });

    describe('header and footer', () => {
        beforeEach(() => {
            tableEl = document.createElement('table');
            tableEl.innerHTML = `
                <thead>
                    <tr>
                        <td colspan="3">Header</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>A1</td>
                        <td>A2</td>
                        <td>A2</td>
                    </tr>
                    <tr>
                        <td>B1</td>
                        <td>B2</td>
                        <td>B2</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">Footer</td>
                    </tr>
                </tfoot>
            `;
            grid = TableUtils.createTableGrid(tableEl);
        });

        describe('thead - target cell (0, 0)', () => {
            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[0][0].el, 'below');

                expect(tableEl.tHead.innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="3">Header</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}" colspan="3"><br></td>
                    </tr>
                `);
            });

            it('#insertAbove', () => {
                TableUtils.insertRow(grid, grid[0][0].el, 'above');

                expect(tableEl.tHead.innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td data-uuid="[a-h0-9]{32}" colspan="3"><br></td>
                    </tr>
                    <tr>
                        <td colspan="3">Header</td>
                    </tr>
                `);
            });
        });

        describe('tfoot - target cell (0, 3)', () => {
            it('#insertBelow', () => {
                TableUtils.insertRow(grid, grid[3][0].el, 'below');

                expect(tableEl.tFoot.innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td colspan="3">Footer</td>
                    </tr>
                    <tr>
                        <td data-uuid="[a-h0-9]{32}" colspan="3"><br></td>
                    </tr>
                `);
            });

            it('#insertAbove', () => {
                TableUtils.insertRow(grid, grid[3][0].el, 'above');

                expect(tableEl.tFoot.innerHTML).toMatchWithoutWhitespace(`
                    <tr>
                        <td data-uuid="[a-h0-9]{32}" colspan="3"><br></td>
                    </tr>
                    <tr>
                        <td colspan="3">Footer</td>
                    </tr>
                `);
            });
        });

    });
});
