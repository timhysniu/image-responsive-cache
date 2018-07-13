'use strict';

const irc = require('../index');

var ircObj = irc({
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
let cached = ircObj.image('PRESET1', __dirname + '/images/sample.jpg').then((path) => {
    console.log("PRESET1 Image: ", path);
});

let cached2 = ircObj.image('PRESET2', __dirname + '/images/sample.jpg').then((path) => {
    console.log("PRESET2 Image: ", path);
});
