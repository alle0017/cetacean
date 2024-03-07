import { Game, Scene, Sprite3D } from './lib/index.js';
class MyScene extends Scene {
    constructor(game) {
        super(game);
        //const s = new Sprite2D('./icon.png')
        const s = new Sprite3D({
            image: './icon.png',
            shape: {
                vertices: [
                    1, 1, 1, 1,
                    -1, 1, 1, 1,
                    1, -1, 1, 1,
                    -1, -1, 1, 1,
                    -1, 1, 1, 1,
                    -1, 1, -1, 1,
                    -1, -1, -1, 1,
                    -1, -1, 1, 1,
                    -1, 1, 1, 1,
                    1, 1, 1, 1,
                    1, 1, -1, 1,
                    -1, 1, -1, 1,
                    -1, -1, -1, 1,
                    1, -1, -1, 1,
                    1, -1, 1, 1,
                    -1, -1, 1, 1,
                    1, 1, 1, 1,
                    -1, 1, 1, 1,
                    -1, -1, 1, 1,
                    1, -1, 1, 1,
                    -1, 1, -1, 1,
                    1, 1, -1, 1,
                    1, -1, -1, 1,
                    -1, -1, -1, 1
                ],
                indices: [
                    0, 1, 2,
                    0, 2, 3,
                    4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
                ],
                normals: [
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    -1, 0, 0,
                    -1, 0, 0,
                    -1, 0, 0,
                    -1, 0, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1
                ]
            }
        });
        setInterval(() => { s.xAngle += 0.0001; }, 100);
    }
}
const game = Game.new();
game.scene(MyScene, 'my-scene');
game.changeScene('my-scene');
new SharedArrayBuffer(100);
