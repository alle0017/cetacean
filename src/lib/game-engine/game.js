import * as Mat from '../math/matrix/index.js';
import Renderer from '../renderer/renderer.js';
import EventSystem from './events.js';
import { Loader } from './cache/loader.js';
export class Game {
    /** @hideconstructor */
    constructor() {
        this.scenes = {};
        this.renderer = new Renderer();
        this.renderer.render();
        this.view = new Mat.ViewDelegate(this.getResolution());
        this.view.zFar;
        this.events = new EventSystem();
        this.loader = new Loader();
    }
    /** get new instance of game class */
    static new() {
        if (!this.game) {
            this.game = new Game();
            this.initializeServiceWorker();
        }
        return this.game;
    }
    static initializeServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('service worker not available');
            return;
        }
        navigator.serviceWorker.register(new URL('./cache/cache.js', import.meta.url), {
            type: 'module'
        });
    }
    getResolution() {
        return this.renderer.cvs.width / this.renderer.cvs.height;
    }
    scene(scene, id) {
        this.scenes[id] = scene;
    }
    changeScene(id) {
        if (!this.scenes[id]) {
            console.warn(`no scene found with id ${id}`);
            return;
        }
        if (this.currentScene) {
            // onLeave
            this.renderer.removeAll();
        }
        this.currentScene = new this.scenes[id](this);
    }
}
