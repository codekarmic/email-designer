// ForEach Nodelist Polyfill IE
// https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#Polyfill
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (let i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
      }
  };
}

let DragDrop = function(o) {
    let instance = this;
    this.draggables = document.querySelectorAll('*[data-state="drag"]');
    this.dropzones = document.querySelectorAll('*[data-state="drop"]');
    this.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    this.dragkey;
    this.dragging;
    this.opts = o;
    this.settings = {
        dragstart      : function(){},
        dragenter      : function(){},
        drag           : function(){},
        dragover       : function(){},
        dragleave      : function(){},
        dragend        : function(){},
        drop           : function(){},
        touchstart     : function(){},
        touchmove      : function(){},
        touchhover     : function(){},
        touchend       : function(){},
        mousedown      : function(){},
    };


    // Public

    this.init = function() 
    {
        // set options
        instance.setOpts(instance.opts).call(instance);

        // set drag events on draggables
        Object.keys(instance.draggables).forEach(function(key) {
            instance.setDragEvents.call(instance.draggables[key]);
        });

        // set drop events on drop zones
        Object.keys(instance.dropzones).forEach(function(key) {
            instance.setDropEvents.call(instance.dropzones[key]);
        });
    };

    this.setOpts = function func(o)
    {
        let opts = (o) ? o : this.settings;

        // set user options
        Object.keys(opts).forEach(function(key) {
            (opts[key] !== null) ? instance.settings[key] = opts[key] : ''; 
        });

        return func;
    };

    this.setDragEvents = function() 
    {
        let eventHandle;
        let eventFunc = function(evt) 
        {
            let key = getKey(this.target,document.querySelectorAll('*[data-state="drag"]'));
            let params = {
                self : this,
                type : this.type,
                target : this.target,
            }

            if (this.type === "mousedown") {
                this.target.draggable = true;

                // run user callback
                runCallBack("mousedown",params);
            }

            if (this.type === "dragstart") {
                let dt = this.dataTransfer;

                if (!instance.isIE11) {
                    // removes ghost image on cursor (Firefox/Chrome)
                    dt.setDragImage(new Image(), 0, 0);

                    // initiates drag events (Firefox only)
                    dt.setData('key', '' + key);
                }

                // grab index of current element
                instance.dragkey = key;

                // switch dragging flag to true
                instance.dragging = true;

                // run user callback
                runCallBack("dragstart",params);
            }

            if (this.type === "drag") {
                // ...

                // run user callback
                runCallBack("drag",params);
            }

            if (this.type === "dragend") {
                this.target.draggable = false;
                instance.dragkey = key;

                // switch dragging flag to false
                instance.dragging = false;

                // run user callback
                runCallBack("dragend",params);
            }

            this.target.removeEventListener(this.type, eventHandle);
            this.target.addEventListener(this.type, eventHandle);
        }

        // Create event listeners

        this.addEventListener('mousedown', function onMouseDown(evt) {
            eventHandle = onMouseDown;
            eventFunc.call(evt);
        });

        this.addEventListener('dragstart', function onDragStart(evt) {
            eventHandle = onDragStart;
            eventFunc.call(evt);
        });

        this.addEventListener('drag', function onDrag(evt) {
            eventHandle = onDrag;
            eventFunc.call(evt);
        });

        this.addEventListener('dragend', function onDragEnd(evt) {
            eventHandle = onDragEnd;
            eventFunc.call(evt);
        });
    };

    this.setDropEvents = function()
    {
        let eventHandle;
        let eventFunc = function(evt) {
            let key = getKey(this.target,document.querySelectorAll('*[data-state="drop"]'));
            let dragged = document.querySelectorAll('*[data-state="drag"]')[instance.dragkey];
            let params = {
                self : this,
                type : this.type,
                target : this.target,
            }

            // Disable drag if true by default
            this.target.draggable = false;

            if (this.type === "dragenter" && instance.dragging) {
                // enables dropzones when dragging
                if (this.target.dataset.state === 'drop') {
                    if (this.target !== dragged.parentNode) {
                        this.preventDefault();
                        this.target.style.borderStyle = "dashed";
                        this.target.style.background = "rgba(200,200,200,.1)";
                    }
                }

                // run user callback
                runCallBack("dragenter",params);
            }

            if (this.type === "dragover" && instance.dragging) {
                // enables dropzones when dragging
                if(this.target.dataset.state === 'drop') {
                    if (this.target !== dragged.parentNode) {
                        this.preventDefault();
                    }
                }

                // run user callback
                runCallBack("dragover",params);
            }

            if (this.type === "dragleave") {
                if (this.target !== dragged.parentNode) {
                    this.target.style.borderStyle = "";
                    this.target.style.background = "";
                }

                // run user callback
                runCallBack("dragleave",params);
            }

            if (this.type === "drop") {
                if (this.target !== dragged.parentNode) {
                    dragged.draggable = false;
                    dragging = false;

                    switch(dragged.dataset.method) {
                        case 'move':
                            this.target.appendChild(dragged);
                            break;

                        case 'copy':
                            let clone = dragged.cloneNode(true);
                            clone.removeAttribute('data-state');
                            clone.removeAttribute('data-method');
                            this.target.appendChild(clone);
                            break;
                    }

                    this.target.style.borderStyle = "";
                    this.target.style.background = "";

                    // switch dragging flag to true
                    instance.dragging = true;

                    // run user callback
                    runCallBack("drop",params);
                }
            }

            this.target.removeEventListener(this.type, eventHandle);
            this.target.addEventListener(this.type, eventHandle);
        }

        // Create event listeners

        this.addEventListener('dragenter', function onDragEnter(evt) {
            eventHandle = onDragEnter;
            eventFunc.call(evt);
        });

        this.addEventListener('dragover', function onDragOver(evt) {
            eventHandle = onDragOver;
            eventFunc.call(evt);
        });

        this.addEventListener('dragleave', function onDragLeave(evt) {
            eventHandle = onDragLeave;
            eventFunc.call(evt);
        });

        this.addEventListener('drop', function onDrop(evt) {
            eventHandle = onDrop;
            eventFunc.call(evt);
        });
    }

    // Private

    let getKey = function(el,collection)
    {
        let key;

        Object.keys(collection).forEach(function(index){
            if (collection[index] === el) {
                key = index;
            }
        });

        return key;
    }

    let runCallBack = function func(callback,params)
    {
        // user defined callback
        if( instance.settings[callback] 
            && typeof instance.settings[callback] === "function") {
            instance.settings[callback](params);
        }

        return func;
    }
}