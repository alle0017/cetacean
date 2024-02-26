import { types } from "../renderingThread/enums.js";
export default class Engine {
    /**bind two arrays by mixing them and returns the offset of the next attribute to mix */
    mixArrays(mappedRange, attributes, stride) {
        const arrays = {};
        let offset = 0;
        const values = Object.values(attributes);
        for (let x = 0; x < values.length; x++) {
            if (!arrays[types[values[x].type].atomic]) {
                arrays[types[values[x].type].atomic] = new types[values[x].type].constructor(mappedRange);
            }
            for (let i = 0; i < values[x].data.length / types[values[x].type].components; i++) {
                const next = types[values[x].type].padding;
                const start = i * stride + offset;
                const end = start + next * types[values[x].type].components;
                for (let j = start; j < end; j += next) {
                    arrays[types[values[x].type].atomic][j] =
                        values[x].data[(j - start) / next + i * types[values[x].type].components];
                }
            }
            offset += types[values[x].type].components;
        }
    }
    getVertexCount(type) {
        switch (type) {
            case "point-list":
                return 1;
            case "line-list":
            case "line-strip":
                return 2;
            case "triangle-list":
            case "triangle-strip":
                return 3;
        }
    }
    createIndexArray(vertices) {
        const indices = [];
        for (let i = 0; i < vertices; i++) {
            indices.push(i);
        }
        return indices;
    }
}
