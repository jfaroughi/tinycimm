/*
 *
 * image.js
 * Copyright (c) 2009 Richard Willis & Liam Gooding
 * MIT license  : http://www.opensource.org/licenses/mit-license.php
 * Project      : http://tinycimm.googlecode.com/
 * Contact      : willis.rh@gmail.com
 *
 */

function ImageDialog(){}
ImageDialog.prototype = new TinyCIMM('image');
ImageDialog.prototype.constructor = ImageDialog;

ImageDialog.prototype.preInit = function() {
	var images = ['../img/ajax-loader.gif', '../img/ajax-loader-sm.gif', '../img/progress.gif'];
	this.cacheImages(images);
}

ImageDialog.prototype.getImage = function(imageid, callback) {
	this.get(imageid, callback);
};

ImageDialog.prototype.fileBrowser = function(folder, offset, load, el, search_query){
	search_query = search_query || '';
	if (!load) {
		return;
	}
	if (typeof el == 'object') {
		tinyMCE.activeEditor.dom.select('img', el)[0].src = 'img/ajax-loader.gif';
	}
	this.getBrowser(folder, offset, search_query, function(){
		// bind hover event to thumbnail
		var thumb_images = tinyMCEPopup.dom.select('.thumb_wrapper');
		for(var image in thumb_images) {
			thumb_images[image].onmouseover = function(e){
				tinyMCE.activeEditor.dom.addClass(this, 'show');
				tinyMCE.activeEditor.dom.addClass(this, 'thumb_wrapper_over');
			}
			thumb_images[image].onmouseout = function(e){
				tinyMCE.activeEditor.dom.removeClass(this, 'show');
				tinyMCE.activeEditor.dom.removeClass(this, 'thumb_wrapper_over');
				tinyMCE.activeEditor.dom.addClass(this, 'thumb_wrapper');
			};
		}
	});
}

// inserts an image into the editor
ImageDialog.prototype.insertAndClose = function(image) {
	var ed = tinyMCEPopup.editor, f = document.forms[0], nl = f.elements, v, args = {}, el;

	tinyMCEPopup.restoreSelection();

	// Fixes crash in Safari
	(tinymce.isWebKit) && ed.getWin().focus();

	args = {
		src : this.baseURL(this.settings.tinycimm_assets_path+image.filename),
		alt : image.description,
		width : image.width,
		height : image.height
	};

	el = ed.selection.getNode();

	if (el && el.nodeName == 'IMG') {
		ed.dom.setAttribs(el, args);
	} else {
		ed.execCommand('mceInsertContent', false, '<img id="__mce_tmp" />', {skip_undo : 1});
		ed.dom.setAttribs('__mce_tmp', args);
		ed.dom.setAttrib('__mce_tmp', 'id', '');
		ed.undoManager.add();
	}

	tinyMCEPopup.close();
}
	
// either inserts the image into the image dialog, or into the editor	
ImageDialog.prototype.insertImage = function(thumbspan, imgsrc, alttext) {
	if (typeof thumbspan == 'object') {
		// show loading spinner and hide the controls
		tinyMCE.activeEditor.dom.addClass(thumbspan, 'showloader');
		var controls = tinyMCEPopup.dom.select('.controls, .controls-bg');
		for(var i in controls) { controls[i].style.display = 'none'; }
	}

	var win = tinyMCEPopup.getWindowArg("window");
	var URL = this.baseURL(this.settings.tinycimm_assets_path+imgsrc);

	if (win != undefined) {
		// insert into image dialog
		win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value = URL;
		if (typeof(win.ImageDialog) != "undefined") {
			if (win.ImageDialog.getImageData) {
				win.ImageDialog.getImageData();
			}
			if (win.ImageDialog.showPreviewImage) {
				win.ImageDialog.showPreviewImage(URL);
			}
			win.document.getElementById('alt').value = alttext;
		}
 		tinyMCEPopup.close();
	} else {
		// insert into editor
		this.insert(imgsrc.toId());
	}
	return;
}

