var estadoPartida = {
    PARADO: 0,
    LEVANTO: 1,
    FIN_PARTIDA: 2
}
var turno = estadoPartida.PARADO;
var ultimaCartaLevantada;
var intentosRestantes = 0;
var puntos = 0;
var formatoCarta;

console.log(Object.keys(localStorage));

$("document").ready(function() {
    iniciarPartida();
    leerJson();

    $("#reiniciar").click(function() {
        resetPartida();
        leerJson();
    });

    $("#nombre").change(function() {
        if ($(this).val().length < 3) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });


});


$(document).on('click', '.oculta', function() {

    if (turno != estadoPartida.FIN_PARTIDA) {
        if (turno == estadoPartida.PARADO) {

            $(this).parent().addClass("rotar");
            $(this).removeClass("oculta").addClass("carta");


            ultimaCartaLevantada = $(this);
            turno = estadoPartida.LEVANTO;

        } else if (turno == estadoPartida.LEVANTO) {
            $(this).parent().addClass("rotar");
            $(this).removeClass("oculta").addClass("carta");
            var cartaActural = $(this);
            validarPareja(ultimaCartaLevantada, cartaActural);
        }
    }


});

function iniciarPartida() {
    //dar valor a el Marcador de puntos.
    intentosRestantes = $("#intentosMaximos").val();
    $(".score").children().last().children().text(puntos);
    $(".score").children().first().children().text(intentosRestantes);

    //copiar el html del formato de la carta.
    formatoCarta = $("#carta").clone(true);
    formatoCarta.addClass("d-block");
    formatoCarta.removeAttr("id");

    localStorageAPI.guardar("MejorPuntuacion", 0);
    localStorageAPI.guardar("Iniciales", "DFL");

    //Mejor puntuacion de localStorage.
    $(".top-tres").children().eq(1).text(localStorageAPI.leer("Iniciales"));
    $(".top-tres").children().last().text(localStorageAPI.leer("MejorPuntuacion"));

}

function resetPartida() {
    puntos = 0;
    intentosRestantes = $("#intentosMaximos").val();
    $(".score").children().first().children().text(intentosRestantes);
    $(".score").children().last().children().text(puntos);
    $(".alert-success").addClass("d-none");
    $(".alert-danger").addClass("d-none");

    turno = estadoPartida.PARADO;
}

function validarPareja(ultimaCartaLevantada, cartaActural) {

    if (ultimaCartaLevantada.children("input").val() == cartaActural.children("input").val()) {
        puntos++;
        intentosRestantes--;
        $(".score").children().last().children().text(puntos);
        $(".score").children().first().children().text(intentosRestantes);

    } else {
        setTimeout(function() {
            cartaActural.addClass("oculta").removeClass("carta");
            ultimaCartaLevantada.addClass("oculta").removeClass("carta");
            cartaActural.parent().removeClass("rotar");
            ultimaCartaLevantada.parent().removeClass("rotar");

        }, 1500);
        intentosRestantes--;
        $(".score").children().first().children().text(intentosRestantes);

    }

    comprobarEstadoPartida();

}

function comprobarEstadoPartida() {
    if (puntos == 12) {
        //con este estado terminamos la partida.
        turno = estadoPartida.FIN_PARTIDA;
        guardarNuevoRecord(puntos);

        /*
            mostramos los elementos para teminar partida
            la clase modal que dentro tiene dos mensajes.
                en este caso al conseguir 12 puntos mostramos el de victoria.
        */
        $(".alert-success").removeClass("d-none");
        $(".modal").modal("show");

    } else if (intentosRestantes == 0) {

        turno = estadoPartida.FIN_PARTIDA;
        guardarNuevoRecord(puntos);

        /*
            mostramos los elementos para teminar partida
            la clase modal que dentro tiene dos mensajes.
                en este caso al agotar los intentos mostramos el de derrota.
        */

        $(".alert-danger").removeClass("d-none");
        $(".modal").modal("show");

    } else {
        turno = estadoPartida.PARADO;
    }


}

function guardarNuevoRecord(puntos) {
    /*
    Si superas el record actual o lo igualas se guarda hasta que lo superen.
    Las iniciales elegidas en ajustes son las que se guardan tambien, por defecto
    se guarda las iniciale "DFL" de "default".
    */
    if (parseInt(localStorageAPI.leer("MejorPuntuacion")) <= puntos) {
        localStorageAPI.actualizar("MejorPuntuacion", puntos);
        if ($("#nombre").val() == "" || $("#nombre").val().length < 3) {
            localStorageAPI.actualizar("Iniciales", "DFL");
        } else {
            localStorageAPI.actualizar("Iniciales", $("#nombre").val().toUpperCase());
        }
        $(".top-tres").children().eq(1).text(localStorageAPI.leer("Iniciales"));
        $(".top-tres").children().last().text(localStorageAPI.leer("MejorPuntuacion"));
    }
}

function cortarBaraja(cartas) {
    var clon = cartas.splice(0, 12);
    clon = clon.concat(clon);
    return clon;
}

function bararjar(cartas) {
    var currentIndex = cartas.length,
        temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = cartas[currentIndex];
        cartas[currentIndex] = cartas[randomIndex];
        cartas[randomIndex] = temporaryValue;
    }
    return cartas;
}

function repartir(cartas) {
    $(".tablero").html("");
    cartas = bararjar(cartas);
    cartas.forEach(element => {
        var nuevaCarta = formatoCarta.clone();



        nuevaCarta.find(".icono-chico").before(element.numero);
        nuevaCarta.find(".icono-chico").addClass(element.icon).addClass(element.palo.toLowerCase());
        nuevaCarta.find("input").attr("value", element.numero + "," + element.palo);
        switch (element.numero) {
            case 12:
                nuevaCarta.find(".icono-grande").addClass("fas fa-chess-king").addClass(element.palo.toLowerCase());
                break;

            case 11:
                nuevaCarta.find(".icono-grande").addClass("fas fa-chess-knight").addClass(element.palo.toLowerCase());
                break;

            case 10:
                nuevaCarta.find(".icono-grande").addClass("fas fa-female").addClass(element.palo.toLowerCase());
                break;

            default:
                nuevaCarta.find(".icono-grande").addClass(element.icon).addClass(element.palo.toLowerCase());
                break;
        }
        $(".tablero").append(nuevaCarta);

    });

}

function leerJson() {
    $.getJSON("js/cartas.json", function(cartas) {
        cartas = bararjar(cartas);
        repartir(cortarBaraja(cartas));
    });
}