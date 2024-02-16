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
        RendererWorker.getEngine(offscreen).then(() => Thread.post(Messages.READY, null));
        Thread.listen(Messages.NEW_ENTITY, (e) => {
            RendererWorker.entities[e.id] = RendererWorker.engine.create(e);
        });
        Thread.listen(Messages.START, () => {
            RendererWorker.draw();
        });
        Thread.listen(Messages.UPDATE_UNIFORMS, (e) => {
            RendererWorker.update(e.id, e.uniforms);
        });
    }
    static draw() {
        const render = () => {
            RendererWorker.engine.draw(Object.values(RendererWorker.entities));
            RendererWorker.frames = requestAnimationFrame(render);
        };
        render();
    }
    static update(id, uniforms) {
        if (!this.entities[id]) {
            Thread.error('No entities found with id ' + id);
            return;
        }
        for (const o of uniforms) {
            this.engine.write(this.entities[id].uBuffer, this.entities[id].uniformMap[o.group][o.binding][o.name], o.data, this.entities[id].uniforms[o.group][o.binding][o.name].type);
        }
    }
}
RendererWorker.entities = {};
RendererWorker.boot();