ImageDialog.prototype.insertThumbnail = function(anchor, imgsrc){
	var _this = this, ed = tinyMCEPopup.editor, f = document.forms[0], nl = f.elements, v, args = {}, el, 
	width = this.settings.tinycimm_thumb_width, height = this.settings.tinycimm_thumb_height,
	url = this.baseURL(this.settings.tinycimm_controller+'image/save_image_size/'+imgsrc.toId()+'/'+width+'/'+height+'/90/0');

	// show spinner image
	if (typeof anchor == 'object' && anchor.nodeName == 'A') {
		anchor.style.background = 'url(img/ajax-loader-sm.gif) no-repeat center center';
	}

	// save the thumbnail size	
	tinymce.util.XHR.send({
		url : url,
		error : function(response) {
			tinyMCEPopup.editor.windowManager.alert('There was an error processing the request: '+response+"\nPlease try again.");
		},
		success : function(response) {
			var image = tinymce.util.JSON.parse(response);
			if (!image.outcome) {
				tinyMCEPopup.editor.windowManager.alert(obj.message); 
			} else { 
				// if an advimage dialog window is already open
				var origWin = tinyMCEPopup.getWindowArg("tinyMCEPopup");
				if (origWin != undefined) {
					origWin.close();
				}

				tinyMCEPopup.restoreSelection();

				// Fixes crash in Safari
				(tinymce.isWebKit) && ed.getWin().focus();

				args = {
					src : _this.baseURL(_this.settings.tinycimm_assets_path+image.filename),
					alt : image.description,
					title : image.description
				};

				el = ed.selection.getNode();
				// if a thumbnail is selected
				var anchor_parent = ed.dom.getParent(ed.selection.getNode(), 'A');
				if (anchor_parent) {
					// remove the thumb anchor
					tinyMCEPopup.dom.remove(anchor_parent);
				}
				// replace/insert the image thumbnail with anchor
				ed.execCommand('mceInsertContent', false, 
				'<a class="'+_this.settings.tinycimm_thumb_lightbox_class+'" '
				+'rel="'+_this.settings.tinycimm_thumb_lightbox_gallery+'" '
				+'href="'+_this.baseURL(_this.settings.tinycimm_assets_path+image.filename)+'">'
				+'<img id="__mce_tmp" /></a>', {skip_undo : 1});
				ed.dom.setAttribs('__mce_tmp', args);
				ed.dom.setAttrib('__mce_tmp', 'id', '');
				ed.undoManager.add();
				tinyMCEPopup.close();
			}
		}
	});

}


ImageDialog.prototype.loadUploader = function() {
	// load the uploader form
	if (!tinyMCEPopup.dom.get('upload_target_ajax').src) {
		tinyMCEPopup.dom.get('upload_target_ajax').src = this.baseURL(this.settings.tinycimm_controller+'image/get_uploader_form');
	}
	// refresh the select drop down 
	this.loadSelect();
	tinyMCEPopup.resizeToInnerSize();
};
	
// prepare the resizer panel
ImageDialog.prototype.loadResizer = function(imagesrc) {
	var path = /^http/.test(imagesrc) ? imagesrc : this.settings.tinycimm_assets_path+imagesrc;
	// completely remove the resizer image from the dom : issue 12 http://code.google.com/p/tinycimm/issues/detail?id=12
	tinyMCEPopup.dom.remove('slider_img');
	// ensure image is cached before loading the resizer
	this.loadImage(this.baseURL(path));
}

// pre-cache an image
ImageDialog.prototype.loadImage = function(img) { 
	var preImage = new Image(), _this = this;
	preImage.src = img;
	setTimeout(function(){
		_this.checkImgLoad(preImage);
	},10);	// ie
}

// show loading text if image not already cached
ImageDialog.prototype.checkImgLoad = function(preImage) {
	if (!preImage.complete) {
		mcTabs.displayTab('resize_tab','resize_panel');
		tinyMCEPopup.dom.setHTML('image-info-dimensions', '<img style="float:left;margin-right:4px" src="img/ajax-loader.gif"/> caching image..');
	}
	this.checkLoad(preImage);
}	

ImageDialog.prototype.checkLoad = function(preImage) {
	var _this = this;
	if (preImage.complete) { 
		this.showResizeImage(preImage);
		return;
	}
 	setTimeout(function(){
		_this.checkLoad(preImage)
	}, 10);
}
	
