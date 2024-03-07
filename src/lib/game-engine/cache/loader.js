export class Loader {
    async image(path) {
        //const url = new URL( path );
        //postMessage({ url: url.toString(), message: 'cache' });
        const img = document.createElement('img');
        img.src = path;
        const promise = new Promise((resolve, reject) => {
            img.onload = async () => resolve(await createImageBitmap(img));
            img.onerror = () => reject();
        });
        return promise;
    }
    async text(path) {
        return await (await fetch(path)).text();
    }
}
