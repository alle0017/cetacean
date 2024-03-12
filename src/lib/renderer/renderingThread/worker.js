import Thread from "../../worker.js";
import RendererWorker from "./rendering.js";
import { Messages } from "./enums.js";
class Worker {
    static boot() {
        Thread.listen(Messages.CANVAS_PASSED, (e) => {
            RendererWorker.getEngine(e.cvs).then(() => {
                Thread.post(Messages.READY, null);
            });
            Worker.setListeners();
        });
    }
    static setListeners() {
        /**
        * listen for update of uniforms actually rendered
        */
        Thread.listen(Messages.UPDATE_UNIFORMS, (e) => {
            Worker.renderer.update(e.id, e.uniforms);
        });
        /**
        * listen for new entity creation
        */
        Thread.listen(Messages.NEW_ENTITY, (e) => {
            Worker.renderer.create(e);
        });
        /**
        * listen for start rendering
        */
        Thread.listen(Messages.START, () => {
            Worker.renderer.draw();
        });
        /**
        * listen for deletion of entities
        */
        Thread.listen(Messages.DELETE_ALL, () => {
            Worker.renderer.remove();
        });
        /**
        * listen for saving entities
        */
        Thread.listen(Messages.SAVE, (e) => {
            Worker.renderer.save(e.id);
        });
        /**
        * listen for load of saved entity
        */
        Thread.listen(Messages.LOAD_SAVED, (e) => {
            Worker.renderer.loadSavedEntity(e.id);
        });
        /**
        * listen for sorting of entities
        */
        Thread.listen(Messages.SORT, (e) => {
            Worker.renderer.updateZIndex(e);
        });
    }
}
Worker.renderer = new RendererWorker();
Worker.boot();
