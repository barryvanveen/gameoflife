/*
 * GameOfLife JavaScript Plugin v1.0.0
 * https://github.com/barryvanveen/gameoflife
 *
 * Released under the MIT license
 * http://choosealicense.com/licenses/mit/
 */

// todo: babel instellen https://www.npmjs.com/package/gulp-babel/
// todo: modules maken voor gameoflife, helpers (getPosition, mod)
// todo: boel importeren en namespacen

class GameOfLife {

    constructor(customConfig) {
        this._defaults = {
            canvas_id:              "gameoflife_canvas",
            num_cols:               80,
            num_rows:               40,
            cell_size:              10,
            color_lines:            "#cccccc",
            color_cell_empty:       "#ffffff",
            color_cell_selected:    "#57A0DB",
            update_interval:        50
        };
        this._interval = null;

        this._initConfig(customConfig);
        this._initCanvas();
        this._initCells();
        this._initEventListeners();
    };

    _initConfig(customConfig) {

        var i;

        this.config = this._defaults;

        if (typeof(customConfig) != "object") {
            return;
        }

        for (i in customConfig) {
            if (typeof(this.config[i]) == "undefined" || typeof(customConfig[i]) == "object") {
                continue;
            }
            this.config[i] = customConfig[i];
        }

    };

    _initCanvas() {

        this.canvas = document.getElementById(this.config.canvas_id);
        console.log(this.canvas);

        if (this.canvas == null) {
            throw new Error("Canvas element could not be found.");
        }

        this.context = this.canvas.getContext("2d");

        if (!this.context) {
            throw new Error("Canvas context could not be retrieved.");
        }

        this.context.fillStyle = this.config.color_cell_selected;
        this.context.strokeStyle = this.config.color_lines;

        this.canvas.width = (this.config.num_cols * this.config.cell_size) + 1;
        this.canvas.height = (this.config.num_rows * this.config.cell_size) + 1;

        // clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //todo: is inlining cell_size faster?

        // vertical lines
        for (var x = 0; x <= this.canvas.width; x += this.config.cell_size) {
            this.context.moveTo(0.5 + x, 0);
            this.context.lineTo(0.5 + x, this.canvas.width);
        }

        // horizontal lines
        for (var y = 0; y <= this.canvas.width; y += this.config.cell_size) {
            this.context.moveTo(0, 0.5 + y);
            this.context.lineTo(this.canvas.width, 0.5 + y);
        }

        // draw it
        this.context.stroke();

    };

    _initCells() {

        // init two sets of cells:
        //   cells is the current state
        //   newCells is used to compute the next state

        var col = this.config.num_cols,
            row;

        this.cells = [];
        this.newCells = [];

        while (col--) {
            this.cells[col] = [];
            this.newCells[col] = [];

            row = this.config.num_rows;
            while (row--) {
                this.cells[col][row] = 0;
                this.newCells[col][row] = 0;
            }
        }

    };

    _initEventListeners() {

        var self = this;

        // todo: test fallback for <=IE10 with attachEvent
        if (document.addEventListener) {

            this.canvas.addEventListener('click', function(e) {
                self._handleClick(e);
            }, false);

        } else if (document.attachEvent) {

            this.canvas.attachEvent('click', function (e) {
                self._handleClick(e);
            });
        }

    };

    _handleClick(e) {

        var cell = this._getCellFromCursorPosition(e);

        if (cell == false) {
            return;
        }

        this.cells[cell[0]][cell[1]] = !this.cells[cell[0]][cell[1]];
        this._drawCell(cell[0], cell[1]);

    };

    _getCellFromCursorPosition(e) {

        var left, top;

        // get coordinates of click on page
        if (typeof(e.pageX) != "undefined" && typeof(e.pageY) != "undefined") {
            left = e.pageX;
            top = e.pageY;
        } else {
            left = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            top = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        // get coordinates relative to canvas
        var canvas_offset = GameOfLife.getPosition(this.canvas);
        left -= canvas_offset[0];
        top -= canvas_offset[1];

        if (left > (this.config.num_cols * this.config.cell_size) || top > (this.config.num_rows * this.config.cell_size)) {
            return false;
        }

        // now calculate in which cell this click falls
        return [Math.floor(left / this.config.cell_size), Math.floor(top / this.config.cell_size)];

    };

    _drawCell(col, row) {

        if (this.cells[col][row]) {
            this.context.fillStyle = this.config.color_cell_selected;
        } else {
            this.context.fillStyle = this.config.color_cell_empty;
        }

        // fill rectangle from (col-1,row-1) with width and height of cellSize-1
        // todo: is inlining cell_size faster?
        this.context.fillRect(1 + (col*this.config.cell_size), 1 + (row*this.config.cell_size), this.config.cell_size-1, this.config.cell_size-1);

    };

    reset() {

        this.stop();

        this._initCells();
        this._initCanvas();

    };

    start() {

        if (this._interval != null) {
            return;
        }

        var self = this;

        // todo: replace with requestAnimationFrame?
        this._interval = setInterval(function() { self._computeNextGeneration(); }, this.config.update_interval);

    };

    step() {

        clearInterval(this._interval);
        this._interval = null;

        this._computeNextGeneration();

    };

    stop() {

        clearInterval(this._interval);
        this._interval = null;

    };

    _computeNextGeneration() {

        var count = 0,
            change = false,
            col, row, rowOffset, colOffset, neighborCol, neighborRow;

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
                            neighborCol = GameOfLife.mod(this.config.num_cols, neighborCol);
                        }

                        neighborRow = row + rowOffset;
                        if (neighborRow < 0 || neighborRow >= this.config.num_rows) {
                            neighborRow = GameOfLife.mod(this.config.num_rows, neighborRow);
                        }

                        // count neighbors that are "on" or "alive"
                        if (this.cells[neighborCol][neighborRow]) {
                            count++;
                        }
                    }
                }

                // determine state of new cells
                if (count < 2 || count > 3) {
                    this.newCells[col][row] = 0;
                } else if (count == 2) {
                    this.newCells[col][row] = this.cells[col][row];
                } else { // count == 3
                    this.newCells[col][row] = 1;
                }

            }
        }

        // todo: is keeping an array of changed cells faster?
        // update cells for new generation
        col = this.config.num_cols;
        while (col--) {

            row = this.config.num_rows;
            while (row--) {

                // only update when old and new cell differ
                if (this.cells[col][row] != this.newCells[col][row]) {

                    // todo: is "this.cells[col][row] = !this.cells[col][row];" faster??
                    this.cells[col][row] = this.newCells[col][row];
                    this._drawCell(col, row);
                    change = true;

                }
            }
        }

        // if no cells were changed we can stop
        if (!change) {
            this.stop();
        }

    };

    /*
     * Helpers
     */

    static getPosition(element) {

        var left = 0,
            top = 0;

        if (element.offsetParent) {
            do {
                left += element.offsetLeft;
                top += element.offsetTop;
            } while (element = element.offsetParent);
        }

        return [left, top];

    };

    static mod(n, m) {
        return ((m % n) + n) % n;
    };

}
