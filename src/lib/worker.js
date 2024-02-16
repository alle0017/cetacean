var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _Thread_listeners, _Thread_waiting, _Thread_queue, _Thread_postQueue, _Thread_threads, _Thread_execQueueEvents, _Thread_isTransferable, _Thread_getTransferable;
class Thread {
    static isChildThread() {
        return typeof window == 'undefined';
    }
    static expose(message, transferable, id) {
        const exposed = [];
        for (const v of Object.values(transferable)) {
            exposed.push(v);
        }
        if (Thread.isChildThread()) {
            self.postMessage({
                type: message,
                data: transferable,
            }, '*', exposed);
        }
        else if (id && __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id]) {
            __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id].postMessage({
                type: message,
                data: transferable,
            }, exposed);
        }
        else {
            Thread.error('you have to specify the thread if you are using Thread.post from window');
        }
    }
    static spawn(id, code) {
        if (__classPrivateFieldGet(this, _a, "f", _Thread_threads)[id]) {
            Thread.error(`thread ${id} already exists`);
            return;
        }
        const thread = new Worker(code, {
            type: 'module',
        });
        thread.onerror = (e) => {
            Thread.error(`error occurred while running thread ${id}`);
            console.error(e);
        };
        thread.onmessageerror = (e) => {
            Thread.error(`error occurred while running thread ${id} (message cannot be serialized)`);
            console.error(e);
        };
        thread.addEventListener('message', e => {
            if (!('type' in e.data) || !('message' in e.data) || e.data.type !== 'log')
                return;
            Thread.log(e.data.message);
        });
        thread.addEventListener('message', e => {
            if (!('type' in e.data) || !('message' in e.data) || e.data.type !== 'error')
                return;
            Thread.error(e.data.message);
        });
        __classPrivateFieldGet(this, _a, "f", _Thread_threads)[id] = thread;
        return id;
    }
    static listen(message, callback, id) {
        if (typeof message !== 'string' || typeof callback !== 'function') {
            Thread.error(`handler rejected ${message}`);
            return;
        }
        __classPrivateFieldGet(this, _a, "f", _Thread_listeners)[message] = callback;
        if (Thread.isChildThread()) {
            self.addEventListener('message', e => {
                if (!('type' in e.data) || e.data.type !== message)
                    return;
                if (__classPrivateFieldGet(Thread, _a, "f", _Thread_waiting)) {
                    __classPrivateFieldGet(Thread, _a, "f", _Thread_queue).push(e);
                }
                else if ('data' in e.data) {
                    __classPrivateFieldGet(Thread, _a, "f", _Thread_listeners)[message](e.data.data);
                }
                else {
                    __classPrivateFieldGet(Thread, _a, "f", _Thread_listeners)[message]();
                }
            });
        }
        else if (id && __classPrivateFieldGet(this, _a, "f", _Thread_threads)[id]) {
            __classPrivateFieldGet(this, _a, "f", _Thread_threads)[id].addEventListener('message', e => {
                if (!('type' in e.data) || e.data.type !== message)
                    return;
                if (__classPrivateFieldGet(Thread, _a, "f", _Thread_waiting)) {
                    __classPrivateFieldGet(Thread, _a, "f", _Thread_queue).push(e);
                }
                else if ('data' in e.data) {
                    __classPrivateFieldGet(Thread, _a, "f", _Thread_listeners)[message](e.data.data);
                }
                else {
                    __classPrivateFieldGet(Thread, _a, "f", _Thread_listeners)[message]();
                }
            });
        }
        else {
            Thread.error('you have to specify the thread if you are using Thread.listen from window');
        }
    }
    /**
     * wait for message to be received.
     * available only for one message at time
     */
    static wait(message, id) {
        __classPrivateFieldSet(this, _a, true, "f", _Thread_waiting);
        if (Thread.isChildThread()) {
            self.addEventListener('message', e => {
                if ('type' in e.data && e.data.type === message) {
                    __classPrivateFieldSet(Thread, _a, false, "f", _Thread_waiting);
                    __classPrivateFieldGet(Thread, _a, "m", _Thread_execQueueEvents).call(Thread);
                }
            });
        }
        else if (id && __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id]) {
            __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id].addEventListener('message', e => {
                if ('type' in e.data && e.data.type === message) {
                    __classPrivateFieldSet(Thread, _a, false, "f", _Thread_waiting);
                    __classPrivateFieldGet(Thread, _a, "m", _Thread_execQueueEvents).call(Thread);
                }
            });
        }
        else {
            Thread.error('you have to specify the thread if you are using Thread.wait from window');
        }
    }
    static post(message, data, id) {
        if (__classPrivateFieldGet(Thread, _a, "f", _Thread_waiting)) {
            __classPrivateFieldGet(Thread, _a, "f", _Thread_postQueue).push({
                message,
                data,
                id,
            });
            return;
        }
        if (Thread.isChildThread()) {
            self.postMessage({
                type: message,
                data
            });
        }
        else if (id && __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id]) {
            __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id].postMessage({
                type: message,
                data
            });
        }
        else {
            Thread.error('you have to specify the thread if you are using Thread.post from window');
        }
    }
    static postCanvas(message, canvas, id) {
        const offscreen = canvas.transferControlToOffscreen();
        if (id && __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id] && !Thread.isChildThread()) {
            __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id].postMessage({
                type: message,
                data: offscreen,
            }, [offscreen]);
        }
        else {
            Thread.error('you have to specify the thread if you are using Thread.post from window');
        }
    }
    static log(message) {
        if (Thread.isChildThread()) {
            self.postMessage({
                type: 'log',
                message: message,
            });
        }
        else {
            console.log(message);
        }
    }
    static error(message) {
        if (Thread.isChildThread()) {
            self.postMessage({
                type: 'error',
                message: message,
            });
        }
        else {
            console.error(message);
        }
    }
    /**
     * kill the current thread or the child thread with the specified id
     */
    static kill(id) {
        if (typeof id == 'string') {
            if (__classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id]) {
                __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id].terminate();
                delete __classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id];
            }
            else {
                Thread.error(`thread ${id} doesn't exists`);
            }
        }
        else if (Thread.isChildThread()) {
            Thread.post('killed', null);
            self.close();
        }
        else {
            console.error('cannot kill the main thread');
        }
    }
    static async join(id) {
        if (typeof id !== 'string' || !__classPrivateFieldGet(Thread, _a, "f", _Thread_threads)[id]) {
            Thread.error(`thread ${id} doesn't exists`);
            return;
        }
        return new Promise((resolve, reject) => {
            Thread.listen('killed', () => {
                resolve();
            }, id);
        });
    }
}
_a = Thread, _Thread_execQueueEvents = function _Thread_execQueueEvents() {
    __classPrivateFieldGet(this, _a, "f", _Thread_queue).forEach(e => {
        if ('data' in e.data) {
            __classPrivateFieldGet(Thread, _a, "f", _Thread_listeners)[e.data.type](e.data.data);
        }
        else {
            __classPrivateFieldGet(Thread, _a, "f", _Thread_listeners)[e.data.type]();
        }
    });
    __classPrivateFieldSet(this, _a, [], "f", _Thread_queue);
    __classPrivateFieldGet(this, _a, "f", _Thread_postQueue).forEach(e => {
        Thread.post(e.message, e.data, e.id);
    });
    __classPrivateFieldSet(this, _a, [], "f", _Thread_postQueue);
}, _Thread_isTransferable = function _Thread_isTransferable(data) {
    return data instanceof OffscreenCanvas ||
        data instanceof ImageBitmap ||
        data instanceof MessagePort ||
        data instanceof ReadableStream ||
        data instanceof WritableStream ||
        data instanceof TransformStream ||
        //data instanceof VideoFrame || 
        data instanceof ArrayBuffer;
}, _Thread_getTransferable = function _Thread_getTransferable(data) {
    if (__classPrivateFieldGet(Thread, _a, "m", _Thread_isTransferable).call(Thread, data)) {
        return [data];
    }
    if (!data || typeof data !== 'object' || !Object.keys(data).length) {
        return [];
    }
    const transferable = [];
    Object.values(data).forEach(e => {
        if (__classPrivateFieldGet(Thread, _a, "m", _Thread_isTransferable).call(Thread, e))
            transferable.push(e);
    });
    return transferable;
};
_Thread_listeners = { value: {} };
_Thread_waiting = { value: false };
_Thread_queue = { value: [] };
_Thread_postQueue = { value: [] };
_Thread_threads = { value: {} };
export default Thread;
