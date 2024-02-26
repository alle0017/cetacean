import Thread from '../../worker.js';
export default class RenderingEngine {
    constructor() {
        this.entities = {};
        this.saved = {};
    }
    save(id) {
        if (!this.entities[id])
            return;
        this.saved[id] = this.entities[id];
    }
    loadSavedEntity(id) {
        if (typeof id == 'string') {
            this.saved[id] && (this.entities[id] = this.saved[id]);
            return;
        }
        for (let i = 0; i < id.length; i++) {
            this.saved[id[i]] && (this.entities[id[i]] = this.saved[id[i]]);
        }
    }
    draw() {
        const render = (() => {
            this.engine.draw(Object.values(this.entities));
            this.frames = requestAnimationFrame(render);
        }).bind(this);
        render();
    }
    /** removes all entities from the renderer. called to free memory between scenes */
    remove() {
        this.entities = {};
    }
    update(id, uniforms) {
        Thread.log('update');
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
