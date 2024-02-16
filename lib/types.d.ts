import Camera from "./math/matrix/camera.js";

export type Point3D = {
      x: number,
      y: number,
      z: number,
}

export type SkeletalAnimationUpdateOptions = {
      angle: number[];
      translate: Point3D[];
}
export type SkeletalAnimationSettings = {
      bones: number;
      weights: number[];
      indices: number[];
      root: number;
}
export type Bone = {
      // initial position of the bone
      inversePose: number[],
      // matrix that represents the local transformation
      // in global reference
      transformationMatrix: number[],
}
export type SkeletonOptions = {
      indices: number[],
      root: number,
      nOfBones: number,
}
export type Skeleton = {
      bones: Bone[],
      indices: number[],
      // root node of the skeleton
      root: number
}

export type TransformOpt = {
      translate: number[],
      rotate: number[],
      scale: number[],
      camera: Camera,
}
export type DrawMatrices = {
      transform: number[],
      perspective: number[],
}

