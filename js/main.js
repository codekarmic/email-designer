document.addEventListener('DOMContentLoaded', function(evt) {
	let dragdrop = new DragDrop({
		drop : function(params) 
		{
			if (params.target.classList) {
				params.target.classList.remove("initial-block");
			}

			// Make all text editable
			// params.target.querySelectorAll('tr').forEach(function(el) {
			// 	el.setAttribute('contenteditable','true');
			// });
		},
	});
	dragdrop.init();
});