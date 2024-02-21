import * as Mat from '../math/matrix/index.js';
import Renderer from '../renderer/renderer.js';
export default class Game {
    /** @hideconstructor */
    constructor() {
        this.renderer = new Renderer();
        this.view = new Mat.ViewDelegate(this.getResolution());
    }
    /** get new instance of game class */
    static new() {
        if (!this.game)
            this.game = new Game();
        return this.game;
    }
    getResolution() {
        return this.renderer.cvs.width / this.renderer.cvs.height;
    }
}
