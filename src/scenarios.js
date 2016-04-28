GameOfLife_Scenarios = {};

GameOfLife_Scenarios.fill_cell = function(col, row) {
    GameOfLife.cells[col][row] = 1;
    GameOfLife._drawCell(col, row);
};

GameOfLife_Scenarios.full_1 = function() {

    GameOfLife_Scenarios.fill_cell(2, 1);
    GameOfLife_Scenarios.fill_cell(3, 2);
    GameOfLife_Scenarios.fill_cell(1, 3);
    GameOfLife_Scenarios.fill_cell(2, 3);
    GameOfLife_Scenarios.fill_cell(3, 3);

    for(var i = 0; i<100; i++) {
        GameOfLife.step();
    }

    GameOfLife.reset();

};