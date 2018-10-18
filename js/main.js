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
                            devents.copyDrag(clone,this.target.querySelector('.email-container'));
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

    // set resize events

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
		mousemove : function()
		{
			if (devents.resized && devents.mouseDown) {
				devents.resized.parentNode.style.flex = "0 1 " + this.clientX + "px";
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
});