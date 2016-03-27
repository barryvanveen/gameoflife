GameOfLife = {};

GameOfLife.defaults = {

    canvas_id:              "gameoflife_canvas",
    num_cols:               80,
    num_rows:               40,
    cell_size:              10,
    color_lines:            "#cccccc",
    color_cell_empty:       "#ffffff",
    color_cell_selected:    "#57A0DB",
    update_interval:        200

};

GameOfLife.constants = {

    num_cols_padding:       2,
    num_rows_padding:       2

};

GameOfLife.init = function(config) {

    this._initConfig(config);

    this._initCanvas();

    this._initCells();

    this._initEventListeners();

    this.interval = null;

};

GameOfLife._initConfig = function(config) {

    var i;

    this.config = this.defaults;

    if (typeof(config) != "object") {
        return;
    }

    for (i in config) {
        if (typeof(this.config[i]) == "undefined" || typeof(config[i]) == "object") {
            continue;
        }
        this.config[i] = config[i];
    }

    for (i in this.constants) {
        this.config[i] = this.constants[i];
    }

};

GameOfLife._initCanvas = function() {

    this.canvas = document.getElementById(this.config.canvas_id);

    if (this.canvas == null) {
        throw new Error("Canvas element could not be found.");
    }

    this.context = this.canvas.getContext("2d");

    if (!this.context) {
        throw new Error("Canvas context could not be retrieved.");
    }

    this.context.fillStyle = this.config.color_cell_selected;
    this.context.strokeStyle = this.config.color_lines;

    this.config.canvas_offset = this._getPosition(this.canvas);

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

GameOfLife._getPosition = function(element) {

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

GameOfLife._initCells = function() {

    // init two sets of cells:
    //   cells is the current state
    //   newCells is used to compute the next state

    var i,j,
        cols = this.config.num_cols+this.config.num_cols_padding,
        rows = this.config.num_rows+this.config.num_rows_padding;

    this.cells = [];
    this.newCells = [];

    for (i = 0; i < cols; i++) {
        this.cells[i] = [];
        this.newCells[i] = [];

        for (j = 0; j < rows; j++) {
            this.cells[i][j] = 0;
            this.newCells[i][j] = 0;
        }
    }

    // todo: isn't "this.newCells = this.cells" faster?

};

GameOfLife._initEventListeners = function() {

    var self = this;

    this.canvas.addEventListener('click', function(e) {
        self._handleClick(e);
    }, false);

};

GameOfLife._handleClick = function(e) {

    var cell = this._getCellFromCursorPosition(e);

    console.log(cell);

    if (cell == false) {
        return;
    }

    this.cells[cell[0]][cell[1]] = !this.cells[cell[0]][cell[1]];
    this._drawCell(cell[0], cell[1]);

};


GameOfLife._getCellFromCursorPosition = function(e) {

    var left, top,
        height = this.config.num_rows * this.config.cell_size,
        width = this.config.num_cols * this.config.cell_size;

    // get coordinates of click on page
    if (typeof(e.pageX) != "undefined" && typeof(e.pageY) != "undefined") {
        left = e.pageX;
        top = e.pageY;
    } else {
        left = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        top = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    // get coordinates relative to canvas
    left -= this.config.canvas_offset[0];
    top -= this.config.canvas_offset[1];

    if (left > width || top > height) {
        return false;
    }

    // now calculate in which cell this falls
    // always add 1 column and 1 row because of the fixed-zero rows/cols around the edges of the grid
    return [(Math.floor(left / this.config.cell_size) + 1), (Math.floor(top / this.config.cell_size) + 1)];

};

GameOfLife._drawCell = function(col, row) {

    // fill with color or white, depending on de state alive/dead
    if (this.cells[col][row]) {
        this.context.fillStyle = this.config.color_cell_selected;
    } else {
        this.context.fillStyle = this.config.color_cell_empty;
    }

    // fill rectangle from (col-1,row-1) with width and height of cellSize-1
    // todo: is inlining cell_size faster?
    this.context.fillRect(1 + ((col-1)*this.config.cell_size), 1 + ((row-1)*this.config.cell_size) , this.config.cell_size-1, this.config.cell_size-1);

};

GameOfLife.reset = function() {

    this.stop();

    this._initCells();
    this._initCanvas();

};

GameOfLife.start = function() {

    if (this.interval != null) {
        return;
    }

    var self = this;
    this.interval = setInterval(function() { self._computeNextGeneration(); }, this.update_interval);

};

GameOfLife.step = function() {

    clearInterval(this.interval);
    this.interval = null;

    this._computeNextGeneration();

};

GameOfLife.stop = function() {

    clearInterval(this.interval);
    this.interval = null;

};

GameOfLife._computeNextGeneration = function() {

    var row = 0,
        count = 0,
        change = false;

    // todo: implement with a toroidal array

    // count number of live neighbors
    // todo: optimize for-loops
    for (var col = 1; col < this.config.num_cols+this.config.num_cols_padding-1; col++) {
        for (row = 1; row < this.config.num_rows+this.config.num_rows_padding-1; row++) {

            count = 0;
            if (this.cells[col-1][row-1]) count++; 	// top left
            if (this.cells[col][row-1]) count++; 	// top
            if (this.cells[col+1][row-1]) count++; 	// top right
            if (this.cells[col-1][row]) count++; 	// left
            if (this.cells[col+1][row]) count++; 	// right
            if (this.cells[col-1][row+1]) count++; 	// bottom left
            if (this.cells[col][row+1]) count++; 	// bottom
            if (this.cells[col+1][row+1]) count++; 	// bottom right

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

    // update cells for new generation
    // todo: optimize for-loops
    for (col = 1; col < this.config.num_cols+this.config.num_cols_padding-1; col++) {
        for (row = 1; row < this.config.num_rows+this.config.num_rows_padding-1; row++) {

            // only update when old and new cell differ
            if (this.cells[col][row] != this.newCells[col][row]) {
                this.cells[col][row] = this.newCells[col][row];
                // todo: is "this.cells[col][row] = !this.cells[col][row];" faster??
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