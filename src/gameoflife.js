/*
 * GameOfLife JavaScript Plugin v1.0.0
 * https://github.com/barryvanveen/gameoflife
 *
 * Released under the MIT license
 * http://choosealicense.com/licenses/mit/
 */

import State from './state';
import Canvas from './canvas';

export default class GameOfLife {

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

        this.config = this._buildConfig(customConfig);
        this.state = new State(this.config);
        this.canvas = new Canvas(this.config, this.state);
    };

    _buildConfig(customConfig) {

        var i;

        var config = this._defaults;

        if (typeof(customConfig) != "object") {
            return;
        }

        for (i in customConfig) {
            if (typeof(config[i]) == "undefined" || typeof(customConfig[i]) == "object") {
                continue;
            }
            config[i] = customConfig[i];
        }

        return config;

    };

    reset() {

        this.stop();

        this.state = new State(this.config);
        this.canvas = new Canvas(this.config);

    };

    start() {

        if (this._interval != null) {
            return;
        }

        var self = this,
            i, cellState;

        // todo: replace with requestAnimationFrame?
        this._interval = setInterval(function() {
            var changes = self.state.computeNextState();

            if (changes.length == 0) {
                self.stop();
                return;
            }

            for (i=0; i<changes.length; i++) {
                cellState = self.state.changeCell(changes[i].col, changes[i].row);
                self.canvas._drawCell(changes[i].col, changes[i].row, cellState);
            }
        }, this.config.update_interval);

    };

    step() {

        var changes, cellState, i;

        clearInterval(this._interval);
        this._interval = null;

        changes = this.state.computeNextState();

        if (changes.length == 0) {
            return;
        }

        for (i=0; i<changes.length; i++) {
            cellState = this.state.changeCell(changes[i].col, changes[i].row);
            this.canvas._drawCell(changes[i].col, changes[i].row, cellState);
        }

    };

    stop() {

        clearInterval(this._interval);
        this._interval = null;

    };

}
