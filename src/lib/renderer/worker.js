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
    }
    static draw() {
        const render = () => {
            RendererWorker.engine.draw(Object.values(RendererWorker.entities));
            RendererWorker.frames = requestAnimationFrame(render);
        };
        render();
    }
}
RendererWorker.entities = {};
RendererWorker.boot();
