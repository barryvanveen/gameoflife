/**
 * [GameOfLife description]
 * @type {Object}
 */
GameOfLife = {};

/**
 * Object to contain (col, row) of a targeted cell
 * @param col
 * @param row
 */
GameOfLife.cell = function(col, row) {
    this.col = col;
    this.row = row;
};

/**
 * This is the object containing the game
 *
 * @type {Object}
 */
GameOfLife.game = {

    /**
     * Initialize or reset the game
     *
     * @constructor
     * @return {GameOfLife.game}
     */
    init: function() {

        // find canvas
        this.canvas = document.getElementById("gameoflife_canvas");
        this.$canvas = $(".js-game-canvas");
        this.$canvasContainer = $(".js-canvas-container");

        if (this.canvas.length == 0 || !this.canvas.getContext) {
            return false;
        }

        // resize canvas
        this.cellSize 				= 10;
        this.resizeCanvas();

        // visual board vars
        this.c 						= this.canvas.getContext("2d"); // c is for context
        this.colorLines 			= "#ccc";
        this.colorSelected 			= "#57A0DB";
        this.colorEmpty 			= "#fff";
        this.c.fillStyle 			= this.colorSelected;
        this.c.strokeStyle 			= this.colorLines;
        this.offsetTop 				= this.$canvas.offset().top;
        this.offsetLeft 			= this.$canvas.offset().left;

        // decide on cols and rows
        this.numCols 				= Math.floor(this.canvas.width / this.cellSize);
        this.numRows 				= Math.floor(this.canvas.height / this.cellSize);
        this.numExtraColsAndRows	= 2; // 2 extra colums and rows for "outside edges", these are always 0

        // mouse action vars
        this.$body					= $('body');
        this.mouseIsDown			= false;
        this.mouseLastCol			= false;
        this.mouseLastRow			= false;

        // game controls vars
        this.$buttonStart 			= $(".js-button-start");
        this.$buttonStop 			= $(".js-button-stop");
        this.$buttonStep 			= $(".js-button-step");
        this.$buttonReset 			= $(".js-button-reset");
        this.$allButtons			= $(".js-button-start, .js-button-stop, .js-button-step, .js-button-reset");

        // game animation vars
        this.playInterval			= null;
        this.intervalMilliseconds	= 200;

        // game statistic vars
        this.$numgenerations		= $(".js-num-generations");
        this.generations 			= 0;
        this.population 			= [];

        // init cells
        this.cells = [];
        this.newCells = [];
        for (var i = 0; i < this.numCols+this.numExtraColsAndRows; i++) {
            this.cells[i] = [];
            this.newCells[i] = [];
            for (j = 0; j < this.numRows+this.numExtraColsAndRows; j++) {
                this.cells[i][j] = 0;
                this.newCells[i][j] = 0;
            }
        }

        // draw lines between cells
        this.drawOutlines();

        // init event listener for clicks
        var self = this;
        this.$body.mousedown(function(e) {self.mouseDown(e, self);});
        this.$body.mouseup(function(e) {self.mouseUp(e, self);});
        this.$canvas.mousemove(function(e) {self.mouseMove(e, self);});
        this.$canvas.click(function(e) {self.handleClick(e, self);});

        // buttons
        this.$buttonReset.click(function() {self.doReset(self);});
        this.$buttonStep.click(function() {self.doStep(self, true);});
        this.$buttonStart.click(function() {self.doStart(self);});
        this.$buttonStop.click(function() {self.doStop(self)});
        self.$buttonStop.attr('disabled', 'disabled');

        // return reference to self
        return self;

    },

    /**
     * Resize the canvas so it fits most screen sizes
     *
     */
    resizeCanvas: function() {

        // resize the canvas to normal proportions
        this.canvas.width = this.$canvasContainer.width();
        this.canvas.height = 0.4 * this.$canvasContainer.width();

        // make the canvas heigher if the screen has a portrait layout
        if ($(window).height() > $(window).width()) {
            this.canvas.height = 0.6 * this.canvas.width;
        }

        // determine amount of cols and rows that fit in canvas
        var cols = this.canvas.width / this.cellSize;
        var rows = this.canvas.height / this.cellSize;

        // expand the canvas a little so
        this.canvas.width = (cols * this.cellSize) + 1;
        this.canvas.height = (rows * this.cellSize) + 1;

    },

    /**
     * Clear the canvas and draw the outlines of all cells
     *
     */
    drawOutlines: function() {

        // clear the canvas
        this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // vertical lines
        for (var x = 0; x <= this.numCols*this.cellSize; x += this.cellSize) {
            this.c.moveTo(0.5 + x, 0);
            this.c.lineTo(0.5 + x, this.numRows*this.cellSize);
        }

        // horizontal lines
        for (var y = 0; y <= this.numRows*this.cellSize; y += this.cellSize) {
            this.c.moveTo(0, 0.5 + y);
            this.c.lineTo(this.numCols*this.cellSize, 0.5 + y);
        }

        // draw it
        this.c.stroke();

    },

    /**
     * Store the fact that the mouse button is now down
     * this is used to enable/disable multiple cells by dragging over them
     *
     * @param  {Event} e
     * @param  {GameOfLife.game} self
     */
    mouseDown: function(e, self) {

        self.mouseIsDown = true;

    },

    /**
     * Store the fact that the mouse button is now up
     * this is used to enable/disable multiple cells by dragging over them
     *
     * @param  {Event} e
     * @param  {GameOfLife.game} self
     */
    mouseUp: function(e, self) {

        self.mouseIsDown = false;

    },

    /**
     * The mouse is being moved, change state of cells if the mouse button is down
     *
     * @param  {Event} e
     * @param  {GameOfLife.game} self
     */
    mouseMove: function(e, self) {

        if (self.mouseIsDown) {
            self.handleMove(e, self);
        }

    },

    /**
     * The mouse is being moved over cells, make these cells change state
     *
     * @param  {Event} e
     * @param  {GameOfLife.game} self
     */
    handleMove: function(e, self) {

        // find the clicked cell we moved over
        // only redraw if it is not the same cell as last time
        var cell = self.getCursorPosition(e);
        if (cell != false && (cell.col != self.mouseLastCol || cell.row != self.mouseLastRow)) {

            self.mouseLastCol = cell.col;
            self.mouseLastRow = cell.row;

            if (self.cells[cell.col][cell.row]) {
                self.cells[cell.col][cell.row] = 0;
                self.drawCell(cell.col, cell.row);
            } else {
                self.cells[cell.col][cell.row] = 1;
                self.drawCell(cell.col, cell.row);
            }

            // update statistics
            self.computeStats();

        }

    },

    /**
     * A cell has been clicked, make this cell change state
     *
     * @param  {Event} e
     * @param  {GameOfLife.game} self
     */
    handleClick: function(e, self) {

        // find the clicked cell and then redraw it
        var cell = self.getCursorPosition(e);
        if (cell != false) {

            if (self.cells[cell.col][cell.row]) {
                self.cells[cell.col][cell.row] = 0;
                self.drawCell(cell.col, cell.row);
            } else {
                self.cells[cell.col][cell.row] = 1;
                self.drawCell(cell.col, cell.row);
            }

            // update statistics
            self.computeStats();

        }

    },

    /**
     * Extract the cursor position from the click or move event
     *
     * @param  {Event} e
     * @return {GameOfLife.cell} een Cell-object with (col,row) of the targeted cell
     */
    getCursorPosition: function(e) {

        var col;
        var row;

        // get coordinates of click on page
        if (e.pageX != undefined && e.pageY != undefined) {
            col = e.pageX;
            row = e.pageY;
        } else {
            col = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            row = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        // get coordinates relative to canvas
        col -= this.offsetLeft;
        row -= this.offsetTop;

        if (col > (this.numCols*this.cellSize) || row > (this.numRows*this.cellSize)) {
            return false;
        }

        // now calculate in which cell this falls
        // always add 1 col and 1 row because of the fixed-zero rows/cols around the edges of the grid
        return new GameOfLife.cell(Math.floor(col / this.cellSize) + 1, Math.floor(row / this.cellSize) + 1);

    },

    /**
     * Visualize the state of a cell by making it colored or white
     *
     * @param col
     * @param row
     */
    drawCell: function(col, row) {

        // fill with color or white, depending on de state alive/dead
        if (this.cells[col][row]) {
            this.c.fillStyle = this.colorSelected;
        } else {
            this.c.fillStyle = this.colorEmpty;
        }

        // fill rectangle from (col-1,row-1) with width and height of cellSize-1
        this.c.fillRect(1 + ((col-1)*this.cellSize), 1 + ((row-1)*this.cellSize) , this.cellSize-1, this.cellSize-1);

    },

    /**
     * Handle a click on the step button
     *
     * @param  {GameOfLife.game} self
     */
    doStep: function(self) {

        // clear interval
        clearInterval(self.playInterval);
        self.playInterval = null;

        // set controls
        self.$allButtons.removeClass('active');
        self.$buttonStop.attr('disabled', 'disabled');

        // compute next generation
        self.computeNextGeneration(self);

    },

    /**
     * Handle a click on the start button
     *
     * @param  {GameOfLife.game} self
     */
    doStart: function(self) {

        // start a loop of computing next generations
        if (self.playInterval == null) {
            self.playInterval = setInterval(function(){self.computeNextGeneration(self);}, self.intervalMilliseconds);
        }

        // reset controls
        self.$allButtons.removeClass('active');
        self.$buttonStart.addClass('active');
        self.$buttonStop.removeAttr('disabled');

    },

    /**
     * Handle a click on the stop button
     *
     * @param  {GameOfLife.game} self
     */
    doStop: function(self) {

        // clear the interval
        clearInterval(self.playInterval);
        self.playInterval = null;

        // reset controls
        self.$allButtons.removeClass('active');
        self.$buttonStop.attr('disabled', 'disabled');

    },

    /**
     * Handle a click on the reset button
     *
     * @param  {GameOfLife.game} self
     */
    doReset: function(self) {

        // clear the play-interval
        clearInterval(self.playInterval);
        self.playInterval = null;

        // opnieuw initialiseren en de count outputten
        self.init();
        self.computeStats();

    },

    /**
     * Compute the number of cells that are alive and store this for the current generation
     *
     */
    computeStats: function() {

        var row = 0;
        var count = 0;

        // count number of alive cells
        for (var col = 1; col < this.numCols+this.numExtraColsAndRows-1; col++) {
            for (row = 1; row < this.numRows+this.numExtraColsAndRows-1; row++) {

                if (this.cells[col][row]) {
                    count++;
                }

            }
        }

        // store number and display it
        this.population[this.generations] = count;
        this.$numgenerations.html('Generation '+this.generations+': '+count);

    },

    /**
     * Compute the new state for all cells and then redraw all cells as necessary
     *
     * @param  {GameOfLife.game} self
     */
    computeNextGeneration: function(self) {

        var row = 0;
        var count = 0;

        // first, output current stats
        self.computeStats();

        // count number of live neighbors
        for (var col = 1; col < self.numCols+self.numExtraColsAndRows-1; col++) {
            for (row = 1; row < self.numRows+self.numExtraColsAndRows-1; row++) {

                count = 0;
                if (self.cells[col-1][row-1]) count++; 	// top left
                if (self.cells[col][row-1]) count++; 	// top
                if (self.cells[col+1][row-1]) count++; 	// top right
                if (self.cells[col-1][row]) count++; 	// left
                if (self.cells[col+1][row]) count++; 	// right
                if (self.cells[col-1][row+1]) count++; 	// bottom left
                if (self.cells[col][row+1]) count++; 	// bottom
                if (self.cells[col+1][row+1]) count++; 	// bottom right

                // determine state of new cells
                if (count < 2) {
                    self.newCells[col][row] = 0;
                } else if (count == 2) {
                    self.newCells[col][row] = self.cells[col][row];
                } else if (count == 3) {
                    self.newCells[col][row] = 1;
                } else {
                    self.newCells[col][row] = 0;
                }

            }
        }

        // update cells for new generation
        for (col = 1; col < self.numCols+self.numExtraColsAndRows-1; col++) {
            for (row = 1; row < self.numRows+self.numExtraColsAndRows-1; row++) {

                // only update when old and new cell differ
                if (self.cells[col][row] != self.newCells[col][row]) {
                    self.cells[col][row] = self.newCells[col][row];
                    self.drawCell(col, row);
                }

            }
        }

        // check if we can stop
        if (self.population[self.generations] == 0) {
            self.doStop(this);
        }

        // start next generation
        self.generations++;

    }

};

// start the game
$(document).ready(function(){GameOfLife.game.init()});