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

let DragDrop = function() {
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

        }

        Object.keys(events).forEach(function(event){
            el.addEventListener(event, function func(evt) {
                eventHandle = func;
                eventFunc.call(evt);
            });
        });
    }

    this.setAppendEvents = function(components)
    {
        // Block actions

        instance.setEvents(components.block,{
            mouseenter : function()
            {
                components.block.style.zIndex = "2";
            },
            mouseleave : function()
            {
                components.block.style.zIndex = "";
            },
        });

        // Delete actions

        instance.setEvents(components.deleteBlock,{
            click : function()
            {
                components.block.remove();
            }
        });

        // Move actions

        instance.setEvents(components.moveBlock, {
            mousedown : function()
            {
               components.moveBlock.draggable = true;
               components.block.dataset.method = "move";
            },
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
                instance.dragged = components.block;

                // switch dragging flag to true
                instance.dragging = true;
            },
            dragend : function()
            {
                components.moveBlock.removeAttribute('draggable');
                components.block.removeAttribute('data-method');

                // switch dragging flag to false
                instance.dragging = false;
            }
        });

        // Append actions

        [components.dropBefore,components.dropAfter].forEach(function(el){
            instance.setEvents(el,{
                dragenter : function()
                {
                    if (instance.dragging
                        && instance.dragged !== components.block) {
                        this.preventDefault();
                        this.target.style.background = "rgba(75,75,200,.8)";
                    }
                },
                dragover : function()
                {
                    if (instance.dragging
                        && instance.dragged !== components.block) {
                        this.preventDefault();
                    }
                },
                dragleave : function()
                {
                    if (instance.dragging
                        && instance.dragged !== components.block) {
                        this.target.style.background = "";
                    }
                },
                drop : function()
                {
                    if (instance.dragging
                        && instance.dragged !== components.block) {
                        this.target.style.background = "";
                        
                        switch (instance.dragged.dataset.method) {
                            case "move":
                                if (this.target.dataset.append === "before") {
                                    instance.moveDrag(instance.dragged,document.querySelector('.email-container'),"before",components.block);
                                } else {
                                    instance.moveDrag(instance.dragged,document.querySelector('.email-container'),"after",components.block);
                                }
                            break;

                            case "copy":
                                instance.dragged.removeAttribute('draggable');
                                let clone = instance.dragged.cloneNode(true);
                                dragging = false;

                                if (this.target.dataset.append === "before") {
                                    instance.copyDrag(clone,document.querySelector('.email-container'),"before",components.block);
                                } else {
                                    instance.copyDrag(clone,document.querySelector('.email-container'),"after",components.block);
                                }
                            break;
                        }
                    }
                }
            });
        });
    }

    this.copyDrag = function(clone,container,placement,sibling)
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
        deleteBlock.dataset.method = "delete";
        moveBlock.dataset.method = "move";
        editBlock.dataset.method = "edit";

        // set control events
        instance.setAppendEvents({
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

        // build block structure
        block.appendChild(dropBefore);
        blockControls.appendChild(moveBlock);
        blockControls.appendChild(editBlock);
        blockControls.appendChild(deleteBlock);
        block.appendChild(blockControls);
        block.appendChild(clone);
        block.appendChild(dropAfter);

        switch (placement) {
            case 'before':
                container.insertBefore(block,sibling);
            break;

            case 'after':
                if(sibling.nextElementSibling) {
                    container.insertBefore(block,sibling.nextElementSibling);
                } else {
                    container.appendChild(block);
                }
            break;

            default:
                container.appendChild(block);
            break;
        }
    }

    this.moveDrag = function(block,container,placement,sibling)
    {
        switch (placement) {
            case 'before':
                container.insertBefore(block,sibling);
            break;

            case 'after':
                if(sibling.nextElementSibling) {
                    container.insertBefore(block,sibling.nextElementSibling);
                } else {
                    container.appendChild(block);
                }
            break;

            default:
                container.appendChild(block);
            break;
        }
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
}