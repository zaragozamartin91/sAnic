/* Guarda todas las escenas existentes */
const scenes = [];
/* Guarda las claves de un set de animaciones */
const animKeys = {};

/**
 * Intenta cargar assets para una escena (en caso que no hayan sido cargados previamente.)
 * @param {Object} scene Objeto Phaser.Scene.
 * @param {String} key Clave de assets (ej: 'player')
 * @param {Function} loaderFunction Lambda encargada de cargar los assets.
 */
function loadFor(scene, key, loaderFunction) {
    const sceneIo = scenes.indexOf(scene);
    const sceneFound = sceneIo >= 0;
    if (!sceneFound) return loadNewSceneAssets(scene, key, loaderFunction);

    const keyFound = animKeys[sceneIo][key];
    if (!keyFound) return loadAssets(scene, key, loaderFunction);
}

function loadNewSceneAssets(scene, key, loaderFunction) {
    const io = scenes.push(scene) - 1;
    animKeys[io] = {};
    animKeys[io][key] = true;
    loaderFunction();
}

function loadAssets(scene, key, loaderFunction) {
    const io = scenes.indexOf(scene);
    animKeys[io][key] = true;
    loaderFunction();
}

export default { loadFor };
