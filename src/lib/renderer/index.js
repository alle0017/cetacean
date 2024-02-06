import Thread from "../worker.js";
import { Messages, types } from './enums.js';
class Renderer {
    constructor(root = document.body) {
        this.root = root;
        this._tid = 'rendering thread' + Renderer._id++;
        this.cvs = document.createElement('canvas');
        root.appendChild(this.cvs);
        Thread.spawn(this._tid, './src/lib/renderer/worker.js');
        Thread.expose(Messages.CANVAS_PASSED, { cvs: this.cvs.transferControlToOffscreen() }, this._tid);
        Thread.wait(Messages.READY, this._tid);
    }
    getUniformBufferSize(uniforms) {
        let size = 0;
        for (let i = 0; i < uniforms.length; i++) {
            for (let j = 0; j < uniforms[i].length; j++) {
                if (!uniforms[i][j] || typeof uniforms[i][j] == 'string' || uniforms[i][j] instanceof ImageBitmap)
                    continue;
                for (const v of Object.values(uniforms[i][j])) {
                    size += v.data.length * types[v.type].constructor.BYTES_PER_ELEMENT;
                }
            }
        }
        return size;
    }
    flatUniforms(opt) {
        const flattened = [];
        for (const v of opt) {
            if (!flattened[v.group])
                flattened[v.group] = [];
            flattened[v.group][v.binding] = v.data;
        }
        const size = this.getUniformBufferSize(flattened);
        return {
            entries: flattened,
            size
        };
    }
    render() {
        Thread.post(Messages.START, null, this._tid);
    }
    create(opt) {
        let verticesCount = 0;
        if (opt.attributes[opt.verticesAttribute]) {
            verticesCount = opt.attributes[opt.verticesAttribute].data.length;
        }
        else {
            verticesCount = Object.values(opt.attributes)[0].data.length;
        }
        Thread.post(Messages.NEW_ENTITY, Object.assign(Object.assign({}, opt), { verticesCount, uniforms: this.flatUniforms(opt.uniforms) }), this._tid);
    }
}
Renderer._id = 0;
export default Renderer;
