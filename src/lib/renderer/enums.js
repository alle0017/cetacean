export const Messages = Object.freeze({
    CANVAS_PASSED: 'cvs_p$D',
    READY: 're4D7y',
    NEW_ENTITY: 'n3W_en7tY',
    START: 's74R_?7!',
});
export const types = Object.freeze({
    i32: {
        size: 4,
        components: 1,
        type: "sint32",
        constructor: Int32Array,
        atomic: 'i32',
        padding: 1,
    },
    i32x2: {
        size: 4,
        components: 2,
        type: "sint32x2",
        constructor: Int32Array,
        atomic: 'i32',
        padding: 1,
    },
    i32x3: {
        size: 4,
        components: 3,
        type: "sint32x3",
        constructor: Int32Array,
        atomic: 'i32',
        padding: 1,
    },
    i32x4: {
        size: 4,
        components: 4,
        type: "sint32x4",
        constructor: Int32Array,
        atomic: 'i32',
        padding: 1,
    },
    i16x2: {
        size: 2,
        components: 2,
        type: "sint16x2",
        constructor: Int16Array,
        atomic: 'i16',
        padding: 2,
    },
    i16x4: {
        size: 2,
        components: 4,
        type: "sint16x4",
        constructor: Int16Array,
        atomic: 'i16',
        padding: 2,
    },
    i8x2: {
        size: 1,
        components: 2,
        type: "sint8x2",
        constructor: Int8Array,
        atomic: 'i8',
        padding: 4,
    },
    i8x4: {
        size: 1,
        components: 4,
        type: "sint8x4",
        constructor: Int8Array,
        atomic: 'i8',
        padding: 4,
    },
    u32: {
        size: 4,
        components: 1,
        type: "uint32",
        constructor: Uint32Array,
        atomic: 'u32',
        padding: 1,
    },
    u32x2: {
        size: 4,
        components: 2,
        type: "uint32x2",
        constructor: Uint32Array,
        atomic: 'u32',
        padding: 1,
    },
    u32x3: {
        size: 4,
        components: 3,
        type: "uint32x3",
        constructor: Uint32Array,
        atomic: 'u32',
        padding: 1,
    },
    u32x4: {
        size: 4,
        components: 4,
        type: "uint32x4",
        constructor: Uint32Array,
        atomic: 'u32',
        padding: 1,
    },
    u16: {
        size: 2,
        components: 1,
        type: "uint16x4",
        constructor: Uint16Array,
        atomic: 'u16',
        padding: 2,
    },
    u16x2: {
        size: 2,
        components: 2,
        type: "uint16x2",
        constructor: Uint16Array,
        atomic: 'u16',
        padding: 2,
    },
    u16x4: {
        size: 2,
        components: 4,
        type: "uint16x4",
        constructor: Uint16Array,
        atomic: 'u16',
        padding: 2,
    },
    u8x2: {
        size: 1,
        components: 2,
        type: "uint8x2",
        constructor: Uint8Array,
        atomic: 'u8',
        padding: 4,
    },
    u8x4: {
        size: 1,
        components: 4,
        type: "uint8x4",
        constructor: Uint8Array,
        atomic: 'u8',
        padding: 4,
    },
    f32: {
        size: 4,
        components: 1,
        type: "float32",
        constructor: Float32Array,
        atomic: 'f32',
        padding: 1,
    },
    f32x2: {
        size: 4,
        components: 2,
        type: "float32x2",
        constructor: Float32Array,
        atomic: 'f32',
        padding: 1,
    },
    f32x3: {
        size: 4,
        components: 3,
        type: "float32x3",
        constructor: Float32Array,
        atomic: 'f32',
        padding: 1,
    },
    f32x4: {
        size: 4,
        components: 4,
        type: "float32x4",
        constructor: Float32Array,
        atomic: 'f32',
        padding: 1,
    },
});
/**
 * @enum {string}
 */
export const Topology = Object.freeze({
    triangle: "triangle-list",
    triangleStrip: "triangle-strip",
    points: "point-list",
    lines: "line-list",
    lineStrip: "line-strip",
});
