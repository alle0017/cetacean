import Engine from "../engine.js";
import WebGPU from "./webgpu.js";
import Thread from "../../../worker.js";
import { types, Topology } from "../../enums.js";
export default class WebGPUEngine extends Engine {
    /**
     * returns new instance of the WebGPUEngine if can be created.\
     * can fail if the browser does not support WebGPU
     */
    static async new(cvs) {
        if (!this.gpu) {
            const gpu = await WebGPU.get(cvs);
            if (!gpu) {
                WebGPU._config.debug && Thread.error(' cannot get WebGPU instance');
                return;
            }
            this.gpu = gpu;
        }
        return new WebGPUEngine();
    }
    createVertexAttribLayout(attributes, BYTES_PER_SLOT) {
        const attribs = [];
        let offset = 0;
        let size = 0;
        const values = Object.values(attributes);
        for (let i = 0; i < values.length; i++) {
            attribs.push({
                shaderLocation: values[i].location,
                offset: offset,
                format: types[values[i].type].type,
            });
            offset += types[values[i].type].components * BYTES_PER_SLOT;
            size += values[i].data.length * BYTES_PER_SLOT;
        }
        return {
            size,
            descriptor: {
                arrayStride: offset,
                attributes: attribs,
            }
        };
    }
    createVertexBuffer(attributes) {
        const BYTES_PER_SLOT = 4;
        const { size, descriptor } = this.createVertexAttribLayout(attributes, BYTES_PER_SLOT);
        const buffer = WebGPU.device.createBuffer({
            mappedAtCreation: true,
            usage: GPUBufferUsage.VERTEX,
            size
        });
        this.mixArrays(buffer.getMappedRange(), attributes, descriptor.arrayStride / BYTES_PER_SLOT);
        buffer.unmap();
        return {
            buffer,
            descriptor,
        };
    }
    createImage(image, sampled = true) {
        //create the texture
        const texture = WebGPUEngine.gpu.createTexture({
            width: image.width,
            height: image.height,
            format: 'rgba8unorm',
            sampled
        });
        //copy the image over it
        WebGPU.device.queue.copyExternalImageToTexture(
        //flipY to false to use it like webgl
        { source: image, flipY: false, }, { texture, premultipliedAlpha: true }, { width: image.width, height: image.height });
        return texture;
    }
    writeUniformBuffer(buffer, data, offset) {
        const map = {};
        const entries = Object.entries(data);
        for (let i = 0; i < entries.length; i++) {
            WebGPUEngine.gpu.writeBuffer(buffer, entries[i][1].data, entries[i][1].type, offset);
            map[entries[i][0]] = offset;
            offset += entries[i][1].data.length * types[entries[i][1].type].constructor.BYTES_PER_ELEMENT;
        }
        return {
            offset,
            map
        };
    }
    getUniformBindingSize(data) {
        let size = 0;
        const values = Object.values(data);
        for (let i = 0; i < values.length; i++) {
            size += values[i].data.length * types[values[i].type].constructor.BYTES_PER_ELEMENT;
        }
        return size;
    }
    createUniforms(uniforms, pipeline) {
        const buffer = WebGPUEngine.gpu.createBuffer({
            label: "uniforms buffer",
            type: "i32",
            length: uniforms.size,
        });
        const map = [];
        const bindGroups = [];
        let offset = 0;
        for (let i = 0; i < uniforms.entries.length; i++) {
            const resources = [];
            map.push([]);
            for (let j = 0; j < uniforms.entries[i].length; j++) {
                if (!uniforms.entries[i][j])
                    continue;
                if (typeof uniforms.entries[i][j] == 'string') {
                    resources.push({
                        binding: j,
                        resource: WebGPU.device.createSampler(),
                    });
                }
                else if (uniforms.entries[i][j] instanceof ImageBitmap) {
                    resources.push({
                        binding: j,
                        resource: this.createImage(uniforms.entries[i][j]).createView(),
                    });
                }
                else {
                    resources.push({
                        binding: j,
                        resource: {
                            buffer,
                            offset,
                            size: this.getUniformBindingSize(uniforms.entries[i][j]),
                        }
                    });
                    const tmp = this.writeUniformBuffer(buffer, uniforms.entries[i][j], offset);
                    offset = tmp.offset;
                    map[i][j] = tmp.map;
                }
            }
            bindGroups.push(WebGPU.device.createBindGroup({
                layout: pipeline.getBindGroupLayout(i),
                entries: resources,
            }));
        }
        return {
            buffer,
            map,
            bindGroups,
        };
    }
    createRenderFunction(pipeline, vBuffer, indexBuffer, bindGroups, nOfVertices) {
        if (bindGroups.length > 0) {
            return (pass) => {
                pass.setPipeline(pipeline);
                for (let i = 0; i < bindGroups.length; i++)
                    pass.setBindGroup(i, bindGroups[i]);
                pass.setIndexBuffer(indexBuffer, 'uint16');
                pass.setVertexBuffer(0, vBuffer);
                pass.drawIndexed(nOfVertices);
            };
        }
        WebGPU._config.debug && Thread.log('no bind group found');
        return (pass) => {
            pass.setPipeline(pipeline);
            pass.setIndexBuffer(indexBuffer, 'uint16');
            pass.setVertexBuffer(0, vBuffer);
            pass.drawIndexed(nOfVertices);
        };
    }
    /**
     * create new Drawable entity
     */
    create(opt) {
        // initialize attributes-related data
        const { buffer: vBuffer, descriptor } = this.createVertexBuffer(opt.attributes);
        //creating a new rendering pipeline
        const pipeline = WebGPUEngine.gpu.createRenderPipeline(opt, descriptor);
        // get the number of vertices
        const numOfVertices = opt.verticesCount / this.getVertexCount(opt.topology || Topology.triangle);
        // create bind group and unify uniforms
        const { buffer: uBuffer, bindGroups, map: uniformMap } = this.createUniforms(opt.uniforms, pipeline);
        const indexBuffer = WebGPUEngine.gpu.createBuffer({
            label: 'index buffer',
            data: opt.index || this.createIndexArray(numOfVertices),
            usage: 'index',
            type: 'i16x2',
        });
        // generate draw function
        const draw = this.createRenderFunction(pipeline, vBuffer, indexBuffer, bindGroups, numOfVertices);
        // return drawable
        return {
            draw,
            uBuffer,
            uniformMap,
            uniforms: opt.uniforms.entries,
        };
    }
    draw(objects) {
        WebGPU.renderPassDescriptor = WebGPUEngine.gpu.setRenderPassDescriptorView(WebGPU.renderPassDescriptor);
        const encoder = WebGPU.device.createCommandEncoder();
        if (!encoder)
            return;
        const pass = encoder.beginRenderPass(WebGPU.renderPassDescriptor);
        for (let i = 0; i < objects.length; i++) {
            objects[i].draw(pass);
        }
        pass.end();
        WebGPU.device.queue.submit([encoder.finish()]);
    }
    write(buffer, offset, data, type) {
        WebGPUEngine.gpu.writeBuffer(buffer, data, type, offset);
    }
}
