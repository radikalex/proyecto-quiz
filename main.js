const divHome = document.getElementById('home')
const divPregunta = document.getElementById('pregunta')
const divQuestion = document.getElementById('question')
const divResult = document.getElementById('result')
const divPrincipal = document.getElementById('contenedor-principal');
const divLoading = document.getElementById('loading')
const mainDiV = document.getElementById('main');
const classDiv = document.getElementById('classification');

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

    if( userPos > -1 ) {
        // Old user
        quiz_data.users[userPos].quizsDone.push({
            numQuestions: numPreguntas,
            correct_answers: nota,
            incorrect_answers: numPreguntas - nota
        })
    }
    else {
        // New Usuario
        quiz_data.users.push({
            name: userName,
            quizsDone: [{
                numQuestions: numPreguntas,
                correct_answers: nota,
                incorrect_answers: numPreguntas - nota
            }] 
        })
    }
    localStorage.setItem('quiz_data', JSON.stringify(quiz_data));
}

function findUserByName() {
    for (let i = 0; i < quiz_data.users.length; i++) {
        if(userName === quiz_data.users[i].name) {
            return i;
        }
    }

    return -1;
}

/* --------------------------------------------- Lógica del resultado ---------------------------------- */

function mostrarResultado() {
    let gif_Url, clase_gif;
    const porcentajeAciertos = obtenerPorcentaje(nota, numPreguntas);
    switch(true) {
        case porcentajeAciertos < 50:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354088200159252/1-4.gif";
            clase_gif = 'gif-resultado-small';
            break;
        case porcentajeAciertos < 70:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354088627966102/5-6.gif";
            clase_gif = 'gif-resultado';
            break;
        case porcentajeAciertos < 90:
            gif_Url = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354089085157406/7-8.gif";
            clase_gif = 'gif-resultado';
            break;
        case porcentajeAciertos >= 90:
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

function obtenerPorcentaje(current, total) {
    return current*100/total;
}

function reiniciarTest() {
    divResult.classList.replace('result', 'hide');
    divLoading.classList.replace('hide', 'loading');
    nota = 0;
    indexPregunta = 0;
    obtenerPreguntas();
}

function irPaginaPrincipal() {
    hideAllViews();
    divHome.classList.replace('hide', 'home')
}

function hideAllViews() {
    classDiv.classList.replace('classification', 'hide')
    divResult.classList.replace('result', 'hide')
    divHome.classList.replace('home', 'hide')
    divQuestion.classList.replace('question', 'hide');
}

/* --------------------------------------- Lógica de página principal ---------------------------------- */

function comenzarTest() {
    divLoading.classList.replace('hide', 'loading');
    userName = document.getElementById('name').value.trim();
    if(userName === "")
        userName = "Default"
    indexPregunta = 0;
    nota = 0;
    divHome.classList.replace('home', 'hide')
    obtenerPreguntas();
}

function createHomePage() {
    divHome.innerHTML = 
    `
        <h1 class="title">Quiz</h1>
        <form class="form-quiz">
            <label for="name">Your name:</label>
            <input type="text" id="name" name="name" class="form-control"> <br>
            <label for="cantidad"> Number of Questions: </label><br>
            <select id="cantidad" name="cantidad" class="form-select">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
            </select>
            <br>
            <label for="categoria">Select Category: </label><br>
            <select name="categoria" id="categoria" class="form-select">
                <option value="">Any type</option>
                <option value="9">General Knowledge</option>
                <option value="10">Entertainment: Books</option>
                <option value="11">Entertainment: Films</option>
                <option value="12">Entertainment: Music</option>
                <option value="13">Entertainment: Musical & Theatres</option>
                <option value="14">Entertainment: Television</option>
                <option value="15">Entertainment: Video Games</option>
                <option value="16">Entertainment: Board Games</option>
                <option value="17">Science & Nature</option>
                <option value="18">Science: Computers</option>
                <option value="19">Science: Mathematics</option>
                <option value="20">Mythology</option>
                <option value="21">Sports</option>
                <option value="22">Geography</option>
                <option value="23">History</option>
                <option value="24">Politics</option>
                <option value="25">Art</option>
                <option value="26">Celebrities</option>
                <option value="27">Animals</option>
                <option value="28">Vehicles</option>
                <option value="29">Entertainment: Comics</option>
                <option value="30">Science: Gadgets</option>
                <option value="31">Entertainment: Japanese Anime & Manga</option>
                <option value="32">Entertainment: Cartoons & Animations</option>
            </select>

            <br><label for="dificultad">Select Difficulty: </label>
            <select name="dificultad" id="dificultad" class="form-select">
                <option value="">Any type</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </form>
        <div>
            <button class="btn-comenzar" onclick="comenzarTest()">Start</button>
            <button class="btn-comenzar" onclick="goClassification()">See clasification</button>
        </div>
    `

}

// ----------------------------- Classification Logic -----------------------------------------

let actualTable = 0;
const numberTables = 5;

function goClassification() {
    hideAllViews();
    classDiv.classList.replace('hide', 'classification');
    createClassification();
}

function createClassification() {
    const usersData = getDataUsers();

    while(classDiv.firstChild) {
        classDiv.removeChild(classDiv.firstChild);
    }

    classDiv.innerHTML = `<h1>Classification ${actualTable + 1}0 Questions</h1>`

    const tablesDiv = document.createElement('div');
    tablesDiv.className = 'tables-container';

    const left_arrow = document.createElement('img');
    left_arrow.src = 'assets/left-arrow.png'
    left_arrow.className = 'arrow'
    left_arrow.onclick = previousTable;
    tablesDiv.appendChild(left_arrow);

    const table = document.createElement('table')
    table.className = "classTable"
    table.innerHTML = 
    `
        <tr>
            <th>Position</th>
            <th>Name</th>
            <th>Quizs Done</th>
            <th>Correct %</th>
            <th>Correct Answers</th>
            <th>Incorrect Answers</th>
        </tr>
    `

    switch(actualTable) {
        case 0:
            create10QuestionsTable(usersData, table);
            break;
        case 1:
            create20QuestionsTable(usersData, table);
            break;
        case 2:
            create30QuestionsTable(usersData, table);
            break;
        case 3:
            create40QuestionsTable(usersData, table);
            break;
        case 4:
            create50QuestionsTable(usersData, table);
            break;
        default:
            console.error('Some error generating classification table');
    }

    tablesDiv.appendChild(table);
    
    const right_arrow = document.createElement('img');
    right_arrow.src = 'assets/right-arrow.png'
    right_arrow.onclick = nextTable;
    right_arrow.className = 'arrow'
    tablesDiv.appendChild(right_arrow);

    classDiv.appendChild(tablesDiv)
    const button = document.createElement('button');
    button.innerHTML = 'Go to main page';
    button.className = 'btn-comenzar';
    button.onclick = irPaginaPrincipal;
    classDiv.appendChild(button);
}

function nextTable() {
    actualTable = (actualTable + 1) % numberTables;
    createClassification();
}

function previousTable() {
    actualTable = (actualTable + numberTables - 1) % numberTables;
    createClassification();
}

function create10QuestionsTable(usersData, table) {
    usersData.sort( (a, b) => {
        if(a.class10Questions.number > b.class10Questions.number)
            return -1;
        if(a.class10Questions.number < b.class10Questions.number)
            return 1;
        if(a.class10Questions.number === b.class10Questions.number) {
            if(a.class10Questions.percentage > b.class10Questions.percentage) 
                return -1;
            if(a.class10Questions.percentage < b.class10Questions.percentage) 
                return 1;
        }
        return 0;
    });

    for(let i = 0; i < 10; i++){
        const tr = document.createElement('tr')
        if( i < usersData.length && usersData[i].class10Questions.number != 0) {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td>${usersData[i].name}</td>
                <td>${usersData[i].class10Questions.number}</td>
                <td>${usersData[i].class10Questions.percentage.toFixed(1)}</td>
                <td>${usersData[i].class10Questions.correct_answers}</td>
                <td>${usersData[i].class10Questions.incorrect_answers}</td>
            `
        } else {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `
        }
        table.appendChild(tr);
    }
}

function create20QuestionsTable(usersData, table) {
    usersData.sort( (a, b) => {
        if(a.class20Questions.number > b.class20Questions.number)
            return -1;
        if(a.class20Questions.number < b.class20Questions.number)
            return 1;
        if(a.class20Questions.number === b.class20Questions.number) {
            if(a.class20Questions.percentage > b.class20Questions.percentage) 
                return -1;
            if(a.class20Questions.percentage < b.class20Questions.percentage) 
                return 1;
        }
        return 0;
    });

    for(let i = 0; i < 10; i++){
        const tr = document.createElement('tr')

        if( i < usersData.length && usersData[i].class20Questions.number != 0) {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td>${usersData[i].name}</td>
                <td>${usersData[i].class20Questions.number}</td>
                <td>${usersData[i].class20Questions.percentage.toFixed(1)}</td>
                <td>${usersData[i].class20Questions.correct_answers}</td>
                <td>${usersData[i].class20Questions.incorrect_answers}</td>
            `
        } else {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `
        }
        table.appendChild(tr);
    }
}

function create30QuestionsTable(usersData, table) {
    usersData.sort( (a, b) => {
        if(a.class30Questions.number > b.class30Questions.number)
            return -1;
        if(a.class30Questions.number < b.class30Questions.number)
            return 1;
        if(a.class30Questions.number === b.class30Questions.number) {
            if(a.class30Questions.percentage > b.class30Questions.percentage) 
                return -1;
            if(a.class30Questions.percentage < b.class30Questions.percentage) 
                return 1;
        }
        return 0;
    });

    for(let i = 0; i < 10; i++){
        const tr = document.createElement('tr')

        if( i < usersData.length && usersData[i].class30Questions.number != 0) {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td>${usersData[i].name}</td>
                <td>${usersData[i].class30Questions.number}</td>
                <td>${usersData[i].class30Questions.percentage.toFixed(1)}</td>
                <td>${usersData[i].class30Questions.correct_answers}</td>
                <td>${usersData[i].class30Questions.incorrect_answers}</td>
            `
        } else {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `
        }
        table.appendChild(tr);
    }
}

function create40QuestionsTable(usersData, table) {
    usersData.sort( (a, b) => {
        if(a.class40Questions.number > b.class40Questions.number)
            return -1;
        if(a.class40Questions.number < b.class40Questions.number)
            return 1;
        if(a.class40Questions.number === b.class40Questions.number) {
            if(a.class40Questions.percentage > b.class40Questions.percentage) 
                return -1;
            if(a.class40Questions.percentage < b.class40Questions.percentage) 
                return 1;
        }
        return 0;
    });

    for(let i = 0; i < 10; i++){
        const tr = document.createElement('tr')

        if( i < usersData.length && usersData[i].class40Questions.number != 0) {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td>${usersData[i].name}</td>
                <td>${usersData[i].class40Questions.number}</td>
                <td>${usersData[i].class40Questions.percentage.toFixed(1)}</td>
                <td>${usersData[i].class40Questions.correct_answers}</td>
                <td>${usersData[i].class40Questions.incorrect_answers}</td>
            `
        } else {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `
        }
        table.appendChild(tr);
    }
}

function create50QuestionsTable(usersData, table) {
    usersData.sort( (a, b) => {
        if(a.class50Questions.number > b.class50Questions.number)
            return -1;
        if(a.class50Questions.number < b.class50Questions.number)
            return 1;
        if(a.class50Questions.number === b.class50Questions.number) {
            if(a.class50Questions.percentage > b.class50Questions.percentage) 
                return -1;
            if(a.class50Questions.percentage < b.class50Questions.percentage) 
                return 1;
        }
        return 0;
    });

    for(let i = 0; i < 10; i++){
        const tr = document.createElement('tr')

        if( i < usersData.length && usersData[i].class50Questions.number != 0) {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td>${usersData[i].name}</td>
                <td>${usersData[i].class50Questions.number}</td>
                <td>${usersData[i].class50Questions.percentage.toFixed(1)}</td>
                <td>${usersData[i].class50Questions.correct_answers}</td>
                <td>${usersData[i].class50Questions.incorrect_answers}</td>
            `
        } else {
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `
        }
        table.appendChild(tr);
    }
}

function getDataUsers() {
    const quizUsersData = JSON.parse(localStorage.getItem("quiz_data")).users || [];
    const usersData = []

    for (const user of quizUsersData) {
        const info10questions = {number: 0, correct_answers: 0, incorrect_answers: 0}
        const info20questions = {number: 0, correct_answers: 0, incorrect_answers: 0}
        const info30questions = {number: 0, correct_answers: 0, incorrect_answers: 0}
        const info40questions = {number: 0, correct_answers: 0, incorrect_answers: 0}
        const info50questions = {number: 0, correct_answers: 0, incorrect_answers: 0}

        for (const quiz of user.quizsDone) {
            switch(quiz.numQuestions) {
                case "10":
                    info10questions.number += 1;
                    info10questions.correct_answers += quiz.correct_answers;
                    info10questions.incorrect_answers += quiz.incorrect_answers;
                    info10questions.percentage = obtenerPorcentaje(info10questions.correct_answers, info10questions.correct_answers + info10questions.incorrect_answers );
                    break;
                case "20":
                    info20questions.number += 1;
                    info20questions.correct_answers += quiz.correct_answers;
                    info20questions.incorrect_answers += quiz.incorrect_answers;
                    info20questions.percentage = obtenerPorcentaje(info20questions.correct_answers, info20questions.correct_answers + info20questions.incorrect_answers );
                    break;
                case "30":
                    info30questions.number += 1;
                    info30questions.correct_answers += quiz.correct_answers;
                    info30questions.incorrect_answers += quiz.incorrect_answers;
                    info30questions.percentage = obtenerPorcentaje(info30questions.correct_answers, info30questions.correct_answers + info30questions.incorrect_answers );
                    break;
                case "40":
                    info40questions.number += 1;
                    info40questions.correct_answers += quiz.correct_answers;
                    info40questions.incorrect_answers += quiz.incorrect_answers;
                    info40questions.percentage = obtenerPorcentaje(info40questions.correct_answers, info40questions.correct_answers + info40questions.incorrect_answers );
                    break;
                case "50":
                    info50questions.number += 1;
                    info50questions.correct_answers += quiz.correct_answers;
                    info50questions.incorrect_answers += quiz.incorrect_answers;
                    info50questions.percentage = obtenerPorcentaje(info50questions.correct_answers, info50questions.correct_answers + info50questions.incorrect_answers );
                    break;
                default:
                    console.error(`Error with ${quiz.numQuestions} questions`);
            }
        }
        
        usersData.push({
            name: user.name,
            class10Questions: info10questions,
            class20Questions: info20questions,
            class30Questions: info30questions,
            class40Questions: info40questions,
            class50Questions: info50questions
        });
    }

    return usersData;
}

// ----------------------------    Listeners    --------------------------------------------

// asd
createHomePage();