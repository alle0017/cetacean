import { Axis } from "../../enum.js";
import { degToRad } from "../math.js";
export * from "./matrixOperations.js";
/*
* Generates a 4x4 rotation matrix.
* @param {number} angle - Rotation angle in degrees.
* @param {AxisType} axis - Axis of rotation (X, Y, or Z).
* @param {boolean} toRad - Whether the input angle is in radians (default is true).
* @returns {number[]} - The 4x4 rotation matrix.
*/
export function rotation(angle, axis, toRad = true) {
    if (toRad)
        angle = degToRad(angle);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    if (axis == Axis.X) {
        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    }
    else if (axis == Axis.Y) {
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    }
    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}
/**
* Generates a 4x4 translation matrix.
* @param {Point} point - Translation values in the x, y, and z directions.
* @returns {number[]} - The 4x4 translation matrix.
*/
export function translate(point) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        point.x, point.y, point.z, 1,
    ];
}
/**
* Generates a 4x4 scale matrix.
* @param {number | Point} scale - Scaling factor or scaling values in the x, y, and z directions.
* @returns {number[]} - The 4x4 scale matrix.
*/
export function scale(scale) {
    if (typeof scale === 'number') {
        return [
            scale, 0, 0, 0,
            0, scale, 0, 0,
            0, 0, scale, 0,
            0, 0, 0, 1,
        ];
    }
    return [
        scale.x, 0, 0, 0,
        0, scale.y, 0, 0,
        0, 0, scale.z, 0,
        0, 0, 0, 1,
    ];
}
/**
* Generates a 4x4 perspective projection matrix.
* @param {number} fieldOfView - Field of view angle in degrees.
* @param {number} resolution - Aspect ratio (width/height).
* @param {number} near - Near clipping plane.
* @param {number} far - Far clipping plane.
* @param {boolean} toRad - Whether the input field of view angle is in radians (default is true).
* @returns {number[]} - The 4x4 perspective projection matrix.
*/
export function perspective(fieldOfView, resolution, near, far, toRad = true) {
    if (toRad)
        fieldOfView = degToRad(fieldOfView);
    //const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView);
    const f = 1 / Math.tan(fieldOfView / 2 * Math.PI / 180);
    const rangeInv = 1.0 / (far - near);
    return [
        f / resolution, 0, 0, 0,
        0, f, 0, 0,
        0, 0, -(near + far) * rangeInv, -1,
        0, 0, -near * far * rangeInv * 2, 0
    ];
}
