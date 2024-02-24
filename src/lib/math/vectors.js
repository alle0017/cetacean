export var Vec;
(function (Vec) {
    Vec.modulus = (vec) => Math.sqrt(vec.reduce((p, c) => p + c));
    Vec.normalize = (vec) => {
        const cpy = [...vec];
        const det = Vec.modulus(cpy);
        return cpy.map(v => v / det);
    };
    Vec.dot = (vec1, vec2) => {
        const res = [];
        if (vec1.length > vec2.length) {
            vec2.forEach((v, i) => res[i] = v * vec1[i]);
        }
        else {
            vec1.forEach((v, i) => res[i] = v * vec2[i]);
        }
        return res;
    };
    Vec.negate = (vec) => vec.map(v => -v);
    Vec.vecDotScalar = (vec, scalar) => vec.map(v => v * scalar);
    Vec.sum = (vec1, vec2) => {
        const res = [];
        if (vec1.length > vec2.length) {
            vec2.forEach((v, i) => res[i] = v + vec1[i]);
        }
        else {
            vec1.forEach((v, i) => res[i] = v + vec2[i]);
        }
        return res;
    };
    Vec.reflect = (vec, normals) => {
        const n = Vec.normalize(normals);
        if (vec.length > n.length) {
            console.error(`vector ${vec} is too long for the normals array`);
            return [...vec];
        }
        const reflection = Vec.dot(Vec.dot(vec, n), n);
        return reflection.map((v, i) => vec[i] - 2 * v);
    };
})(Vec || (Vec = {}));
