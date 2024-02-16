import * as Matrix from './matrices.js';
import { Axis } from '../../enum.js';
const calculateSkeletonPosition = (bones, angles, translations) => {
    const outMatrices = [];
    bones.bones.forEach((bone, i) => {
        const localMatrix = Matrix.compose(Matrix.rotation(angles[i], Axis.Z), 4, Matrix.translate(translations[i]));
        if (i === bones.root)
            bone.transformationMatrix = localMatrix;
        else
            bone.transformationMatrix = Matrix.compose(bones.bones[bones.indices[i]].transformationMatrix, 4, localMatrix);
        outMatrices.push(bone.transformationMatrix);
    });
    return outMatrices;
};
export const transformSkeleton = (bones, opt) => {
    // new bone array
    const bonesArray = [];
    // check if skeleton will be updated with the new options
    if (!opt || (!opt.angle && !opt.translate)) {
        console.info('no skeletal animation array available');
        return [];
    }
    // check if one of the two transformations is undefined
    // and then set it to generically null transformation
    if (!opt.translate) {
        opt.translate = new Array().fill({ x: 0, y: 0, z: 0 }, 0, opt.angle.length);
    }
    if (!opt.angle) {
        opt.angle = new Array().fill(0, 0, opt.translate.length);
    }
    // calculate the skeleton matrix
    const bonesMatrices = calculateSkeletonPosition(bones, opt.angle, opt.translate);
    // push the flattened skeleton matrix
    bonesArray.push(...bonesMatrices.reduce((prev, curr) => prev ? prev.concat(curr) : curr));
    return bonesArray;
};
export const initBoneArray = (opt) => {
    const bones = [];
    const bonesMatrix = [];
    for (let i = 0; i < opt.nOfBones; i++) {
        bonesMatrix.push(...Matrix.IDENTITY_4X4);
        bones.push({
            inversePose: Matrix.IDENTITY_4X4,
            transformationMatrix: Matrix.IDENTITY_4X4
        });
    }
    return {
        bones,
        indices: opt.indices,
        root: opt.root,
    };
};
