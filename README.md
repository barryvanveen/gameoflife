# Game of Life
A Javascript implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life).
>v1.0.0

* Implemented with ES6 Javascript and html5 canvas element.
* Possible to run multiple implementations on one page.
* Set an arbitrary state using the setState() method.

## Installation
1. `bower install --save-dev gameoflife` or download `/dist/gameoflife.min.js`.
2. Add a canvas-element to your html with an ID of your choice.  
3. Include the following Javascript in your html file, just before closing the body tag:
 ```
    <script src="src/gameoflife.js"></script>
    <script type="text/javascript">
        var myGameOfLife = new GameOfLife();
    </script>
``` 
4. Add some buttons to control the game. See our [example page](example.html) and check out the Usage section below.

>If you are using ES6 you can also import the GameOfLife class from /src/gameoflife.js

## Usage
Initialise a new instance using `var myGame = new GameOfLife();`. Override default parameters using `var myCustomGame
 = new GameOfLife({canvas_id: "myCustomID", num_cols: 123})`.
 
Click on cells in the grid to change their state. You can also set the state with the setState() method. Once your 
finished providing the initial state, call the start() method. 
 
###setState(cells)

Provide an array of cells. Each cell is an object consisting of the column and row, eg. `{col: 1, row: 2}`. The state
 of each cell is changed but no further checks are made. 
 
Example of adding a [Blinker](http://www.conwaylife.com/wiki/Blinker) pattern to an empty state:
```
MyGame.setState([
    {col: 1, row: 0},
    {col: 1, row: 1},
    {col: 1, row: 2}
]);
```

### start()
Starts iterating of states of the game. The game stops automatically if the game ends up in dead state, ie. no 
changes are made by further iterations. 

### step()
Compute the next state of the population. If the game is currently running it is stopped after this iteration. 

### stop()
Stop the game from iterating any further.

### reset()
Reset to an empty state. If the game is currently running it is stopped.

## Configuration
Below is a list of options with the default values.

* `canvas_id` (String, "gameoflife_canvas") ID that identifies the canvas element. 
* `num_cols` (Int, 80) Number of columns in the grid.  
* `num_rows` (Int, 40) Number of rows in the grid.
* `cell_size` (Int, 10) Size of each cell, in pixels.
* `color_lines` (String, "#cccccc") Color of the grid lines.
* `color_cell_dead` (String, "#ffffff") Color of dead cells.
* `color_cell_alive` (String, "#57A0DB") Color of live cells.

## Licence
This software is freely distributable under the terms of the [MIT license](LICENCE).
