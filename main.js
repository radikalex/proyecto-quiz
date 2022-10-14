const divHome = document.getElementById('home')
const divPregunta = document.getElementById('pregunta')
const divQuestion = document.getElementById('question')
const divResult = document.getElementById('result')

let nota = 0;
let numPreguntas = 0;
let indexPregunta = 0;

// Preguntas para hacer pruebas antes de usar la API
let questions = {}
 
/* -------------------------------- Lógica del quiz ---------------------------------- */

function obtenerPreguntas() {
    const cantidad = document.getElementById('cantidad').value;
    const categoria = document.getElementById('categoria').value;
    const dificultad = document.getElementById('dificultad').value;

    axios
        .get(`https://opentdb.com/api.php?amount=${cantidad}&category=${categoria}&difficulty=${dificultad}`) 
        .then((res) => {
            questions = res.data;
            numPreguntas = cantidad;
            divQuestion.classList.add('question');
            divQuestion.classList.remove('hide');
            ponerPregunta(questions.results[indexPregunta])
        })
        .catch((err) => console.error(err));
}

function ponerPregunta(pregunta) {

    // Borrar pregunta anterior si hay
    while(divPregunta.firstChild) {
        divPregunta.removeChild(divPregunta.firstChild)
    }

    // Numero de pregunta y puntuación
    const divHeader = document.getElementById('pregunta-header')
    divHeader.innerHTML = `<span>Pregunta ${indexPregunta + 1}</span> <span>Puntuación: <span id='nota'>${nota}<span>/${numPreguntas} </span>`

    // Poner la pregunta
    const divPreguntaActual = document.createElement('div');
    divPreguntaActual.innerHTML = `<h1>${pregunta.question}</h1>`;
    divPregunta.appendChild(divPreguntaActual);

    // Generar respuestas a la pregunta
    let respuestas, hexaColors;
    if(pregunta.type !== 'boolean') {
        respuestas = [pregunta.correct_answer, ...pregunta.incorrect_answers]
        // Desordenar las respuestas si no son solo True o False
        desordenarRespuestas(respuestas);
        hexaColors = ['#E11B3E', '#1467CF', '#D69E01', '#28880D'];
    } else {
        respuestas = ['True', 'False']
        hexaColors = ['#00FF48', '#FF0000'];
    }
    crearRespuestas(respuestas, hexaColors)


    // Boton para pasar a la siguiente pregunta
    if(questions.results.length > indexPregunta + 1) {
        const btn_siguientePregunta = document.createElement('button')
        btn_siguientePregunta.className = "btn-comenzar siguiente-pregunta"
        btn_siguientePregunta.innerHTML = "Siguiente Pregunta"
        btn_siguientePregunta.disabled = true;
        btn_siguientePregunta.addEventListener('click', siguientePregunta)
        divPregunta.appendChild(btn_siguientePregunta)
    } else {
        const btn_siguientePregunta = document.createElement('button')
        btn_siguientePregunta.className = "btn-comenzar siguiente-pregunta"
        btn_siguientePregunta.innerHTML = "Finalizar Test"
        btn_siguientePregunta.addEventListener('click', finalizarTest)
        divPregunta.appendChild(btn_siguientePregunta)
    }
}

function crearRespuestas(respuestas, hexaColors) {
    
    const divRespuestasMultiples = document.createElement('div')
    divRespuestasMultiples.className = "contenedor-respuestas-multiples"
    for (let i = 0; i < respuestas.length; i++) {
        const button = document.createElement('button')
        button.innerHTML = respuestas[i]
        button.className = "respuesta"
        button.style.backgroundColor = hexaColors[i];
        button.addEventListener('click', preguntaRespondida)
        divRespuestasMultiples.appendChild(button);
    }
    divPregunta.appendChild(divRespuestasMultiples);
}

function siguientePregunta(e) {
    indexPregunta++;
    ponerPregunta(questions.results[indexPregunta])
}

