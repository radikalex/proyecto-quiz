
const divPregunta = document.getElementById('pregunta')
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
            "category": "History",
            "type": "multiple",
            "difficulty": "hard",
            "question": "The Battle of Hastings was fought in which year?",
            "correct_answer": "1066",
            "incorrect_answers": [
                "911",
                "1204",
                "1420"
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

function ponerPregunta(pregunta) {

    // Borrar pregunta anterior si hay
    while(divPregunta.firstChild) {
        divPregunta.removeChild(divPregunta.firstChild)
    }

    const divPreguntaActual = document.createElement('div');
    divPreguntaActual.innerHTML = `<h1>${pregunta.question}</h1>`;
    divPregunta.appendChild(divPreguntaActual);

    const respuestas = [pregunta.correct_answer, ...pregunta.incorrect_answers]
    // Si la pregunta no es de true o false desordenarla
    if(pregunta.type !== 'boolean') {
        console.log(pregunta.type);
        desordenarRespuestas(respuestas);
    }
    const divRespuestas = document.createElement('div')
    for (const respuesta of respuestas) {
        const button = document.createElement('button')
        button.innerText = respuesta
        button.addEventListener('click', preguntaRespondida)
        divRespuestas.appendChild(button)
    }
    divPregunta.appendChild(divRespuestas);

    const btn_siguientePregunta = document.createElement('button')
    btn_siguientePregunta.innerText = "Siguiente Pregunta"
    btn_siguientePregunta.addEventListener('click', siguientePregunta)
    divPregunta.appendChild(btn_siguientePregunta)
}

function siguientePregunta(e) {
    indexPregunta++;
    ponerPregunta(questions.results[indexPregunta])
}

function preguntaRespondida() {
    if(preguntaCorrecta(this.innerText)) {
        nota++;
    } else {
        if(nota !== 0)
            nota--;
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

ponerPregunta(questions.results[indexPregunta])