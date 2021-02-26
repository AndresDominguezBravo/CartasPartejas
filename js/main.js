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
if (localStorage.getItem("MejorPuntuacion") == undefined && localStorage.getItem("MejorPuntuacion") == undefined) {
    localStorage.setItem("MejorPuntuacion", 0);
    localStorage.setItem("Iniciales", "DFL");
}


$("document").ready(function() {
    init();
    leerJson();

    $("#reiniciar").click(function() {
        limpiarScore();
        leerJson();
    });

    $("#guardar").click(function() {
        var nombre = $("#nombre").val();
        if (nombre != "") {
            localStorage.setItem("MejorPuntuacion", puntos);
            localStorage.setItem("Iniciales", nombre);
        } else {
            $("#nombre").addClass("active");
        }
    });


});


$(document).on('click', '.oculta', function() {

    if (turno != estadoPartida.FIN_PARTIDA) {
        if (turno == estadoPartida.PARADO) {

            $(this).removeClass("oculta").addClass("carta");
            ultimaCartaLevantada = $(this);
            turno = estadoPartida.LEVANTO;

        } else if (turno == estadoPartida.LEVANTO) {

            $(this).removeClass("oculta").addClass("carta");
            var cartaActural = $(this);
            validarEmparejamiento(ultimaCartaLevantada, cartaActural);
        }
    }


});

function init() {
    //dar valor a el Marcador de puntos.
    intentosRestantes = $("#intentosMaximos").val();
    $(".score").children().last().children().text(puntos);
    $(".score").children().first().children().text(intentosRestantes);

    //copiar el html del formato de la carta.
    formatoCarta = $("#carta").clone(true);
    formatoCarta.addClass("d-block");
    formatoCarta.removeAttr("id");

    //Mejor puntuacion de localStorage.
    $(".top-tres").children().eq(1).text(localStorage.getItem("Iniciales"));
    $(".top-tres").children().last().text(localStorage.getItem("MejorPuntuacion"));

}

function limpiarScore() {
    puntos = 0;
    intentosRestantes = $("#intentosMaximos").val();
    $(".score").children().first().children().text(intentosRestantes);
    $(".score").children().last().children().text(puntos);
    $(".alert-success").addClass("d-none");
    $(".alert-danger").addClass("d-none");


    turno = estadoPartida.PARADO;
}

function validarEmparejamiento(ultimaCartaLevantada, cartaActural) {
    if (ultimaCartaLevantada.children("input").val() == cartaActural.children("input").val()) {
        puntos++;
        intentosRestantes--;
        $(".score").children().last().children().text(puntos);
        $(".score").children().first().children().text(intentosRestantes);

    } else {
        setTimeout(function() {
            cartaActural.addClass("oculta").removeClass("carta");
            ultimaCartaLevantada.addClass("oculta").removeClass("carta");
        }, 1000);
        intentosRestantes--;
        $(".score").children().first().children().text(intentosRestantes);

    }

    turno = estadoPartida.PARADO;

    if (puntos == 12) {
        $(".alert-success").removeClass("d-none");
        $(".modal").modal("show");
        turno = estadoPartida.FIN_PARTIDA;
    }
    if (intentosRestantes == 0) {
        $(".alert-danger").removeClass("d-none");
        $(".modal").modal("show");
        turno = estadoPartida.FIN_PARTIDA;
    }
}

function crearBarajarCartas(cartas) {
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
        nuevaCarta.children("div").children("h4").children("i").before(element.numero);
        nuevaCarta.children("div").children("h4").children("i").addClass(element.icon).addClass(element.palo.toLowerCase());
        nuevaCarta.children("input").attr("value", element.numero + "," + element.palo);
        switch (element.numero) {
            case 12:
                nuevaCarta.children("div").children("i").addClass("fas fa-chess-king").addClass(element.palo.toLowerCase());
                break;

            case 11:
                nuevaCarta.children("div").children("i").addClass("fas fa-chess-knight").addClass(element.palo.toLowerCase());
                break;

            case 10:
                nuevaCarta.children("div").children("i").addClass("fas fa-female").addClass(element.palo.toLowerCase());
                break;

            default:
                nuevaCarta.children("div").children("i").addClass(element.icon).addClass(element.palo.toLowerCase());
                break;
        }
        $(".tablero").append(nuevaCarta);

    });

}

function leerJson() {
    $.getJSON("js/cartas.json", function(cartas) {
        cartas = bararjar(cartas);
        repartir(crearBarajarCartas(cartas));
    });
}