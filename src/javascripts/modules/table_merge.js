import * as DOMUtils from '../utils/DOMUtils.js'
import * as DebugUtils from '../utils/DebugUtils'
import * as TableMergeUtils from '../utils/TableUtils.js'
import * as TableUtils from '../utils/TableUtils'

window.TableUtils = TableUtils;

export default class TableMerge {
    constructor(container) {
        this.container = container;
        const tables = container.querySelectorAll('.table-test');
        this.annotateTables(tables);
        console.groupCollapsed('Tables');
        Array.from(tables).forEach(t => {
            console.groupCollapsed(t.id);
            DebugUtils.dumpTable(t);
            console.log(DebugUtils.logGrid(TableUtils.createTableGrid(t)));
            console.groupEnd();
            t.querySelector('caption').addEventListener('click', this.onClickCaption.bind(this));
        });
        console.groupEnd();
        container.querySelectorAll('input[name=mode]').forEach(el => {
            el.addEventListener('click', this.onClickModeButton.bind(this));
        });
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
        let container = el.querySelector('.arrow-container');
        if (container) return;

        container = document.createElement('div');
        const html = `
                        <div class="arrow arrow-above"></div>
                        <div class="arrow arrow-below"></div>
                        <div class="arrow arrow-left"></div>
                        <div class="arrow arrow-right"></div>
                        <div class="arrow arrow-unmerge"><img src="/images/unMerge.png"/></div>
                     `
        container.classList.add('arrow-container');
        container.innerHTML = html;
        el.appendChild(container);
        container.addEventListener('click', this.onClickTableCell.bind(this));
    }

    setOperations(grid, el){
        const operations = TableUtils.operations(grid, el);
        const mode = document.body.querySelector('input:checked').value;
        ['Above', 'Below', 'Left', 'Right'].forEach(direction => {
            const operation = `${mode}${direction}`;
            const selector = `.arrow-${direction.toLowerCase()}`;
            const arrowEl = el.querySelector(selector);
            console.assert(arrowEl);
            arrowEl.classList.toggle('inactive', !operations[operation]);
            if (operations[operation]){
                arrowEl.dataset.operation = operation;
            } else {
                arrowEl.dataset.operation = '';
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

    onClickTableCell(evt){
        const table = DOMUtils.getParent(evt.target, 'table');
        if (!table) return false;   // why does this happen?

        const operation = evt.target.dataset.operation ||
                evt.target.parentElement.dataset.operation;

        if (TableMergeUtils.hasOwnProperty(operation)){
            const mode = document.body.querySelector('input:checked').value;
            const grid = TableUtils.createTableGrid(table);
            const targetEl = DOMUtils.getParent(evt.target, 'td, th');

            if (mode === 'merge'){
                TableMergeUtils[operation](grid, targetEl);
            } else if (mode === 'insert') {
                const [rowIndex, colIndex] = TableUtils.findCell(grid, targetEl);
                if (['insertAbove', 'insertBelow'].includes(operation)){
                    const newCells = TableMergeUtils.insertAbove(grid, targetEl);
                    const currentRow = targetEl.parentElement;
                    const newRow = currentRow.cloneNode();
                    newCells.forEach(newCell => newRow.appendChild(newCell));
                    const newRowContainer = currentRow.parentNode;
                    let newRowIndex = rowIndex;
                    if (operation === 'insertBelow'){
                        newRowIndex += targetEl.rowSpan;
                    }
                    newRowContainer.insertBefore(
                            newRow, newRowContainer.children[newRowIndex] || null);
                }
                if (['insertRight'].includes(operation)){
                    TableUtils.insertRight(grid, targetEl);
                }
            }
            DebugUtils.dumpTable(table);
            this.annotateTables([table]);
        }
        return false;
    }

    onClickModeButton(evt){
        const tables = this.container.querySelectorAll('.table-test');
        this.annotateTables(tables);
    }
}
