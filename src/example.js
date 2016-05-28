import GameOfLife from './gameoflife';

var BigGame = new GameOfLife({
    canvas_id:              "gameoflife_canvas",
    num_cols:               80,
    num_rows:               40,
    cell_size:              10,
    color_lines:            "#cccccc",
    color_cell_empty:       "#ffffff",
    color_cell_selected:    "#57A0DB",
    update_interval:        50
});

$('.game1_start').click(function() {BigGame.start()});
$('.game1_stop').click(function() {BigGame.stop()});
$('.game1_step').click(function() {BigGame.step()});
$('.game1_reset').click(function() {BigGame.reset()});

var SmallGame = new GameOfLife({
    canvas_id:              "gameoflife_canvas_small",
    num_cols:               80,
    num_rows:               40,
    cell_size:              5,
    color_lines:            "#cccccc",
    color_cell_empty:       "#ffffff",
    color_cell_selected:    "#57A0DB",
    update_interval:        50
});

$('.game2_start').click(function() {SmallGame.start()});
$('.game2_stop').click(function() {SmallGame.stop()});
$('.game2_step').click(function() {SmallGame.step()});
$('.game2_reset').click(function() {SmallGame.reset()});