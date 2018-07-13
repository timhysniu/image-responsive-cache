# image-responsive-cache

This is a library to resize and cache images using an arbitrary presets of dimensions.
It will resize and cache an image using one of the presets the first time. After first time it will return the
path of the already cached version of the resized image.

This library is responsible for resizing and caching images at a defined cache path. You will need to setup
your own routes that resolve to cached paths, however. For example in `express` or `hapi` you will want to initalize
routes that resolve to cached images using

## Requirements

This library works with `ImageMagick` or `GraphicsMagick` so it is required that one of these is installed.


## Installation

```
npm i --save-responsive-cache
```

## Usage

You

```
'use strict';

const irc = require('image-responsive-cache');

var ircObj = irc({
    extension: 'jpg',       // default is jpg
    quality: 75,            // this is the default
    debug: true,            // set false in production
    cache_path: '/tmp',     // cache image is created here
    presets: {              // you can have any number of presets or you can use default ones.
        PRESET1: {        // defined preset coming from you configs
            width: 200,     // width is 200
            height: null,   // height is auto. current aspect ratio is preserved
        },
        PRESET2: {
            width: 100,
            height: null
        }

    }
});

// resize and cache image
// resize and cache image
ircObj.image('PRESET1', __dirname + '/images/sample.jpg').then((path) => {
    console.log("PRESET1 Image: ", path);
});

ircObj.image('PRESET2', __dirname + '/images/sample.jpg').then((path) => {
    console.log("PRESET2 Image: ", path);
});
```

Output:
```
image not in cache. resizing...
Directory /tmp/PRESET1 created!
Directory /tmp/PRESET1/b created!
Directory /tmp/PRESET1/b/1 created!
PRESET1 Image:  /tmp/PRESET1/b/1/b1f1d7e25a8deb66010a0c932fff4d02b6b505e5.jpg
image not in cache. resizing...
Directory /tmp/PRESET2 created!
Directory /tmp/PRESET2/b created!
Directory /tmp/PRESET2/b/1 created!
PRESET2 Image:  /tmp/PRESET2/b/1/b1f1d7e25a8deb66010a0c932fff4d02b6b505e5.jpg
```

## Serving Cached Images

You may want to use a CDN or serve media directly from your server. Whether this is part of your application or
standalone service, you will need to pull it from disk and serve publicly or to another service.

In `hapi` this can be done by setting up a wildcard route as follows:

```
/* GET ad details. */
router.get('/photo/preset1/*', function (req, res) {
    let originalPath = '/' + req.params['0'];
    irc.image('PRESET1', originalPath).then((cachedPath) => {
        res.set('Content-Type', 'image/jpg');
        res.sendFile(path);
    });
});
```

... and voila you can now access it via `http://yourdomain/photo1/{originalPath}`

## Resizing for Google Speed Insights

On July 2018 Google started penalizing sites with poor performance. Image optimization comes up a lot in
Google Speed Insights.

If you are running Google Speed Insights test on your web pages and you notice that score is
low because of images then you can probably do some optimization. Depending on your designs
your desktop might call for a different resolution of images from mobile or tablet view.
The closer the rendered image is to the actual dimensions of the image the better the score is going to be.
You might want to serve different dimensions to different screen sizes so you might need a few presets.