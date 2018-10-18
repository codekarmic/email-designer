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

document.addEventListener('DOMContentLoaded', function(evt) {
	let devents = new DOMEvents();

    // set drag events
    Object.keys(devents.draggables).forEach(function(key) {
        devents.setEvents(devents.draggables[key],{
            dragstart : function()
            {
                let dt = this.dataTransfer;

                if (!devents.isIE11) {
                    // removes ghost image on cursor (Firefox/Chrome)
                    dt.setDragImage(new Image(), 0, 0);

                    // initiates drag events (Firefox only)
                    dt.setData('key', '');
                }

                // set handle for dragged element
                devents.dragged = this.target;

                // switch dragging flag to true
                devents.dragging = true;

                // show dropzones
                document.querySelectorAll('*[data-state="drop"],*[data-append]').forEach(function(dropzone) {
					dropzone.classList.add('highlight');
                });
            },
            dragend : function()
            {
                this.target.removeAttribute('draggable');

                // switch dragging flag to false
                devents.dragging = false;

                // hide dropzones
                document.querySelectorAll('*[data-state="drop"],*[data-append]').forEach(function(dropzone) {
					dropzone.classList.remove('highlight');
                });
            },
            mousedown : function()
            {
                this.target.draggable = true;
                console.log(this.target);
            },
        });
    });

    // set dropzone events
    Object.keys(devents.dropzones).forEach(function(key) {
        devents.setEvents(devents.dropzones[key],{
            dragenter : function() {
                // enables dropzones when dragging
                if (this.target.dataset.state === 'drop') {
                    if (this.target !== devents.dragged.parentNode) {
                        this.preventDefault();
                    }
                }
            },
            dragover : function()
            {
                // enables dropzones when dragging
                if(this.target.dataset.state === 'drop') {
                    if (this.target !== devents.dragged.parentNode) {
                        this.preventDefault();
                    }
                }
            },
            dragleave : function()
            {
                if (this.target !== devents.dragged.parentNode
                    && this.target.dataset.state === 'drop') {
                }
            },
            drop : function()
            {
                if (this.target !== devents.dragged.parentNode
                    && !this.target.dataset.append) {
                    devents.dragged.removeAttribute('draggable');
                    let clone = devents.dragged.cloneNode(true);
                    dragging = false;

                    switch(devents.dragged.dataset.method) {
                        case 'move':
                            this.target.appendChild(devents.dragged);
                            break;

                        case 'copy':
                            copyDrag(clone,this.target.querySelector('.email-container'));
                            break;
                    }

                    this.target.style.outlineStyle = "";
                    this.target.style.background = "";

                    // switch dragging flag to true
                    devents.dragging = true;

                    // Remove initial instructions
                    if (document.querySelector('.initial-display')) {
						document.querySelector('.initial-display').classList.remove('initial-display');
					}

					// hide dropzones
		            document.querySelectorAll('*[data-state="drop"],*[data-append]').forEach(function(dropzone) {
						dropzone.classList.remove('highlight');
		            });

					// Make all text editable
					// params.target.querySelectorAll('tr').forEach(function(el) {
					// 	el.setAttribute('contenteditable','true');
					// });
                }
            },
        });
    });

    // display area resize events

    document.querySelectorAll('.resize').forEach(function(el)
    {
    	devents.setEvents(el,
    	{
    		mousedown : function()
    		{
    			devents.mouseDown = 1;
    			devents.xPos = this.clientX;
    			devents.resized = this.target;
    		},
    		mousemove : function()
    		{
    			this.target.style.cursor = "e-resize";
    		}
    	});
    });

    // document resize listener

    devents.setEvents(document,
    {
    	mousedown : function()
    	{
    		if (devents.resized) {
    			devents.resized.parentNode.style.flex = "0 0 " + this.clientX + "px";
    		}
    	},
		mousemove : function()
		{
			if (devents.resized && devents.mouseDown) {
				devents.resized.parentNode.style.flex = "0 0 " + this.clientX + "px";
			}

			if (devents.resized && devents.resized.parentNode.offsetWidth < 650) 
			{
				document.querySelector('#displayarea').classList.add('mobile');

			} else if(devents.resized && devents.resized.parentNode.offsetWidth >= 650) 
			{
				document.querySelector('#displayarea').classList.remove('mobile');
			}
		},
		mouseup : function()
		{
			devents.mouseDown = 0;
			devents.resized = undefined;
		}
    });

    var setAppendEvents = function(components)
    {
        // Block hover state

        devents.setEvents(components.block,{
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

        devents.setEvents(components.deleteBlock,{
            click : function()
            {
                components.block.remove();
            }
        });

        // Move actions

        devents.setEvents(components.moveBlock, {
            mousedown : function()
            {
               components.moveBlock.draggable = true;
               components.block.dataset.method = "move";
            },
            dragstart : function()
            {
                let dt = this.dataTransfer;

                if (!devents.isIE11) {
                    // removes ghost image on cursor (Firefox/Chrome)
                    dt.setDragImage(new Image(), 0, 0);

                    // initiates drag events (Firefox only)
                    dt.setData('key', '');
                }

                // set handle for dragged element
                devents.dragged = components.block;

                // switch dragging flag to true
                devents.dragging = true;

                // show dropzones
                document.querySelectorAll('*[data-append]').forEach(function(dropzone){
                    dropzone.style.background = "rgba(75,75,200,.8)";
                });
            },
            dragend : function()
            {
                components.moveBlock.removeAttribute('draggable');
                components.block.removeAttribute('data-method');

                // switch dragging flag to false
                devents.dragging = false;

                // hide dropzones
                document.querySelectorAll('*[data-append]').forEach(function(dropzone){
                    dropzone.style.background = "";
                });
            }
        });

        // Append actions

        [components.dropBefore,components.dropAfter].forEach(function(el){
            devents.setEvents(el,{
                dragenter : function()
                {
                    if (devents.dragging
                        && devents.dragged !== components.block) {
                        this.preventDefault();
                    }
                },
                dragover : function()
                {
                    if (devents.dragging
                        && devents.dragged !== components.block) {
                        this.preventDefault();
                    }
                },
                dragleave : function()
                {
                    if (devents.dragging
                        && devents.dragged !== components.block) {
                    }
                },
                drop : function()
                {
                    if (devents.dragging
                        && devents.dragged !== components.block) {
                        this.target.style.background = "";
                        
                        switch (devents.dragged.dataset.method) {
                            case "move":
                                if (this.target.dataset.append === "before") {
                                    moveDrag(devents.dragged,document.querySelector('.email-container'),"before",components.block);
                                } else {
                                    moveDrag(devents.dragged,document.querySelector('.email-container'),"after",components.block);
                                }
                            break;

                            case "copy":
                                devents.dragged.removeAttribute('draggable');
                                let clone = devents.dragged.cloneNode(true);
                                dragging = false;

                                if (this.target.dataset.append === "before") {
                                    copyDrag(clone,document.querySelector('.email-container'),"before",components.block);
                                } else {
                                    copyDrag(clone,document.querySelector('.email-container'),"after",components.block);
                                }
                            break;
                        }

                        // hide dropzones
                        document.querySelectorAll('*[data-append]').forEach(function(dropzone){
                            dropzone.style.background = "";
                        });
                    }
                }
            });
        });
    }

    var copyDrag = function(clone,container,placement,sibling)
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
        blockControls.classList.add('block-controls');
        deleteBlock.dataset.method = "delete";
        moveBlock.dataset.method = "move";
        editBlock.dataset.method = "edit";
        dropBefore.dataset.append = "before";
        dropAfter.dataset.append = "after";

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

    var moveDrag = function(block,container,placement,sibling)
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

    var getKey = function(el,collection)
    {
        let key;

        Object.keys(collection).forEach(function(index){
            if (collection[index] === el) {
                key = index;
            }
        });

        return key;
    }
});