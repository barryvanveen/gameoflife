 GameOfLife_PerformanceTester = {};

GameOfLife_PerformanceTester.run = function(numTests) {

    if (typeof numTests != "number") {
        numTests = 10;
    }

    var start,
        end,
        i,
        total_time = 0;

    for (i=0; i<numTests; i++) {

        start = new Date().getTime();

        GameOfLife_Scenarios.full_1();

        end = new Date().getTime();
        total_time += (end - start);

    }

    console.log("Average execution time over " + numTests + " runs: " + (total_time/numTests));

};