document.addEventListener('DOMContentLoaded', function(evt) {
	let dragdrop = new DragDrop({
		drop : function(params) 
		{
			if (document.querySelector('.initial-block')) {
				document.querySelector('.initial-block').classList.remove('initial-block');
			}

			// Make all text editable
			// params.target.querySelectorAll('tr').forEach(function(el) {
			// 	el.setAttribute('contenteditable','true');
			// });
		}
	});
	dragdrop.init();
});