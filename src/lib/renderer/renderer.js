var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Renderer_1;
import { types } from './renderingThread/enums.js';
import WorkerMaster from "./master.js";
const getDeviceOffset = async () => {
    let adapter = await navigator.gpu.requestAdapter();
    return (constructor) => {
        constructor.minUniformOffset = adapter ?
            adapter.limits.minUniformBufferOffsetAlignment :
            256;
        return constructor;
    };
};
let Renderer = Renderer_1 = class Renderer extends WorkerMaster {
    constructor() {
        super(...arguments);
        this.zIndexMap = {};
    }
    addPaddingKey(struct, deltaSize) {
        const padding = [];
        let key = 0;
        for (let i = 0; i < deltaSize / 4; i++) {
            padding.push(0);
        }
        while (`${Renderer_1._uPadding}_${key}` in struct) {
            key++;
        }
        struct[`${Renderer_1._uPadding}_${key}`] = {
            type: 'f32',
            data: padding,
        };
    }
    addPaddingToUniform(u, alignment) {
        const data = [];
        const delta = (alignment - types[u.type].components * types[u.type].constructor.BYTES_PER_ELEMENT) / types[u.type].constructor.BYTES_PER_ELEMENT;
        if (!delta)
            return;
        const padding = [];
        for (let j = 0; j < delta; j++) {
            padding.push(0);
        }
        for (let i = 0; i < u.data.length; i += types[u.type].components) {
            data.push(...u.data.slice(i, types[u.type].components), ...padding);
        }
        u.data = data;
    }
    getSizeOfStruct(values) {
        let size = 0;
        let type = 'i8';
        for (let i = 0; i < values.length; i++) {
            let components = types[values[i].type].components;
            let typeSize = types[values[i].type].constructor.BYTES_PER_ELEMENT;
            if (types[type].components * types[type].constructor.BYTES_PER_ELEMENT < components * typeSize)
                type = values[i].type;
        }
        let alignment = types[type].components * types[type].constructor.BYTES_PER_ELEMENT;
        //align to 4
        if (types[type].components == 3)
            alignment += types[type].constructor.BYTES_PER_ELEMENT;
        for (let i = 0; i < values.length; i++) {
            this.addPaddingToUniform(values[i], alignment);
            size += values[i].data.length * types[values[i].type].constructor.BYTES_PER_ELEMENT;
        }
        return size;
    }
    getUniformBufferSize(uniforms) {
        const sizesForStruct = [];
        let size = 0;
        /**last buffer position in array */
        let last = [0, 0];
        for (let i = 0; i < uniforms.length; i++) {
            for (let j = 0; j < uniforms[i].length; j++) {
                if (!uniforms[i][j] || typeof uniforms[i][j] == 'string' || uniforms[i][j] instanceof ImageBitmap)
                    continue;
                //correcting size if it is not aligned properly (only if it isn't hte last element)
                if (size && size % Renderer_1.minUniformOffset) {
                    this.addPaddingKey(uniforms[last[0]][last[1]], Renderer_1.minUniformOffset - size % Renderer_1.minUniformOffset);
                }
                last = [i, j];
                const values = Object.values(uniforms[i][j]);
                if (!sizesForStruct[i])
                    sizesForStruct[i] = [];
                sizesForStruct[i][j] = this.getSizeOfStruct(values);
                size += sizesForStruct[i][j];
            }
        }
        return {
            size,
            sizesForStruct
        };
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
        const { size, sizesForStruct } = this.getUniformBufferSize(flattened);
        return {
            entries: flattened,
            size,
            sizesForStruct,
        };
    }
    getMinZ(vertices, stride) {
        let minZ = vertices[3];
        if (stride < 3) {
            return 0;
        }
        for (let i = 0; i < vertices.length; i += stride) {
            if (minZ > vertices[i + 3])
                minZ = vertices[i + 3];
        }
        return minZ;
    }
    create(opt) {
        const { vertexEntry, fragmentEntry } = this.getEntry(opt.fragment, opt.vertex);
        let verticesCount = 0;
        let minZ;
        if (!vertexEntry || !fragmentEntry) {
            console.error(`no entry point found, the object ${opt.id} is automatically discarded`);
            return;
        }
        if (opt.attributes[opt.verticesAttribute]) {
            verticesCount = opt.attributes[opt.verticesAttribute].data.length / types[opt.attributes[opt.verticesAttribute].type].components;
            minZ = this.getMinZ(opt.attributes[opt.verticesAttribute].data, types[opt.attributes[opt.verticesAttribute].type].components);
        }
        else {
            const vertices = Object.values(opt.attributes)[0];
            verticesCount = vertices.data.length / types[vertices.type].components;
            minZ = this.getMinZ(vertices.data, types[vertices.type].components);
        }
        this.zIndexMap[opt.id] = minZ;
        this.sendNewEntityToThread(Object.assign(Object.assign({}, opt), { minZ,
            vertexEntry,
            fragmentEntry,
            verticesCount, uniforms: this.flatUniforms(opt.uniforms) }));
    }
    update(id, uniforms, z) {
        this.updateUniforms(id, uniforms, z);
    }
    updateZIndex(id, z) {
        if (this.zIndexMap[id] == z)
            return;
        this.zIndexMap[id] = z;
        this.sortEntities(id, z);
    }
    changeRoot(newRoot) {
        this.root = newRoot;
        this.cvs.remove();
        this.root.append(this.cvs);
    }
};
Renderer._uPadding = '__delta_padding_for_GPU_structs';
Renderer.minUniformOffset = 256;
Renderer = Renderer_1 = __decorate([
    (await getDeviceOffset())
], Renderer);
export default Renderer;
