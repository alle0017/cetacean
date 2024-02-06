import { types } from "../enums.js";
export default class Engine {
    /**bind two arrays by mixing them and returns the offset of the next attribute to mix */
    mixArrays(mappedRange, attributes, stride) {
        const arrays = {};
        let offset = 0;
        for (const v of Object.values(attributes)) {
            if (!arrays[types[v.type].atomic]) {
                arrays[types[v.type].atomic] = new types[v.type].constructor(mappedRange);
            }
            for (let i = 0; i < v.data.length / types[v.type].components; i++) {
                const next = types[v.type].padding;
                const start = i * stride + offset;
                const end = start + next * types[v.type].components;
                for (let j = start; j < end; j += next) {
                    arrays[types[v.type].atomic][j] = v.data[(j - start) / next + i * types[v.type].components];
                }
            }
            offset += types[v.type].components;
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
