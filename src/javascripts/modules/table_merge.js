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
            const selector = `.arrow-${direction.toLowerCase()}`;
            if (mode === 'delete'){
                if (['Above', 'Below'].includes(direction)){
                    direction = 'Column';
                } else {
                    direction = 'Row';
                }
            }
            const operation = `${mode}${direction}`;
            const arrowEl = el.querySelector(selector);
            console.assert(arrowEl);

            if (mode === 'delete'){
                arrowEl.classList.remove('inactive');
                arrowEl.dataset.operation = operation;
            } else {
                arrowEl.classList.toggle('inactive', !operations[operation]);
                if (operations[operation]){
                    arrowEl.dataset.operation = operation;
                } else {
                    arrowEl.dataset.operation = '';
                }
            }
        });
        const arrowEl = el.querySelector('.arrow-unmerge');
        if (mode === 'merge' && operations.unMerge){
            arrowEl.querySelector('img').dataset.operation = 'unMerge';
            arrowEl.classList.toggle('inactive', false);
        } else {
            arrowEl.classList.toggle('inactive', true);
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

        const mode = document.body.querySelector('input:checked').value;
        console.log({operation, mode});
        const grid = TableUtils.createTableGrid(table);
        const targetEl = DOMUtils.getParent(evt.target, 'td, th');

        if (mode === 'merge'){
            TableMergeUtils[operation](grid, targetEl);
        } else if (['insertAbove', 'insertBelow'].includes(operation)){
            const direction = operation === 'insertAbove' ? 'above' : 'below';
            TableUtils.insertRow(grid, targetEl, direction);
            // const [rowIndex, colIndex] = TableUtils.findCell(grid, targetEl);
            // let newCells;
            // if (operation === 'insertAbove'){ 
            //     newCells = TableMergeUtils.insertAbove(grid, targetEl);
            // } else {
            //     newCells = TableMergeUtils.insertBelow(grid, targetEl);
            // }
            // const currentRow = targetEl.parentElement;
            // const newRow = currentRow.cloneNode();
            // newCells.forEach(newCell => newRow.appendChild(newCell));
            // const newRowContainer = currentRow.parentNode;
            // let newRowIndex = rowIndex;
            // if (operation === 'insertBelow'){
            //     newRowIndex += targetEl.rowSpan;
            // }
            // newRowContainer.insertBefore(
            //         newRow, newRowContainer.children[newRowIndex] || null);
        } else if (['insertLeft', 'insertRight'].includes(operation)){
            const direction = operation === 'insertLeft' ? 'left' : 'right'
            TableUtils.insertColumn(grid, targetEl, direction);
        } else if (operation === 'deleteRow'){
            TableUtils.deleteRow(grid, targetEl);
        } else if (operation === 'deleteColumn'){
            TableUtils.deleteColumn(grid, targetEl);
        }
        DebugUtils.dumpTable(table);
        this.annotateTables([table]);
        return false;
    }

    onClickModeButton(evt){
        const tables = this.container.querySelectorAll('.table-test');
        this.annotateTables(tables);
    }
}
