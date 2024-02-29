import { fragment as textureFragment, vertex as textureVertex } from "./shaders/textures.wgsl.js";
import { fragment as depthFragment, vertex as depthVertex } from "./shaders/depth.wgsl.js";
export const std = {
    textureFragment,
    textureVertex,
    depthFragment,
    depthVertex,
};
