const divHome = document.getElementById('home')
const divPregunta = document.getElementById('pregunta')
const divQuestion = document.getElementById('question')
const divResult = document.getElementById('result')
const divPrincipal = document.getElementById('contenedor-principal');
const divLoading = document.getElementById('loading')
const mainDiV = document.getElementById('main');

let nota = 0;
let numPreguntas = 0;
let indexPregunta = 0;
let userName;


let quiz_data = JSON.parse(localStorage.getItem("quiz_data")) || {
    users: []
};

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
            divLoading.classList.replace('loading', 'hide');
            divQuestion.classList.replace('hide', 'question');
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
    divHeader.className = 'mb-4'
    divHeader.innerHTML = `<span>Question ${indexPregunta + 1}</span> <span>Score: <span id='nota'>${nota}<span>/${numPreguntas} </span>`

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
        btn_siguientePregunta.innerHTML = "Next Question"
        btn_siguientePregunta.disabled = true;
        btn_siguientePregunta.addEventListener('click', siguientePregunta)
        divPregunta.appendChild(btn_siguientePregunta)
    } else {
        const btn_siguientePregunta = document.createElement('button')
        btn_siguientePregunta.className = "btn-comenzar siguiente-pregunta"
        btn_siguientePregunta.innerHTML = "End Quiz"
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
    mainDiV.className = "hqr-contenedor"
    ponerPregunta(questions.results[indexPregunta])
}

function preguntaRespondida() {
    document.querySelector('.siguiente-pregunta').disabled = false;
    if(preguntaCorrecta(this.innerText)) {
        mainDiV.classList.add('container-correct')
        nota++;
    } else {
        mainDiV.classList.add('container-incorrect')
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
    return respuesta.trim() === decodeHtml(questions.results[indexPregunta].correct_answer);
}

function decodeHtml(html) {
    let txt = document.createElement("textarea");
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
    mainDiV.className = "hqr-contenedor"
    divResult.classList.replace('hide', 'result');
    divQuestion.classList.replace('question', 'hide');
    saveDataToLocalStorage();
    mostrarResultado();
}

function saveDataToLocalStorage() {
    const userPos = findUserByName();

    console.log(userPos);

    if( userPos > -1 ) {
        // Old user
        quiz_data.users[userPos].quizsDone.push({
            numQuestions: numPreguntas,
            correct_answer: nota,
            incorrect_answers: numPreguntas - nota
        })
    }
    else {
        // New Usuario
        quiz_data.users.push({
            name: userName,
            quizsDone: [{
                numQuestions: numPreguntas,
                correct_answer: nota,
                incorrect_answers: numPreguntas - nota
            }] 
        })
    }
    localStorage.setItem('quiz_data', JSON.stringify(quiz_data));
}

function findUserByName() {
    for (let i = 0; i < quiz_data.users.length; i++) {
        console.log(userName);
        console.log(quiz_data.users[i].name);
        if(userName === quiz_data.users[i].name) {
            return i;
        }
    }

    return -1;
}

/* --------------------------------------------- Lógica del resultado ---------------------------------- */

function mostrarResultado() {
    let gif_Url, clase_gif;
    const porcentajeAciertos = obtenerPorcentajeNota();
    switch(true) {
        case porcentajeAciertos <= 50:
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
    <h1>Your score was ${nota}/${numPreguntas}</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita ab sit repellendus fugit totam iusto ad soluta, quaerat in maxime nam repudiandae earum itaque velit cupiditate minima aut quas quam?</p>
    <img src="${gif_Url}" alt="asdf" class="${clase_gif}">
    <div class="botones-result">
        <button class="btn-comenzar" onclick="reiniciarTest()">Restart Quiz</button>
        <button class="btn-comenzar" onclick="irPaginaPrincipal()">Go to main page</button>
    </div> 
    `
}

function obtenerPorcentajeNota() {
    return nota*100/numPreguntas;
}

function reiniciarTest() {
    divResult.classList.replace('result', 'hide');
    divLoading.classList.replace('hide', 'loading');
    nota = 0;
    indexPregunta = 0;
    obtenerPreguntas();
}

function irPaginaPrincipal() {
    divResult.classList.replace('result', 'hide')
    divHome.classList.replace('hide', 'home')
}

/* --------------------------------------- Lógica de página principal ---------------------------------- */

function comenzarTest() {
    divLoading.classList.replace('hide', 'loading');
    userName = document.getElementById('name').value.trim();
    indexPregunta = 0;
    nota = 0;
    divHome.classList.replace('home', 'hide')
    obtenerPreguntas();
    
}


// ----------------------------    Listeners    --------------------------------------------
