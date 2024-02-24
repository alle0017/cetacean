export const Shapes = Object.freeze({
    rectangle(center = { x: 0, y: 0, z: 0 }, width = 1, height = 1) {
        const w = width;
        const h = height;
        // TODO: why 5?
        const coords = [
            -w, h, 0.5, 1,
            w, -h, 0.5, 1,
            w, h, 0.5, 1,
            -w, -h, 0.5, 1,
        ];
        if (center.x && center.y && center.z) {
            for (let i = 0; i < 4; i++) {
                coords[i * 4] += center.x;
                coords[i * 4 + 1] += center.y;
                coords[i * 4 + 2] += center.z;
            }
        }
        return {
            vertices: coords,
            normals: [
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
            ],
            indices: [
                1, 2, 3,
                2, 0, 3
            ]
        };
    }
});
