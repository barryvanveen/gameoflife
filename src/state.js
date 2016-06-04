import Helpers from './helpers';

export default class State {

    constructor(config) {

        this.config = config;

        var col = this.config.num_cols,
            row;

        this.cells = [];
        this.changes = [];

        while (col--) {
            this.cells[col] = [];

            row = this.config.num_rows;
            while (row--) {
                this.cells[col][row] = 0;
            }
        }

    };

    changeCell(col, row) {
        this.cells[col][row] = !this.cells[col][row];

        return this.cells[col][row];
    };

    computeNextState() {

        var count = 0,
            col, row, rowOffset, colOffset, neighborCol, neighborRow;

        this.changes = [];

        // iterate over all cells
        col = this.config.num_cols;
        while (col--) {

            row = this.config.num_rows;
            while (row--) {

                count = 0;

                // iterate over all neighbors in Moore neighborhood with radius=1
                for (colOffset = -1; colOffset <= 1; ++colOffset) {
                    for (rowOffset = -1; rowOffset <= 1; ++rowOffset) {
                        if (colOffset == 0 && rowOffset == 0) {
                            continue;
                        }

                        neighborCol = col + colOffset;
                        if (neighborCol < 0 || neighborCol >= this.config.num_cols) {
                            neighborCol = Helpers.mod(this.config.num_cols, neighborCol);
                        }

                        neighborRow = row + rowOffset;
                        if (neighborRow < 0 || neighborRow >= this.config.num_rows) {
                            neighborRow = Helpers.mod(this.config.num_rows, neighborRow);
                        }

                        // count neighbors that are "on" or "alive"
                        if (this.cells[neighborCol][neighborRow]) {
                            count++;
                        }
                    }
                }

                // determine state of new cells
                // die if under- or overpopulated
                if ((count < 2 || count > 3) && this.cells[col][row]) {
                    this.changes.push({col, row});
                // come to life if exactly 3 neighbors
                } else if (count == 3 && !this.cells[col][row]) {
                    this.changes.push({col, row});
                }

            }
        }

        return this.changes;

    };

}
