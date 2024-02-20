import Renderer from '../renderer/index.js';
export default class Game {
    /** @hideconstructor */
    constructor() {
        this.renderer = new Renderer();
    }
    /** get new instance of game class */
    static new() {
        if (!this.game)
            this.game = new Game();
        return this.game;
    }
}
