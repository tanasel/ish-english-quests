(function () {
  "use strict";

  function encodePack(pack) {
    if (!window.LZString) throw new Error("LZString is not loaded.");
    return window.LZString.compressToEncodedURIComponent(JSON.stringify(pack));
  }

  function decodePack(str) {
    try {
      if (!window.LZString || !str) return null;
      const json = window.LZString.decompressFromEncodedURIComponent(String(str));
      if (!json) return null;
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function buildPlayUrl(pack, basePath) {
    const root = String(basePath == null ? "" : basePath);
    return root + "play.html#q=" + encodePack(pack);
  }

  function packSizeInfo(pack) {
    let chars = 0;
    try { chars = buildPlayUrl(pack, "").length; } catch { chars = JSON.stringify(pack || {}).length; }
    let band = "green";
    if (chars > 12000) band = "red";
    else if (chars > 8000) band = "amber";
    return { chars, band };
  }

  window.QuestShare = {
    encodePack,
    decodePack,
    buildPlayUrl,
    packSizeInfo,
  };
})();
