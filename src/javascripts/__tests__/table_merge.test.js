import TableMerge from '../modules/table_merge'

describe('develop table utilities', () => {
    let tableMerge;
    let grid;

    beforeEach(() => {
        tableMerge = new TableMerge();
        grid = tableMerge.initializeTableMap(4, 3);
    });

    it('initializeTableMap', () => {
        assert.equal(grid.length, 4);
        assert.equal(grid[0].length, 3);
        // tableMerge.logGrid(grid).forEach(line => console.log(line));
    });

    it('fillSpans 1,1', () => {
        const cell = {rowSpan: 1, colSpan: 1};
        tableMerge.fillSpans(grid, 0, 0, cell);
        let log = tableMerge.logGrid(grid);
        assert.equal(log[0], '1,1,el 0,0,-- 0,0,--');
        assert.equal(log[1], '0,0,-- 0,0,-- 0,0,--');
    });

    it('fillSpans 1,2', () => {
        const cell = {rowSpan: 1, colSpan: 2};
        tableMerge.fillSpans(grid, 0, 0, cell);
        let log = tableMerge.logGrid(grid);
        assert.equal(log[0], '1,2,el 1,1,-- 0,0,--');
        assert.equal(log[1], '0,0,-- 0,0,-- 0,0,--');
    });

    it('fillSpans 2,1', () => {
        const cell = {rowSpan: 2, colSpan: 1};
        tableMerge.fillSpans(grid, 0, 0, cell);
        let log = tableMerge.logGrid(grid);
        assert.equal(log[0], '2,1,el 0,0,-- 0,0,--');
        assert.equal(log[1], '1,1,-- 0,0,-- 0,0,--');
    });

    it('fillSpans 2,2', () => {
        const cell = {rowSpan: 2, colSpan: 2};
        tableMerge.fillSpans(grid, 0, 0, cell);
        let log = tableMerge.logGrid(grid);
        log.forEach(line => console.log(line));
        assert.equal(log[0], '2,2,el 2,1,-- 0,0,--');
        assert.equal(log[1], '1,2,-- 1,1,-- 0,0,--');
        assert.equal(log[2], '0,0,-- 0,0,-- 0,0,--');
    });
})
