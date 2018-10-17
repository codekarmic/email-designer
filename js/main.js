document.addEventListener('DOMContentLoaded', function(evt) {
	let dragdrop = new DragDrop();

    // set drag events
    Object.keys(dragdrop.draggables).forEach(function(key) {
        dragdrop.setEvents(dragdrop.draggables[key],{
            dragstart : function()
            {
                let dt = this.dataTransfer;

                if (!dragdrop.isIE11) {
                    // removes ghost image on cursor (Firefox/Chrome)
                    dt.setDragImage(new Image(), 0, 0);

                    // initiates drag events (Firefox only)
                    dt.setData('key', '');
                }

                // set handle for dragged element
                dragdrop.dragged = this.target;

                // switch dragging flag to true
                dragdrop.dragging = true;

                // show dropzones
                document.querySelectorAll('*[data-state="drop"],*[data-append]').forEach(function(dropzone) {
					dropzone.classList.add('highlight');
                });
            },
            dragend : function()
            {
                this.target.removeAttribute('draggable');

                // switch dragging flag to false
                dragdrop.dragging = false;

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
    Object.keys(dragdrop.dropzones).forEach(function(key) {
        dragdrop.setEvents(dragdrop.dropzones[key],{
            dragenter : function() {
                // enables dropzones when dragging
                if (this.target.dataset.state === 'drop') {
                    if (this.target !== dragdrop.dragged.parentNode) {
                        this.preventDefault();
                    }
                }
            },
            dragover : function()
            {
                // enables dropzones when dragging
                if(this.target.dataset.state === 'drop') {
                    if (this.target !== dragdrop.dragged.parentNode) {
                        this.preventDefault();
                    }
                }
            },
            dragleave : function()
            {
                if (this.target !== dragdrop.dragged.parentNode
                    && this.target.dataset.state === 'drop') {
                }
            },
            drop : function()
            {
                if (this.target !== dragdrop.dragged.parentNode
                    && !this.target.dataset.append) {
                    dragdrop.dragged.removeAttribute('draggable');
                    let clone = dragdrop.dragged.cloneNode(true);
                    dragging = false;

                    switch(dragdrop.dragged.dataset.method) {
                        case 'move':
                            this.target.appendChild(dragdrop.dragged);
                            break;

                        case 'copy':
                            dragdrop.copyDrag(clone,this.target.querySelector('.email-container'));
                            break;
                    }

                    this.target.style.outlineStyle = "";
                    this.target.style.background = "";

                    // switch dragging flag to true
                    dragdrop.dragging = true;

                    // Remove initial instructions
                    if (document.querySelector('.initial-block')) {
						document.querySelector('.initial-block').classList.remove('initial-block');
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
});