function preguntaRespondida() {
    document.querySelector('.siguiente-pregunta').disabled = false;
    if(preguntaCorrecta(this.innerText)) {
        nota++;
    } else {
        // if(nota !== 0)
        //     nota--;
    }
    deshabilitarRespuestas();
    document.getElementById('nota').innerText = `${nota}/${numPreguntas}`
}

function deshabilitarRespuestas() {
    const respuestas = document.getElementsByClassName("respuesta");
    for (const respuesta of respuestas) {
        respuesta.disabled = true;
        if(!preguntaCorrecta(respuesta.innerText))
            respuesta.classList.add('respuesta-incorrecta')
    }
}

function preguntaCorrecta(respuesta) {
    return respuesta === decodeHtml(questions.results[indexPregunta].correct_answer);
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Función para 'barajar' un array. Obtenido de StackOverflow
function desordenarRespuestas(respuestas) {
    let indiceActual = respuestas.length;
    let indiceAleatorio;

    // While there remain elements to shuffle.
    while (indiceActual != 0) {
  
      // Pick a remaining element.
      indiceAleatorio = Math.floor(Math.random() * indiceActual);
      indiceActual--;
  
      // And swap it with the current element.
      [respuestas[indiceActual], respuestas[indiceAleatorio]] = [
        respuestas[indiceAleatorio], respuestas[indiceActual]];
    }
  
    return respuestas;
}

function finalizarTest() {
    divQuestion.classList.remove('question');
    divQuestion.classList.add('hide');
    divResult.classList.remove('hide');
    divResult.classList.add('result');
    mostrarResultado();
}

/* --------------------------------------------- Lógica del resultado ---------------------------------- */

function mostrarResultado() {
    let gif_Url, clase_gif;
    const porcentajeAciertos = obtenerPorcentajeNota();
    switch(true) {
        case porcentajeAciertos <= 40:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354088200159252/1-4.gif";
            clase_gif = 'gif-resultado-small';
            break;
        case porcentajeAciertos <= 60:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354088627966102/5-6.gif";
            clase_gif = 'gif-resultado';
            break;
        case porcentajeAciertos <= 80:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354089085157406/7-8.gif";
            clase_gif = 'gif-resultado';
            break;
        case porcentajeAciertos > 80:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354089559097424/9-10.gif";
            clase_gif = 'gif-resultado';
            break;
        default:
            console.log('Algo no ha ido bien');
    }
    divResult.innerHTML = 
    `
    <h1>Tu puntuación es de ${nota}/${numPreguntas}</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita ab sit repellendus fugit totam iusto ad soluta, quaerat in maxime nam repudiandae earum itaque velit cupiditate minima aut quas quam?</p>
    <img src="${gif_Url}" alt="asdf" class="${clase_gif}">
    <div class="botones-result">
        <button class="btn-comenzar" onclick="reiniciarTest()">Reiniciar test</button>
        <button class="btn-comenzar" onclick="irPaginaPrincipal()">Ir a la página principal</button>
    </div> 
    `
}

function obtenerPorcentajeNota() {
    return nota*100/numPreguntas;
}

function reiniciarTest() {
    divQuestion.classList.add('question');
    divQuestion.classList.remove('hide');
    divResult.classList.add('hide');
    divResult.classList.remove('result');
    nota = 0;
    indexPregunta = 0;
    ponerPregunta(questions.results[indexPregunta]);
}

function irPaginaPrincipal() {
    divResult.classList.add('hide');
    divResult.classList.remove('result');
    divHome.classList.remove('hide');
    divHome.classList.add('home');
}

/* --------------------------------------------- Lógica de página principal ---------------------------------- */

function comenzarTest() {
    indexPregunta = 0;
    nota = 0;
    divHome.classList.add('hide');
    divHome.classList.remove('home');
    obtenerPreguntas();
}
