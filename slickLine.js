$.fn.slickLine = function(ops){

	//BUILD THE OPTIONS
	var options = $.extend(true, {
		hoverClass 		: $(this).attr('data-sl-hoverclass') ? $(this).attr('data-sl-hoverclass') : 'slick-line-source-active',
		dropShadow 		: $(this).attr('data-sl-dropshadow') ? $(this).attr('data-sl-dropshadow') : '0px 4px 2px rgba(0, 0, 0, .7)',
		zIndex 			: $(this).attr('data-sl-zindex') ? $(this).attr('data-sl-zindex') : '2',
		targetScroll 	: $(this).attr('data-sl-target-scroll') ? $(this).attr('data-sl-target-scroll') : 'center',
		targetFocus  	: $(this).attr('data-sl-target-focus') == 'false' ? false : true,
		lineWidth 		: $(this).attr('data-sl-width') ? $(this).attr('data-sl-width') : '1',
		lineColor 		: $(this).attr('data-sl-color') ? $(this).attr('data-sl-color') : '#000000',
		lineClass 		: $(this).attr('data-sl-lineclass') ? $(this).attr('data-sl-lineclass') : 'slick-line-active-line',
		targetClass 	: $(this).attr('data-sl-targetclass') ? $(this).attr('data-sl-targetclass') : 'slick-line-target-active',
	}, ops);

	//DEFINE THE TARGET OR BAIL IF NO TARGET WAS FOUND
	try{
		var target  = $($(this).attr('data-sl-target'));
		if(!$(target).length) return $(this);
	}
	catch{
		return $(this);
	}	

	//CHECK IF A DOM OBJECT IS VISIBLE
	var isRendered = function(domObj) {
	    if((domObj.nodeType != 1) || (domObj == document.body)) return true;
	    if (domObj.currentStyle && domObj.currentStyle["display"] != "none" && domObj.currentStyle["visibility"] != "hidden")  return isRendered(domObj.parentNode);
	    else if(window.getComputedStyle){
	        var cs = document.defaultView.getComputedStyle(domObj, null);
	        if (cs.getPropertyValue("display") != "none" && cs.getPropertyValue("visibility") != "hidden")  return isRendered(domObj.parentNode);
	    }
	    return false;
	}

	//IGNORE ELEMENTS THAT HAVE ALREADY BEEN INITIALIZED
	if($(this).hasClass('slickLine-initialized')) return $(this);

	//SEND BACK THE ELEMENT
	return $(this)

		//FLAG THIS ELEMENT AS INITIALIZED
		.addClass('slickLine-initialized')

		//LISTEN FOR HOVER
		.on('mouseenter.HoverOverDrawLine', function(){

			var target  = $($(this).attr('data-sl-target'));

			//BUILD THE OPTIONS
			var options = $.extend(true, {
				hoverClass 		: $(this).attr('data-sl-hoverclass') ? $(this).attr('data-sl-hoverclass') : 'slick-line-source-active',
				dropShadow 		: $(this).attr('data-sl-dropshadow') ? $(this).attr('data-sl-dropshadow') : '0px 4px 2px rgba(0, 0, 0, .7)',
				zIndex 			: $(this).attr('data-sl-zindex') ? $(this).attr('data-sl-zindex') : '2',
				targetScroll 	: $(this).attr('data-sl-target-scroll') ? $(this).attr('data-sl-target-scroll') : 'center',
				targetFocus  	: $(this).attr('data-sl-target-focus') == 'false' ? false : true,
				lineWidth 		: $(this).attr('data-sl-width') ? $(this).attr('data-sl-width') : '1',
				lineColor 		: $(this).attr('data-sl-color') ? $(this).attr('data-sl-color') : '#000000',
				lineClass 		: $(this).attr('data-sl-lineclass') ? $(this).attr('data-sl-lineclass') : 'slick-line-active-line',
				targetClass 	: $(this).attr('data-sl-targetclass') ? $(this).attr('data-sl-targetclass') : 'slick-line-target-active',
			}, ops);

			//FIRE THE BEFORE RENDER EVENT
			$(this).trigger('slickLine.beforeRender', [$(target)]);
		
			//ADD AN SVG LINE IF WE NEED TO
			if(!$(this).data('slickLineWrapper')){

				//BUILD THE WRAPPER
				var slickLineWrapper = $('<svg class="slick-line-wrapper" xmlns="http://www.w3.org/2000/svg"></svg>').css({
					'left'			: '0px',
					'top' 			: '0px',
					'position' 		: 'fixed',
					'margin' 		: '0',
					'pointer-events': 'none',
					'overflow' 		: 'visible',
					'filter' 		: 'drop-shadow('+options.dropShadow+')',
					'z-index' 		: options.zIndex
				}).appendTo('body');

				//SET THIS ELEMENT TO REMEMBER THE WRAPPER
				$(this).data('slickLineWrapper', $(slickLineWrapper));
			}

			//CHECK IF THE TARGET EXISTS
			if($(target).length){

				//CHECK IF WE NEED TO SCROLL THE TARGET INTO VIEW
				if(options.targetScroll) $(target)[0].scrollIntoView({block: options.targetScroll});

				//CHECK IF THE TARGET IS VISIBLE
				if($(target).is(':visible') && isRendered($(target)[0])){

					//FOCUS THE TARGET IF NEEDED
					if(options.targetFocus) $(target).focus();

					//SET THE TARGET ACTIVE CLASS
					$(target).addClass(options.targetClass);

					//ADD THE HOVER CLASS
					$(this).addClass(options.hoverClass);

					//GET COORDINATES
					var c1 	= $(this)[0].getBoundingClientRect();
					var c2 	= $(target)[0].getBoundingClientRect();
					var b1 	= c1.left < (c2.left + c2.width) ? c2 : c1;
					var b2 	= c1.left < (c2.left + c2.width) ? c1 : c2;

					//BUILD THE LINE
					var svgLine = $(document.createElementNS('http://www.w3.org/2000/svg', 'line')).attr('x1', b1.left).attr('y1', (b1.top + b1.height / 2)).attr('x2', b2.left + b2.width).attr('y2', (b2.top + b2.height / 2)).css({'stroke': options.lineColor, 'stroke-width': options.lineWidth}).addClass(options.lineClass);

					//ADD THE LINE
					$(this).data('slickLineWrapper').empty().append(svgLine);

					//FIRE THE AFTER RENDER EVENT
					$(this).trigger('slickLine.afterRender', [$(target), $(svgLine)]);

					//BAIL OUT
					return;
				}
			}

			//FIRE THE AFTER RENDER METHOD
			$(this).trigger('slickLine.afterRender', [$(target), $(this).data('slickLineWrapper').find('line')]);
		})

		//LISTEN FOR HOVER OUT
		.on('mouseleave.HoverOverDrawLineLeave', function(){

			//FIRE THE BEFORE REMOVE EVENT
			$(this).trigger('slickLine.beforeRemove', [$(target)]);

			//REMOVE THE HOVER CLASS
			$(this).removeClass(options.hoverClass);

			//REMOVE THE ACTIVE CLASS FROM THE TARGET
			$(target).removeClass(options.targetClass);

			//REMOVE THE LINE
			$(this).data('slickLineWrapper').empty();

			//FIRE THE AFTER REMOVE EVENT
			$(this).trigger('slickLine.afterRemove', [$(target)]);
		});
};

//WAIT FOR THE DOCUMENT TO BE READY
$(document).ready(function(){

	//INITIALIZE THE SLICK LINE ELEMENTS
	$('.slickLine:not(.slickLine-initialized)').slickLine();

	$(document).off('mouseenter.SlickLineInit').on('mouseenter.SlickLineInit', '.slickLine:not(.slickLine-initialized)', function(){
		$(this).slickLine();
	});
});

