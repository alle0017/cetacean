import Thread from "../worker.js";
import WebGPUEngine from "./engines/webgpu/index.js";
import { Messages } from "./enums.js";
class RendererWorker {
    static boot() {
        Thread.listen(Messages.CANVAS_PASSED, (e) => {
            new RendererWorker(e.cvs);
        });
    }
    static async getEngine(offscreen) {
        const e = await WebGPUEngine.new(offscreen);
        if (e)
            this.engine = e;
    }
    constructor(offscreen) {
        RendererWorker.getEngine(offscreen)
            .then(() => Thread.post(Messages.READY, null));
        RendererWorker.setListeners();
    }
    static setListeners() {
        /**
        * listen for new entity creation
        */
        Thread.listen(Messages.NEW_ENTITY, (e) => {
            RendererWorker.entities[e.id] = RendererWorker.engine.create(e);
        });
        /**
        * listen for start rendering
        */
        Thread.listen(Messages.START, () => {
            RendererWorker.draw();
        });
        /**
        * listen for update of uniforms actually rendered
        */
        Thread.listen(Messages.UPDATE_UNIFORMS, (e) => {
            RendererWorker.update(e.id, e.uniforms);
        });
        /**
        * listen for deletion of entities
        */
        Thread.listen(Messages.DELETE_ALL, () => {
            RendererWorker.remove();
        });
        /**
        * listen for saving entities
        */
        Thread.listen(Messages.SAVE, (e) => {
            RendererWorker.save(e.id);
        });
        /**
        * listen for load of saved entity
        */
        Thread.listen(Messages.LOAD_SAVED, (e) => {
            RendererWorker.loadSavedEntity(e.id);
        });
    }
    static save(id) {
        if (!this.entities[id])
            return;
        this.saved[id] = this.entities[id];
    }
    static loadSavedEntity(id) {
        if (typeof id == 'string') {
            this.saved[id] && (this.entities[id] = this.saved[id]);
            return;
        }
        for (let i = 0; i < id.length; i++) {
            this.saved[id[i]] && (this.entities[id[i]] = this.saved[id[i]]);
        }
    }
    static draw() {
        const render = () => {
            RendererWorker.engine.draw(Object.values(RendererWorker.entities));
            RendererWorker.frames = requestAnimationFrame(render);
        };
        render();
    }
    /** removes all entities from the renderer. called to free memory between scenes */
    static remove() {
        RendererWorker.entities = {};
    }
    static update(id, uniforms) {
        if (!this.entities[id]) {
            Thread.error('No entities found with id ' + id);
            return;
        }
        for (let i = 0; i < uniforms.length; i++) {
            const entries = Object.entries(uniforms[i].data);
            for (let j = 0; j < entries.length; j++) {
                Thread.log(this.entities[id].uniformMap);
                this.engine.write(this.entities[id].uBuffer, this.entities[id].uniformMap[uniforms[i].group][uniforms[i].binding][entries[j][0]], entries[j][1], this.entities[id].uniforms[uniforms[i].group][uniforms[i].binding][entries[j][0]].type);
            }
        }
    }
}
RendererWorker.entities = {};
RendererWorker.saved = {};
RendererWorker.boot();
