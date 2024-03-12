import Thread from "../worker.js";
import { Messages, } from './renderingThread/enums.js';
/**
 * class to handle rendering thread. must be used with **Renderer** class (@see ./renderer.ts)
 */
class WorkerMaster {
    constructor(root = document.body) {
        this.root = root;
        this._tid = 'rendering thread' + WorkerMaster._id++;
        this.cvs = document.createElement('canvas');
        root.appendChild(this.cvs);
        Thread.spawn(this._tid, new URL('./renderingThread/worker.js', import.meta.url));
        Thread.expose(Messages.CANVAS_PASSED, { cvs: this.cvs.transferControlToOffscreen() }, this._tid);
        Thread.wait(Messages.READY, this._tid);
    }
    sendNewEntityToThread(opt) {
        Thread.post(Messages.NEW_ENTITY, opt, this._tid);
    }
    updateUniforms(id, uniforms, z) {
        Thread.post(Messages.UPDATE_UNIFORMS, {
            id,
            uniforms,
            z,
        }, this._tid);
    }
    render() {
        Thread.post(Messages.START, null, this._tid);
    }
    /**
     * save entity with specified id for later use after remove ( @see remove )
     */
    save(id) {
        Thread.post(Messages.SAVE, {
            id
        }, this._tid);
    }
    loadSavedEntities(id) {
        Thread.post(Messages.LOAD_SAVED, {
            id
        }, this._tid);
    }
    /**
     * remove all entities actually rendered
     * they need to be re-created to be rendered again
     */
    removeAll() {
        Thread.post(Messages.DELETE_ALL, null, this._tid);
    }
    sortEntities(id, z) {
        Thread.post(Messages.SORT, { id, z, }, this._tid);
    }
}
WorkerMaster._id = 0;
export default WorkerMaster;
