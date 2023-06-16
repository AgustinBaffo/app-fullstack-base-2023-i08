function validateDeviceName(param) {
    // Debe ser un string no nulo con una longitud menor a 64 y mayor a 0.
    return typeof param === 'string' && param !== null && param.length > 0 && param.length < 64;    
}
function validateDeviceDescription(description) {
    // Debe ser un string no nulo con una longitud menor a 128 y mayor a 0.
    return typeof param === 'string' && param !== null && param.length > 0 && param.length < 128;    
}

function validateDeviceDescription(param) {
    // TODO: implement
    return false;
}

// Exporta las funciones para que puedan ser utilizadas desde otro archivo
module.exports = {
    validateDeviceName,
    validateDeviceDescription
};