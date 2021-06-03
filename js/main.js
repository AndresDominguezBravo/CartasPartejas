var estadoPartida = {
    PARADO: 0,
    LEVANTO: 1,
    FIN_PARTIDA: 2
}
var turno = estadoPartida.PARADO;
var ultimaCartaLevantada;
var totalIntentos = 0;
var tiempoRestante;
var formatoCarta;
var contadorTiempo;
var encontrados = 0;
const tiempo = 90;
console.log(Object.keys(localStorage));

$("document").ready(function() {
    cargarfondo();

    $("#reiniciar").click(function() {
        resetPartida();
        leerJson();
        generate();
    });

    $("#iniciar").click(function() {
        iniciarPartida();
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


function flipCarta(carta) {
    if (carta.hasClass("oculta")) {
        $(carta).parent().addClass("rotar");
        $(carta).removeClass("oculta").addClass("carta");
    } else {
        $(carta).addClass("oculta").removeClass("carta");
        $(carta).parent().removeClass("rotar");
    }

}

$(document).on('click', '.oculta', function() {

    if (turno != estadoPartida.FIN_PARTIDA) {
        if (turno == estadoPartida.PARADO) {
            ultimaCartaLevantada = $(this);
            flipCarta(ultimaCartaLevantada);
            turno = estadoPartida.LEVANTO;

        } else if (turno == estadoPartida.LEVANTO) {
            var cartaActural = $(this);
            flipCarta(cartaActural);
            validarPareja(ultimaCartaLevantada, cartaActural);
        }
    }


});

function iniciarPartida() {
    //dar valor a el Marcador de puntos.
    // $(".score").children().first().children().text(totalIntentos);

    //copiar el html del formato de la carta.
    formatoCarta = $("#carta").clone(true);
    formatoCarta.addClass("d-block");
    formatoCarta.removeAttr("id");

    localStorageAPI.guardar("MejorPuntuacion", 0);
    localStorageAPI.guardar("Iniciales", "DFL");

    //Mejor puntuacion de localStorage.
    $(".top-tres").children().eq(1).text(localStorageAPI.leer("Iniciales"));
    $(".top-tres").children().last().text(localStorageAPI.leer("MejorPuntuacion"));

    $("#iniciar").hide();
    $("#nombre").hide();
    tiempoRestante = tiempo;
    cuentaAtras();

}

function cuentaAtras(parametroTiempo) {
    if (tiempoRestante <= 5) {
        $(".tiempo").css("color", "red");
        $(".tiempo").text(tiempoRestante);
    } else {
        $(".tiempo").css("color", "white");
        $(".tiempo").text(tiempoRestante);
    }

    if (parametroTiempo == 'parar') {
        clearTimeout(contadorTiempo);
    } else {
        if (tiempoRestante == 0) {
            clearTimeout(contadorTiempo);
            comprobarEstadoPartida();
        } else {
            tiempoRestante -= 1;
            contadorTiempo = setTimeout("cuentaAtras()", 1000);
        }
    }


}

function resetPartida() {
    //totalIntentos = 0;
    encontrados = 0;
    cuentaAtras('parar');
    tiempoRestante = tiempo;
    cuentaAtras();
    //$(".score").children().first().children().text(totalIntentos);
    $(".tiempo").text(tiempoRestante);
    $(".alert-success").addClass("d-none");
    $(".alert-danger").addClass("d-none");

    turno = estadoPartida.PARADO;
}

function validarPareja(ultimaCartaLevantada, cartaActural) {

    if (ultimaCartaLevantada.children("input").val() == cartaActural.children("input").val()) {
        encontrados++;
        totalIntentos++;
        $(".score").children().last().children().text(tiempoRestante);
        $(".score").children().first().children().text(totalIntentos);


    } else {
        setTimeout(function() {
            // cartaActural.addClass("oculta").removeClass("carta");
            // ultimaCartaLevantada.addClass("oculta").removeClass("carta");
            flipCarta(ultimaCartaLevantada);
            flipCarta(cartaActural);

            // cartaActural.parent().removeClass("rotar");
            // ultimaCartaLevantada.parent().removeClass("rotar");

        }, 1500);
        totalIntentos++;
        $(".score").children().first().children().text(totalIntentos);

    }
    turno = estadoPartida.PARADO;
    comprobarEstadoPartida();

}


function comprobarEstadoPartida() {
    if (encontrados == 12) {
        //con este estado terminamos la partida.
        turno = estadoPartida.FIN_PARTIDA;
        guardarNuevoRecord(tiempoRestante);
        $(".alert-success").removeClass("d-none");
        $(".modal").modal("show");
        cuentaAtras('parar');

    } else if (tiempoRestante == 0) {

        turno = estadoPartida.FIN_PARTIDA;
        guardarNuevoRecord(tiempoRestante);
        $(".alert-danger").removeClass("d-none");
        $(".modal").modal("show");
        cuentaAtras('parar');

    }


}

function guardarNuevoRecord(tiempoRestante) {
    /*
    Si superas el record actual o lo igualas se guarda hasta que lo superen.
    Las iniciales elegidas en ajustes son las que se guardan tambien, por defecto
    se guarda las iniciale "DFL" de "default".
    */
    if (parseInt(localStorageAPI.leer("MejorPuntuacion")) < tiempoRestante) {
        localStorageAPI.actualizar("MejorPuntuacion", tiempoRestante);
        if ($(".nombre").val() == "" || $(".nombre").val().length < 3) {
            localStorageAPI.actualizar("Iniciales", "DFL");
        } else {
            localStorageAPI.actualizar("Iniciales", $(".nombre").val().toUpperCase());
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

function generate() {
    anime({
        targets: '.block',
        translateX: function() {
            return anime.random(-700, 700);
        },
        translateY: function() {
            return anime.random(-700, 700);
        },
        scale: function() {
            return anime.random(1, 5);
        }
    })
}

function cargarfondo() {
    const container = document.querySelector('.fondo');

    for (var i = 0; i <= 100; i++) {
        const blocks = document.createElement('div');
        blocks.classList.add('block');
        container.appendChild(blocks);

    }

    generate();
}