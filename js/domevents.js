let DOMEvents = function() {
    let instance = this;
    this.draggables = document.querySelectorAll('*[data-state="drag"]');
    this.dropzones = document.querySelectorAll('*[data-state="drop"]');
    this.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    this.dragging;
    this.dragged;

    this.setEvents = function(el,events)
    {
        let eventHandle;
        let eventFunc = function(evt) 
        {
            let params = {
                self : this,
                type : this.type,
                target : this.target,
            }

            if (events[this.type]) {
                events[this.type].call(this);
            }

            this.target.removeEventListener(this.type, eventHandle);
            this.target.addEventListener(this.type, eventHandle);
        }

        Object.keys(events).forEach(function(event){
            el.addEventListener(event, function func(evt) {
                eventHandle = func;
                eventFunc.call(evt);
            });
        });
    }
}