import * as DOMUtils from '../utils/DOMUtils.js'
import * as DebugUtils from '../utils/DebugUtils'
import * as TableMergeUtils from '../utils/TableUtils.js'
import * as TableUtils from '../utils/TableUtils'

window.TableUtils = TableUtils;

export default class TableMerge {
    constructor(container) {
        const tables = container.querySelectorAll('.table-test');
        this.annotateTables(tables);
        console.groupCollapsed('Tables');
        Array.from(tables).forEach(t => {
            console.groupCollapsed(t.id);
            DebugUtils.dumpTable(t);
            console.groupEnd();
            t.querySelector('caption').addEventListener('click', this.onClickCaption.bind(this));
        });
        console.groupEnd();
    }

    annotateTables(tables){
        Array.from(tables).forEach(t => {
            const cells = t.querySelectorAll('th, td');
            const grid = TableUtils.createTableGrid(t);
            Array.from(cells).forEach(cell => {
                this.annotateCell(cell);
                this.setOperations(grid, cell);
            });
        });
    }

    annotateCell(el){
        const html = `
                        <div class="arrow arrow-above"></div>
                        <div class="arrow arrow-below"></div>
                        <div class="arrow arrow-left"></div>
                        <div class="arrow arrow-right"></div>
                        <div class="arrow arrow-unmerge"><img src="/images/unMerge.png"/></div>
                     `
        const container = el.querySelector('.arrow-container') || document.createElement('div');
        container.classList.add('arrow-container');
        container.innerHTML = html;
        el.appendChild(container);
        container.addEventListener('click', this.onClickMerge.bind(this));
    }

    setOperations(grid, el){
        const operations = TableUtils.operations(grid, el);
        ['Above', 'Below', 'Left', 'Right'].forEach(direction => {
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
        const arrowEl = el.querySelector('.arrow-unmerge');
        console.assert(arrowEl);
        if (operations.unMerge){
            arrowEl.querySelector('img').dataset.operation = 'unMerge';
        } else {
            arrowEl.classList.add('inactive');
        }
    }

    onClickCaption(evt){
        DebugUtils.dumpTable(evt.target.parentElement);
    }

    onClickMerge(evt){
        const operation = evt.target.dataset.operation ||
                evt.target.parentElement.dataset.operation;
        console.log('onClickMerge', operation);
        const table = DOMUtils.getParent(evt.target, 'table');
        if (!table) return;   // why does this happen?
        const grid = TableUtils.createTableGrid(table);
        if (TableMergeUtils.hasOwnProperty(operation)){
            TableMergeUtils[operation](grid, DOMUtils.getParent(evt.target, 'td, th'));
            this.annotateTables([table]);
            DebugUtils.dumpTable(table);
        }
        return false;
    }
}