// show resizer image
ImageDialog.prototype.showResizeImage = function(preImage) {
	var _this = this;
	this.getImage(preImage.src.toId(), function(image){
		// fix for issue 12 http://code.google.com/p/tinycimm/issues/detail?id=12
		var img = window.document.createElement("img");
		img.setAttribute('id', 'slider_img');
		img.setAttribute('width', image.width);
		img.setAttribute('height', image.height);
		img.setAttribute('src', preImage.src);
		tinyMCEPopup.dom.get('image-info').appendChild(img);
		setTimeout(function(){
			img.style.display="block";
		}, 200);
		
		// display panel
		mcTabs.displayTab('resize_tab','resize_panel');
		tinyMCEPopup.dom.get('resize_tab').style.display = 'block';

		// image dimensions overlay layer
		tinyMCEPopup.dom.setHTML('image-info-dimensions', '<span id="slider_width_val"></span> x <span id="slider_height_val"></span>');

		var sliderVal = image.width < _this.settings.tinycimm_resize_default_intial_width ? image.width : _this.settings.tinycimm_resize_default_intial_width;
			
		new ScrollSlider(tinyMCEPopup.dom.get('image-slider'), {
			min : 0,
			max : image.width,
			value : sliderVal,
			size : 400,
			scroll : function(new_w) {
				var slider_width = tinyMCEPopup.dom.get('slider_width_val'), slider_height = tinyMCEPopup.dom.get('slider_height_val');
				if (slider_width && slider_height) {
					slider_width.innerHTML = (tinyMCEPopup.dom.get('slider_img').width=new_w);
					slider_height.innerHTML = (tinyMCEPopup.dom.get('slider_img').height=Math.round((parseInt(new_w)/parseInt(image.width))*image.height))+'px';
				}
			}
		});
	});
}

ImageDialog.prototype.insertResizeImage = function(){
	var _this = this, image_id = tinyMCEPopup.dom.get('slider_img').src.toId();
	// show loading animation
	//tinyMCEPopup.dom.get('insertimg').src = tinyMCEPopup.dom.get('insertimg').src.replace('image_add.png', 'ajax-loader.gif');
	this.getImage(image_id, function(image){
		_this.insertImage(null, image.filename, image.description);
	});
}
	
ImageDialog.prototype.saveImgSize = function() {
	var width = tinyMCEPopup.dom.get('slider_img').width, height = tinyMCEPopup.dom.get('slider_img').height, _this = this;

	// show loading animation
	tinyMCEPopup.dom.get('saveimg').src = tinyMCEPopup.dom.get('saveimg').src.replace('save.gif', 'ajax-loader.gif');
		
	// prepare request url
	var imgsrc_arr = tinyMCEPopup.editor.documentBaseURI.toRelative(tinyMCEPopup.dom.get('slider_img').src).split('/');
	var requesturl = this.baseURL(this.settings.tinycimm_controller+'image/save_image_size/'+imgsrc_arr[imgsrc_arr.length-1].toId()+'/'+width+'/'+height+'/90');
	// send request
	tinymce.util.XHR.send({
		url : requesturl,
		error : function(response) {
			tinyMCEPopup.editor.windowManager.alert('There was an error processing the request: '+response+"\nPlease try again.");
			tinyMCEPopup.dom.get('saveimg').src = tinyMCEPopup.dom.get('saveimg').src.replace('ajax-loader.gif', 'save.gif');
		},
		success : function(response) {
			tinyMCEPopup.dom.get('saveimg').src = tinyMCEPopup.dom.get('saveimg').src.replace('ajax-loader.gif', 'save.gif');
			var obj = tinymce.util.JSON.parse(response);
			if (!obj.outcome) {
				tinyMCEPopup.editor.windowManager.alert(obj.message); 
			} else { 
				tinyMCEPopup.editor.windowManager.alert('Image size successfully saved.');
			}
		}
	});
}

ImageDialog.prototype.deleteImage = function(imageid) {
	this.deleteAsset(imageid);
}	

ImageDialog.prototype.doSearch = function(e, el){
	// enter pressed
	if (e.keyCode == 13) {
		tinyMCEPopup.dom.get('search-loading').style.display = 'inline-block';		
		this.fileBrowser(0, 0, true, false, encodeURIComponent(el.value));
	}
}
	
var TinyCIMMImage = new ImageDialog();
TinyCIMMImage.preInit();
tinyMCEPopup.onInit.add(TinyCIMMImage.init, TinyCIMMImage);
