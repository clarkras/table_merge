// The purpose of this file is to learn about the DOM API for tables.
describe('tables', () => {
    let container;
    let table;

    beforeEach(() => {
        container = document.body.querySelector('#container');
        if (container){
            container.innerHTML = '';
        } else {
            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);
        }
        table = document.createElement('table');
    });

    describe('basic table with 2 rows and 2 columns', () => {
        beforeEach(() => {
            table.innerHTML = `
                <tr>
                    <td>AAA</td>
                    <td>BBB</td>
                </tr>
                <tr>
                    <td>CCC</td>
                    <td>DDD</td>
                </tr>
            `
            document.querySelector('#container').appendChild(table);
        });

        it('is an HTMLTableElement instance', () => {
            expect(table instanceof HTMLTableElement);
        });

        it('table.rows is an HTMLCollection instance with 2 rows', () => {
            expect(table.rows instanceof HTMLCollection);
            expect(table.rows.length).toBe(2);
        });

        it('each row is an HTMLTableRowElement instances', () => {
            Array.from(table.rows).forEach(row => {
                expect(row instanceof HTMLTableRowElement);
            });
        });

        it('row.cells is an HTMLCollection of HTMLTableCellElement instances', () => {
            const row = table.rows[0];
            expect(row.cells instanceof HTMLCollection);
            Array.from(row.cells).forEach(cell => {
                expect(cell instanceof HTMLTableCellElement);
            });
        });

        it('cells have rowSpan and colSpan properties', () => {
            const row = table.rows[0];
            Array.from(row.cells).forEach(cell => {
                expect(cell.rowSpan).toBe(1);
                expect(cell.colSpan).toBe(1);
            });
        });
    });

    describe('THEAD and TFOOT elements', () => {
        beforeEach(() => {
            table.innerHTML = `
                <thead>
                    <tr>
                        <td>AAA</td>
                    </tr>
                </thead>
                <tr>
                    <td>BBB</td>
                </tr>
                <tfoot>
                    <tr>
                        <td>CCC</td>
                    </tr>
                </tfoot>
            `
        });

        it('table.rows includes the THEAD and TFOOT rows', () => {
            expect(table.rows.length).toBe(3);
        });
    });
})
