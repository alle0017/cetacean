export default class EventSystem {
    constructor() {
        this.events = {};
    }
    emit(event, data) {
        if (!(event in this.events))
            return;
        for (let i = 0; i < this.events[event].length; i++) {
            data ?
                this.events[event][i](data) :
                this.events[event][i]({});
        }
    }
    listen(event, handler) {
        if (!this.events[event])
            this.events[event] = [];
        this.events[event].push(handler);
        return handler;
    }
    remove(event, handler) {
        if (!(event in this.events))
            return;
        const handlerStr = handler.toString();
        const filtered = [];
        for (let i = 0; i < this.events[event].length; i++) {
            if (handlerStr !== this.events[event][i].toString())
                filtered.push(this.events[event][i]);
        }
        this.events[event] = filtered;
    }
}
