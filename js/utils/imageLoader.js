// see: http://briancray.com/posts/javascript-module-pattern
var imageLoader = (function() {
	var numImagesRequested = 0;
	var numImagesLoaded = 0;
	var imagesToLoad = []
	var images = {}
	var onAllImagesLoadedCallback = null;

	// adds a request to load an image file.
	function queueImage(imageName) {
		++numImagesRequested;
		imagesToLoad.push(imageName);
	}

	// loads all images that have been previously requested.
	function loadQueuedImages(callback) {
		var i;

		onAllImagesLoadedCallback = callback;

		for (i = 0; i < numImagesRequested; ++i) {
			loadImage(imagesToLoad[i]);
		}
	}

	// creates an image object for one image.
	function loadImage(imageName) {
		var image = new Image();
		images[imageName] = image;
		
		image.onload = onImageLoaded;
		image.src = imageName;
	}

	// this function is called once for each image loaded.
	// if all images have been loaded, reset all internal state for image loader
	// and invoke the "all images loaded" callback if one has been set.
	function onImageLoaded() {
		++numImagesLoaded;
		
		if (numImagesLoaded == numImagesRequested) {
			numImagesLoaded = 0;
			numImagesRequested = 0;
			imagesToLoad = [];

			if (onAllImagesLoadedCallback !== null && onAllImagesLoadedCallback !== undefined) {
				onAllImagesLoadedCallback();
				onAllImagesLoadedCallback = null;
			}
		}
	}
	
	return {
		images : images,
		queueImage : queueImage,
		loadQueuedImages : loadQueuedImages
	};
})();
