'use strict';

const gm = require('gm');
const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');

const DEFAULT_PRESETS = {
    LARGE: {
        width: 600,
        height: null,
    },
    MEDIUM: {
        width: 300,
        height: null
    },
    SMALL: {
        width: 260,
        height: null
    }
};
const DEFAULT_CACHE_PATH = '/tmp';
const DEFAULT_EXTENSION = 'jpg';

const ImageResponsiveCache = (config = {}) => {
    var self = this;
    self._presets = config.presets || DEFAULT_PRESETS;
    self._quality = config.quality || 75;
    self._cache_path = config.cache_path || DEFAULT_CACHE_PATH;
    self._extension = config.extension || DEFAULT_EXTENSION;
    self._logger = config.logger || console;
    self._debug = config.debug || false;

    /**
     * Returns cached version of a resized image or
     * resizes and caches an image if not cached.
     *
     * @param preset
     * @param origImage path to original image
     */
    self.image = (preset, origImage) => {
        let gmObj;
        if(!self._presets[preset]) {
            throw new Error('preset does not exist');
        }

        // check if in cache
        const path = self._generateFileName(origImage, preset);
        if (fs.existsSync(path)) {
            if(self._debug) {
                self._logger.log('returning from cache', path);
            }

            return path;
        }

        // generate cache directory with 3 levels
        // cache image will sit under {_cache_path}/x/y/{hash}.jpg
        if(self._debug) {
            self._logger.log(`image not in cache. resizing...`);
        }
        self._generateFileName(origImage, preset, true);

        // resize and cache
        if(self._presets[preset].width && self._presets[preset].height) {
            gmObj = gm(origImage).resize(self._presets[preset].width, self._presets[preset].height)
        }
        else if(self._presets[preset].width) {
            gmObj = gm(origImage).resize(self._presets[preset].width);
        }

        if(!gmObj) {
            throw new Error('could not resize image', origImage);
        }

        gmObj.quality(self._quality).write(path, function (err) {
            if (err) {
                self._logger.log('could not resize', err);
            }
        });

        return path;
    };

    self._generateFileName = (origImage, preset, createDir = false) => {
        if(typeof(origImage) !== 'string' || origImage.length < 1) {
            throw new Error('original image path is empty');
        }

        let hash = String(sha1(origImage));
        let cacheDir = self._cache_path + path.sep + preset + path.sep +
            hash.substr(0, 1) + path.sep + hash.substr(1, 1);

        if(createDir) {
            self._ensureDir(cacheDir, false);
        }

        return cacheDir + path.sep + hash + '.' + self._extension;
    };

    self._ensureDir = (targetDir, isRelativeToScript) => {
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';

        targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(baseDir, parentDir, childDir);
            try {
                fs.mkdirSync(curDir);
                if(self._debug) {
                    self._logger.log(`Directory ${curDir} created!`);
                }
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    throw err;
                }
            }

            return curDir;
        }, initDir);
    }

    return self;
};

module.exports = ImageResponsiveCache;