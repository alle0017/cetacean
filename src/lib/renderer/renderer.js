var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Renderer_1;
import Thread from "../worker.js";
import { Messages, types } from './enums.js';
const getDeviceOffset = async () => {
    let adapter = await navigator.gpu.requestAdapter();
    return (constructor) => {
        constructor.minUniformOffset = adapter ?
            adapter.limits.minUniformBufferOffsetAlignment :
            256;
        return constructor;
    };
};
let Renderer = Renderer_1 = class Renderer {
    constructor(root = document.body) {
        this.root = root;
        this._tid = 'rendering thread' + Renderer_1._id++;
        this.cvs = document.createElement('canvas');
        root.appendChild(this.cvs);
        Thread.spawn(this._tid, new URL('./worker.js', import.meta.url));
        Thread.expose(Messages.CANVAS_PASSED, { cvs: this.cvs.transferControlToOffscreen() }, this._tid);
        Thread.wait(Messages.READY, this._tid);
    }
    addPaddingKey(struct, deltaSize) {
        const padding = [];
        let key = 0;
        for (let i = 0; i < deltaSize / 4; i++) {
            padding.push(0);
        }
        while (`${Renderer_1._uPadding}.${key}` in struct) {
            key++;
        }
        struct[`${Renderer_1._uPadding}.${key}`] = {
            type: 'f32',
            data: padding,
        };
    }
    getUniformBufferSize(uniforms) {
        let size = 0;
        /**last buffer position in array */
        let last = [0, 0];
        for (let i = 0; i < uniforms.length; i++) {
            for (let j = 0; j < uniforms[i].length; j++) {
                if (!uniforms[i][j] || typeof uniforms[i][j] == 'string' || uniforms[i][j] instanceof ImageBitmap)
                    continue;
                if (size && size % Renderer_1.minUniformOffset) {
                    this.addPaddingKey(uniforms[last[0]][last[1]], size % Renderer_1.minUniformOffset);
                }
                last = [i, j];
                const values = Object.values(uniforms[i][j]);
                for (let i = 0; i < values.length; i++) {
                    size += values[i].data.length * types[values[i].type].constructor.BYTES_PER_ELEMENT;
                }
            }
        }
        return size;
    }
    getEntry(fragment, vertex) {
        const fragmentEntry = fragment.match(/@fragment[\s\b]+fn[\s\b]+[a-zA-Z0-9_]+[\s\b]*/);
        const vertexEntry = vertex.match(/@vertex[\s\b]+fn[\s\b]+[a-zA-Z0-9_]+[\s\b]*/);
        if (!fragmentEntry) {
            console.error('no fragment entry point found in fragment shader');
            return {
                fragmentEntry: '',
                vertexEntry: ''
            };
        }
        if (!vertexEntry) {
            console.error('no vertex entry point found in vertex shader');
            return {
                fragmentEntry: '',
                vertexEntry: ''
            };
        }
        return {
            fragmentEntry: fragmentEntry[0].replace(/@fragment[\s\b]+fn[\s\b]+/, ''),
            vertexEntry: vertexEntry[0].replace(/@vertex[\s\b]+fn[\s\b]+/, ''),
        };
    }
    flatUniforms(opt) {
        const flattened = [];
        for (let i = 0; i < opt.length; i++) {
            if (!flattened[opt[i].group])
                flattened[opt[i].group] = [];
            flattened[opt[i].group][opt[i].binding] = opt[i].data;
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
        const { vertexEntry, fragmentEntry } = this.getEntry(opt.fragment, opt.vertex);
        let verticesCount = 0;
        if (!vertexEntry || !fragmentEntry) {
            console.error(`no entry point found, the object ${opt.id} is automatically discarded`);
            return;
        }
        if (opt.attributes[opt.verticesAttribute]) {
            verticesCount = opt.attributes[opt.verticesAttribute].data.length;
        }
        else {
            verticesCount = Object.values(opt.attributes)[0].data.length;
        }
        Thread.post(Messages.NEW_ENTITY, Object.assign(Object.assign({}, opt), { vertexEntry,
            fragmentEntry,
            verticesCount, uniforms: this.flatUniforms(opt.uniforms) }), this._tid);
    }
    update(id, uniforms) {
        console.log('update');
        Thread.post(Messages.UPDATE_UNIFORMS, {
            uniforms,
            id,
        }, this._tid);
    }
    changeRoot(newRoot) {
        this.root = newRoot;
        this.cvs.remove();
        this.root.append(this.cvs);
    }
};
Renderer._id = 0;
Renderer._uPadding = '__u_pad_ire';
Renderer.minUniformOffset = 256;
Renderer = Renderer_1 = __decorate([
    (await getDeviceOffset())
], Renderer);
export default Renderer;
