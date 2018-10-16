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
    this.dragging;
    this.dragged;
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
            instance.setEvents(instance.draggables[key],{
                dragstart : function()
                {
                    let dt = this.dataTransfer;

                    if (!instance.isIE11) {
                        // removes ghost image on cursor (Firefox/Chrome)
                        dt.setDragImage(new Image(), 0, 0);

                        // initiates drag events (Firefox only)
                        dt.setData('key', '');
                    }

                    // set handle for dragged element
                    instance.dragged = this.target;

                    // switch dragging flag to true
                    instance.dragging = true;
                },
                drag : function()
                {

                },
                dragend : function()
                {
                    this.target.removeAttribute('draggable');

                    // switch dragging flag to false
                    instance.dragging = false;
                },
                mousedown : function()
                {
                    this.target.draggable = true;
                },
            });
        });

        // set drop events on drop zones
        Object.keys(instance.dropzones).forEach(function(key) {
            instance.setEvents(instance.dropzones[key],{
                dragenter : function() {
                    // enables dropzones when dragging
                    if (this.target.dataset.state === 'drop') {
                        if (this.target !== instance.dragged.parentNode) {
                            this.preventDefault();
                            this.target.style.outlineStyle = "dashed";
                            this.target.style.outlineColor = "rgba(100,100,100,.8)";
                        }
                    }
                },
                dragover : function()
                {
                    // enables dropzones when dragging
                    if(this.target.dataset.state === 'drop') {
                        if (this.target !== instance.dragged.parentNode) {
                            this.preventDefault();
                        }
                    }
                },
                dragleave : function()
                {
                    if (this.target !== instance.dragged.parentNode
                        && this.target.dataset.state === 'drop') {
                        this.target.style.outlineStyle = "";
                        this.target.style.outlineColor = "";
                    }
                },
                drop : function()
                {
                    if (this.target !== instance.dragged.parentNode
                        && !this.target.dataset.append) {
                        instance.dragged.removeAttribute('draggable');
                        let clone = instance.dragged.cloneNode(true);
                        dragging = false;

                        switch(instance.dragged.dataset.method) {
                            case 'move':
                                this.target.appendChild(instance.dragged);
                                break;

                            case 'copy':
                                appendNode(clone,this.target.querySelector('.email-container'));
                                break;
                        }

                        this.target.style.outlineStyle = "";
                        this.target.style.background = "";

                        // switch dragging flag to true
                        instance.dragging = true;
                    }
                },
            });
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

            // run user callback
            runCallBack(this.type, params);

        }

        Object.keys(events).forEach(function(event){
            el.addEventListener(event, function func(evt) {
                eventHandle = func;
                eventFunc.call(evt);
            });
        });
    }

    let setAppendEvents = function(blocks)
    {
        // Block actions

        instance.setEvents(blocks.block,{
            mouseenter : function()
            {
                blocks.block.style.zIndex = "2";
            },
            mouseleave : function()
            {
                blocks.block.style.zIndex = "";
            },
        });

        // Delete actions

        instance.setEvents(blocks.deleteBlock,{
            click : function()
            {
                blocks.block.remove();
            }
        });

        // Move actions

        instance.setEvents(blocks.moveBlock,{
            mousedown : function()
            {
               evt.target.draggable = true; 
            },
            dragstart : function()
            {
                let dt = evt.dataTransfer;

                if (!instance.isIE11) {
                    // removes ghost image on cursor (Firefox/Chrome)
                    dt.setDragImage(new Image(), 0, 0);

                    // initiates drag events (Firefox only)
                    dt.setData('key', '');
                }

                instance.dragged = this.target;

                // switch dragging flag to true
                instance.dragging = true;
            },
            drag : function()
            {
                // ...
            },
            dragend : function()
            {
                this.target.removeAttribute('draggable');

                // switch dragging flag to false
                instance.dragging = false;
            }
        });

        // Append actions

        [blocks.dropBefore,blocks.dropAfter].forEach(function(el){
            instance.setEvents(el,{
                dragenter : function()
                {
                    if (instance.dragging) {
                        this.preventDefault();
                        this.target.style.background = "rgba(75,75,200,.8)";
                    }
                },
                dragover : function()
                {
                    if (instance.dragging) {
                        this.preventDefault();
                    }
                },
                dragleave : function()
                {
                    if (instance.dragging) {
                        this.target.style.background = "";
                    }
                },
                drop : function()
                {
                    if (instance.dragging) {
                        this.target.style.background = "";
                        
                        if (this.target.dataset.append) {
                            instance.dragged.removeAttribute('draggable');
                            let clone = instance.dragged.cloneNode(true);
                            dragging = false;

                            if (this.target.dataset.append === "before") {
                                appendNode(clone,document.querySelector('.email-container'),"before",blocks.block);
                            } else {
                                appendNode(clone,document.querySelector('.email-container'),"after",blocks.block);
                            }
                        }
                    }
                }
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
        let blockControls = document.createElement('div');
        let deleteBlock = document.createElement('div');
        let moveBlock = document.createElement('div');
        let editBlock = document.createElement('div');

        // assign classes + data attributes
        block.classList.add('block');
        dropBefore.dataset.append = "before";
        dropAfter.dataset.append = "after";
        blockControls.classList.add('block-controls');
        deleteBlock.dataset.blockaction = "delete";
        moveBlock.dataset.blockaction = "move";
        editBlock.dataset.blockaction = "edit";

        // set control events
        setAppendEvents({
            block:block,
            deleteBlock:deleteBlock,
            moveBlock:moveBlock,
            editBlock:editBlock,
            dropAfter:dropAfter,
            dropBefore:dropBefore,
        });
        
        // remove drag attributes
        clone.removeAttribute('data-state');
        clone.removeAttribute('data-method');

        // append to dropzone
        block.appendChild(dropBefore);
        blockControls.appendChild(moveBlock);
        blockControls.appendChild(editBlock);
        blockControls.appendChild(deleteBlock);
        block.appendChild(blockControls);
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