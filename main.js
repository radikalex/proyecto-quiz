const divHome = document.getElementById('home')
const divPregunta = document.getElementById('pregunta')
const divQuestion = document.getElementById('question')
const divResult = document.getElementById('result')

let nota = 0;
let indexPregunta = 0;

// Preguntas para hacer pruebas antes de usar la API
const questions = {
    "response_code": 0,
    "results": [{
            "category": "Science: Mathematics",
            "type": "multiple",
            "difficulty": "easy",
            "question": "What&#039;s the square root of 49?",
            "correct_answer": "7",
            "incorrect_answers": [
                "4",
                "12",
                "9"
            ]
        },
        {
            "category": "Sports",
            "type": "boolean",
            "difficulty": "medium",
            "question": "Skateboarding will be included in the 2020 Summer Olympics in Tokyo.",
            "correct_answer": "True",
            "incorrect_answers": [
                "False"
            ]
        },
        {
            "category": "General Knowledge",
            "type": "boolean",
            "difficulty": "easy",
            "question": "The color orange is named after the fruit.",
            "correct_answer": "True",
            "incorrect_answers": [
                "False"
            ]
        },
        {
            "category": "Science & Nature",
            "type": "multiple",
            "difficulty": "medium",
            "question": "Which of these is a type of stretch/deep tendon reflex?",
            "correct_answer": "Ankle jerk reflex",
            "incorrect_answers": [
                "Gag reflex",
                "Pupillary light reflex",
                "Scratch reflex"
            ]
        },
        {
            "category": "Entertainment: Video Games",
            "type": "multiple",
            "difficulty": "hard",
            "question": "According to Toby Fox, what was the method to creating the initial tune for Megalovania?",
            "correct_answer": "Singing into a Microphone",
            "incorrect_answers": [
                "Playing a Piano",
                "Using a Composer Software",
                "Listened to birds at the park"
            ]
        },
        {
            "category": "Entertainment: Television",
            "type": "boolean",
            "difficulty": "medium",
            "question": "In &quot;Star Trek&quot;, Klingons are commonly referred to as &quot;Black Elves&quot;.",
            "correct_answer": "False",
            "incorrect_answers": [
              "True"
            ]
        },
        {
            "category": "Animals",
            "type": "boolean",
            "difficulty": "easy",
            "question": "Cats have whiskers under their legs.",
            "correct_answer": "True",
            "incorrect_answers": [
                "False"
            ]
        },
        {
            "category": "Entertainment: Board Games",
            "type": "multiple",
            "difficulty": "easy",
            "question": "In board games, an additional or ammended rule that applies to a certain group or place is informally known as a &quot;what&quot; rule?",
            "correct_answer": "House",
            "incorrect_answers": [
                "Custom",
                "Extra",
                "Change"
            ]
        },
        {
            "category": "Entertainment: Japanese Anime & Manga",
            "type": "multiple",
            "difficulty": "medium",
            "question": "Which of the following films was NOT directed by Hayao Miyazaki?",
            "correct_answer": "Wolf Children",
            "incorrect_answers": [
                "Princess Mononoke",
                "Spirited Away",
                "Kiki&#039;s Delivery Service"
            ]
        },
        {
            "category": "Entertainment: Video Games",
            "type": "multiple",
            "difficulty": "easy",
            "question": "Which of the following Zelda games did not feature Ganon as a final boss?",
            "correct_answer": "Majora&#039;s Mask",
            "incorrect_answers": [
                "Ocarina of Time",
                "Skyward Sword",
                "Breath of the Wild"
            ]
        }
    ]
}
 
/* --------------------------------------------- Lógica del quiz ---------------------------------- */

function ponerPregunta(pregunta) {

    // Borrar pregunta anterior si hay
    while(divPregunta.firstChild) {
        divPregunta.removeChild(divPregunta.firstChild)
    }

    // Numero de pregunta y puntuación
    const divHeader = document.getElementById('pregunta-header')
    divHeader.innerHTML = `<span>Pregunta ${indexPregunta + 1}</span> <span>Puntuación: <span id='nota'>${nota}<span>/10 </span>`

    // Poner la pregunta
    const divPreguntaActual = document.createElement('div');
    divPreguntaActual.innerHTML = `<h1>${pregunta.question}</h1>`;
    divPregunta.appendChild(divPreguntaActual);

    // Generar respuestas a la pregunta
    const respuestas = [pregunta.correct_answer, ...pregunta.incorrect_answers]
    const hexaColors = pregunta.type !== 'boolean' ? ['#E11B3E', '#1467CF', '#D69E01', '#28880D'] : ['#00FF48', '#FF0000']; 
    if(pregunta.type !== 'boolean') {
        // Desordenar las respuestas si no son solo True o False
        desordenarRespuestas(respuestas);
    }
    crearRespuestas(respuestas, hexaColors)


    // Boton para pasar a la siguiente pregunta
    if(questions.results.length > indexPregunta + 1) {
        const btn_siguientePregunta = document.createElement('button')
        btn_siguientePregunta.className = "btn btn-primary siguiente-pregunta"
        btn_siguientePregunta.innerHTML = "Siguiente Pregunta"
        btn_siguientePregunta.disabled = true;
        btn_siguientePregunta.addEventListener('click', siguientePregunta)
        divPregunta.appendChild(btn_siguientePregunta)
    } else {
        const btn_siguientePregunta = document.createElement('button')
        btn_siguientePregunta.className = "btn btn-primary siguiente-pregunta"
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
    document.getElementById('nota').innerText = `${nota}/10`
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
    return respuesta === questions.results[indexPregunta].correct_answer;
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
    switch(nota) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354088200159252/1-4.gif";
            clase_gif = 'gif-resultado-small';
            break;
        case 5:
        case 6:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354088627966102/5-6.gif";
            clase_gif = 'gif-resultado';
            break;
        case 7:
        case 8:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354089085157406/7-8.gif";
            clase_gif = 'gif-resultado';
            break;
        case 9:
        case 10:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354089559097424/9-10.gif";
            clase_gif = 'gif-resultado';
            break;
        default:
            console.log('Algo no ha ido bien');
    }
    divResult.innerHTML = 
    `
    <h1>Tu puntuación es de ${nota}/10</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita ab sit repellendus fugit totam iusto ad soluta, quaerat in maxime nam repudiandae earum itaque velit cupiditate minima aut quas quam?</p>
    <img src="${gif_Url}" alt="asdf" class="${clase_gif}">
    <div class="botones-result">
        <button class="btn btn-primary" onclick="reiniciarTest()">Reiniciar test</button>
        <button class="btn btn-primary" onclick="irPaginaPrincipal()">Ir a la página principal</button>
    </div> 
    `
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
    divQuestion.classList.add('question');
    divQuestion.classList.remove('hide');
    ponerPregunta(questions.results[indexPregunta])
}
