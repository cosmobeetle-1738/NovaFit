// metro.config.js
module.exports = {
  resolver: {
    // no blacklistRE, avoids requiring metro-config internals
  },
  watchFolders: [], // don't watch extra folders
};