import * as DOMUtils from '../utils/DOMUtils.js'
import * as TableMergeUtils from '../utils/TableMergeUtils.js'
import * as TableUtils from '../utils/TableUtils'

export default class TableMerge {
    constructor(container) {
        this.annotateTables(container.querySelectorAll('.table-test'));
    }

    annotateTables(tables){
        Array.from(tables).forEach(t => {
            const cells = t.querySelectorAll('th, td');
            const grid = TableUtils.buildTableMap(t);
            console.log('tableID:', grid.tableID);
            Array.from(cells).forEach(cell => {
                this.annotateCell(cell);
                this.setOperations(grid, cell);
            });
        });
    }

    annotateCell(el){
        const html = `
                        <div class="arrow arrow-up"></div>
                        <div class="arrow arrow-down"></div>
                        <div class="arrow arrow-left"></div>
                        <div class="arrow arrow-right"></div>
                     `
        const container = el.querySelector('.arrow-container') || document.createElement('div');
        container.classList.add('arrow-container');
        container.innerHTML = html;
        el.appendChild(container);
        container.addEventListener('click', this.onClickMerge.bind(this));
    }

    setOperations(grid, el){
        const operations = TableUtils.operations(grid, el);
        ['Up', 'Down', 'Left', 'Right'].forEach(direction => {
            const operation = `merge${direction}`;
            const selector = `.arrow-${direction.toLowerCase()}`;
            const arrowEl = el.querySelector(selector);
            console.assert(arrowEl);
            if (!operations[operation]){
                arrowEl.classList.add('inactive');
            } else {
                arrowEl.dataset.operation = operation;
            }
        });
    }

    onClickMerge(evt){
        const operation = evt.target.dataset.operation;
        console.log('onClickMerge', operation);
        const table = DOMUtils.getParent(evt.target, 'table');
        if (!table) return;   // why does this happen?
        const grid = TableUtils.buildTableMap(table);
        if (operation === 'mergeUp'){
            TableMergeUtils.mergeUp(grid, DOMUtils.getParent(evt.target, 'td, th'));
            this.annotateTables([table]);
        }
        return false;
    }
}
