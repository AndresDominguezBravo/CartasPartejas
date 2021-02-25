var enumTurno = {
    PARADO: 0,
    LEVANTO: 1
}

var turno = enumTurno.PARADO;
var ultimaCartaLevantada;
var intentosMaximos;
var intentosTotales = 0;
var puntos = 0;

$("document").ready(function() {
    init();
    leerJson();

    $("#reiniciar").click(function() {
        limpiarScore();
        leerJson();
    });


});


$(document).on('click', '.oculta', function() {

    if (intentosMaximos >= intentosTotales) {
        if (turno == enumTurno.PARADO) {

            $(this).removeClass("oculta").addClass("carta");
            ultimaCartaLevantada = $(this);
            turno = enumTurno.LEVANTO;

        } else if (turno == enumTurno.LEVANTO) {

            $(this).removeClass("oculta").addClass("carta");
            var cartaActural = $(this);
            validarEmparejamiento(ultimaCartaLevantada, cartaActural)
            turno = enumTurno.PARADO;

        }

    }


});

function init() {
    intentosMaximos = $("#intentosMaximos").val();
    $(".score").children().first().children().text(intentosMaximos);
    $(".score").children().last().children().text(puntos);
    $(".score").children().eq(1).children().text(intentosTotales);
}

function limpiarScore() {
    puntos = 0;
    intentosTotales = 0;
    intentosMaximos = $("#intentosMaximos").val();
    $(".score").children().first().children().text(intentosMaximos);
    $(".score").children().last().children().text(puntos);
    $(".score").children().eq(1).children().text(intentosTotales);
}

function validarEmparejamiento(ultimaCartaLevantada, cartaActural) {
    if (ultimaCartaLevantada.children("input").val() == cartaActural.children("input").val()) {
        puntos++;
        intentosTotales++;
        $(".score").children().last().children().text(puntos);
        $(".score").children().eq(1).children().text(intentosTotales);

    } else {
        setTimeout(function() {
            cartaActural.addClass("oculta").removeClass("carta");
            ultimaCartaLevantada.addClass("oculta").removeClass("carta");
        }, 1000);
        intentosTotales++;
        $(".score").children().eq(1).children().text(intentosTotales);

    }

    if (puntos == 12) {
        $(".alert-success").removeClass("d-none");
    }
    if (intentosTotales > intentosMaximos) {
        $(".alert-danger").removeClass("d-none");
    }
}

function crearBarajarCartas(cartas) {

    while (cartas.length > 12) {
        cartas.splice(Math.floor(Math.random() * cartas.length), 1);
    }
    var clon = cartas;
    cartas = cartas.concat(clon);
    cartas.sort(() => Math.random() - 0.5);
    return cartas;

}

function leerJson() {
    $.getJSON("js/cartas.json", function(cartas) {
        crearBarajarCartas(cartas).forEach(element => {
            var c = $("#carta").clone();
            c.addClass("d-block");
            c.removeAttr("id");
            c.children("div").children("h4").children("i").before(element.numero);
            c.children("div").children("h4").children("i").addClass(element.icon).addClass(element.palo.toLowerCase());
            c.children("input").attr("value", element.numero + "," + element.palo);
            switch (element.numero) {
                case 12:
                    c.children("div").children("i").addClass("fas fa-chess-king").addClass(element.palo.toLowerCase());
                    break;

                case 11:
                    c.children("div").children("i").addClass("fas fa-chess-knight").addClass(element.palo.toLowerCase());
                    break;

                case 10:
                    c.children("div").children("i").addClass("fas fa-female").addClass(element.palo.toLowerCase());
                    break;

                default:
                    c.children("div").children("i").addClass(element.icon).addClass(element.palo.toLowerCase());
                    break;
            }
            $(".tablero").append(c);


        });
        $("#carta").remove();

    });
}