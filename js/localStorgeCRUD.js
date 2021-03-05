/*
La intecionalidad de este JavaScrit es tener metodos para manejar localStorage
de una forma secilla y reutilizarlo en otros proyectos.
*/

var localStorageAPI = {

    guardar: function(key, valor) {
        if (localStorage.getItem(key) == undefined) {
            localStorage.setItem(key, valor);
        } else {
            console.log("INFO: " + key + " Ya esta almacenado, utilice el metodo actulizar.")
        }
    },

    actualizar: function(key, valor) {
        if (localStorage.getItem(key) != undefined) {
            localStorage.setItem(key, valor);
        } else {
            console.log("INFO: " + key + " Ya esta almacenado, utilice el metodo guardar.")
        }
    },

    borrar: function(key) {
        localStorage.removeItem(key);
    },

    leer: function(key) {
        return localStorage.getItem(key);

    }

}