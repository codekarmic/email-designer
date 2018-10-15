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
                this.target.removeAttribute('draggable');
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

            if (this.type === "dragenter" && instance.dragging) {
                // enables dropzones when dragging
                if (this.target.dataset.state === 'drop') {
                    if (this.target !== dragged.parentNode) {
                        this.preventDefault();
                        this.target.style.borderStyle = "dashed";
                        this.target.style.borderColor = "rgba(255,255,255,.8)";
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
                if (this.target !== dragged.parentNode
                    && this.target.dataset.state === 'drop') {
                    this.target.style.borderStyle = "";
                    this.target.style.borderColor = "";
                }

                // run user callback
                runCallBack("dragleave",params);
            }

            if (this.type === "drop"
                && !this.target.dataset.append) {
                if (this.target !== dragged.parentNode) {
                    dragged.removeAttribute('draggable');
                    let clone = dragged.cloneNode(true);
                    dragging = false;

                    switch(dragged.dataset.method) {
                        case 'move':
                            this.target.appendChild(dragged);
                            break;

                        case 'copy':
                            appendNode(clone,this.target.querySelector('.email-container'));
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

    let setAppendEvents = function(blocks)
    {
        blocks.block.addEventListener('mouseenter', function(evt) {
            blocks.block.style.zIndex = "2";
        });

        blocks.block.addEventListener('mouseleave', function(evt) {
            blocks.block.style.zIndex = "";
        });

        blocks.deleteBlock.addEventListener('click', function(evt) {
            blocks.block.remove();
        });

        [blocks.dropBefore,blocks.dropAfter].forEach(function(el){
            let eventHandle;
            let eventFunc = function(evt) 
            {

                if (this.type === "dragenter") {
                    if (instance.dragging) {
                        this.preventDefault();
                        this.target.style.background = "red";
                    }
                }

                if (this.type === "dragover") {
                    if (instance.dragging) {
                        this.preventDefault();
                    }
                }

                if (this.type === "dragleave") {
                    if (instance.dragging) {
                        this.target.style.background = "";
                    }
                }

                if (this.type === "drop") {
                    if (instance.dragging) {
                        this.target.style.background = "";
                        
                        if (this.target.dataset.append) {
                            let dragged = document.querySelectorAll('*[data-state="drag"]')[instance.dragkey];
                            dragged.removeAttribute('draggable');
                            let clone = dragged.cloneNode(true);
                            dragging = false;

                            if (this.target.dataset.append === "before") {
                                appendNode(clone,document.querySelector('.email-container'),"before",blocks.block);
                            } else {
                                appendNode(clone,document.querySelector('.email-container'),"after",blocks.block);
                            }
                        }
                    }
                }

                this.target.removeEventListener(this.type, eventHandle);
                this.target.addEventListener(this.type, eventHandle);
            }

            el.addEventListener('dragenter', function onDragEnter(evt) {
                eventHandle = onDragEnter;
                eventFunc.call(evt);
            });

            el.addEventListener('dragover', function onDragOver(evt) {
                eventHandle = onDragOver;
                eventFunc.call(evt);
            });

            el.addEventListener('dragleave', function onDragLeave(evt) {
                eventHandle = onDragLeave;
                eventFunc.call(evt);
            });

            el.addEventListener('drop', function onDrop(evt) {
                eventHandle = onDrop;
                eventFunc.call(evt);
            });
        });
    }

    // Private

    let appendNode = function(clone,dropzone,placement,sibling)
    {
        // create wrapper div + controls
        let block = document.createElement('div');
        let dropBefore = document.createElement('div');
        let dropAfter = document.createElement('div');
        let deleteBlock = document.createElement('div');
        let moveBlock = document.createElement('div');

        // assign classes + data attributes
        block.classList.add('block');
        dropBefore.dataset.append = "before";
        dropAfter.dataset.append = "after";
        deleteBlock.dataset.blockaction = "delete";
        moveBlock.dataset.blockaction = "move";

        // set control events
        setAppendEvents({
            block:block,
            deleteBlock:deleteBlock,
            dropAfter:dropAfter,
            dropBefore:dropBefore,
            moveBlock:moveBlock,
        });
        
        // remove drag attributes
        clone.removeAttribute('data-state');
        clone.removeAttribute('data-method');

        // append to dropzone
        block.appendChild(dropBefore);
        block.appendChild(deleteBlock);
        block.appendChild(clone);
        block.appendChild(dropAfter);

        switch (placement) {
            case 'before':
                dropzone.insertBefore(block,sibling);
                break;
            case 'after':
                if(sibling.nextElementSibling) {
                    dropzone.insertBefore(block,sibling.nextElementSibling);
                } else {
                    dropzone.appendChild(block);
                }
                break;
            default:
                dropzone.appendChild(block);
                break;
        }
    }

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