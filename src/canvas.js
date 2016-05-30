import Helpers from './helpers';

export default class Canvas {

    constructor(config, state) {

        this.config = config;
        this.state = state;

        this.canvas = document.getElementById(this.config.canvas_id);

        if (this.canvas == null) {
            throw new Error("Canvas element could not be found.");
        }

        this.context = this.canvas.getContext("2d");

        if (!this.context) {
            throw new Error("Canvas context could not be retrieved.");
        }

        this.canvas.width = (this.config.num_cols * this.config.cell_size) + 1;
        this.canvas.height = (this.config.num_rows * this.config.cell_size) + 1;

        // clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // fill the background
        this.context.fillStyle = this.config.color_cell_dead;
        this.context.strokeStyle = this.config.color_lines;
        this.context.fillRect(1, 1, this.canvas.width-1,  this.canvas.height-1);

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

    _handleClick(e) {

        var cell = this._getCellFromCursorPosition(e);

        if (cell == false) {
            return;
        }

        var cellState = this.state.changeCell(cell[0], cell[1]);

        this._drawCell(cell[0], cell[1], cellState);

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
        var canvas_offset = Helpers.getPosition(this.canvas);
        left -= canvas_offset[0];
        top -= canvas_offset[1];

        if (left > (this.config.num_cols * this.config.cell_size) || top > (this.config.num_rows * this.config.cell_size)) {
            return false;
        }

        // now calculate in which cell this click falls
        return [Math.floor(left / this.config.cell_size), Math.floor(top / this.config.cell_size)];

    };

    _drawCell(col, row, cellState) {

        if (cellState) {
            this.context.fillStyle = this.config.color_cell_alive;
        } else {
            this.context.fillStyle = this.config.color_cell_dead;
        }

        // fill rectangle from (col-1,row-1) with width and height of cellSize-1
        this.context.fillRect(1 + (col*this.config.cell_size), 1 + (row*this.config.cell_size), this.config.cell_size-1, this.config.cell_size-1);

    };

}
