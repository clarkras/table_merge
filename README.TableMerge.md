# Table Cell Merge

## DOM Reference
table: HTMLTableElement

- rows: HTMLCollection[{HTMLTableRowElement}]
    - includes all TRs (thead, tbody, tfoot)
- does not have a cols property

HTMLTableRowElement

- cells: HTMLCollection[{HTMLTableCellElement})

HTMLTableCellElement

tbody: HTMLTableSectionElement

## Data structure


### :sparkles: Model

Build a model of the table as a dense matrix (i.e., for a M x N table, there
are M * N cells). Mark the cells that were subsumed by colspans or rowspans
as such.


Cell
```
cell
    colspan: number remaining in span
    rowspan: number remaining in span
    el:      element or null if ghost cell
```

## Methods

```javascript
canMergeUp(table, cell)
    if (cell.y > 0) return true;
    // It's actually more complicated than this - need to make
    // sure that there is at least one unmerged cell above.

canMergeDown(table, cell)
    if (cell.y < (table.height - 1) 
```
