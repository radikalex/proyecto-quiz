const homeDiv = document.getElementById('home')
const questionDiv = document.getElementById('question')
const questionContainerDiv = document.getElementById('question-container')
const resultDiv = document.getElementById('result')
const loadingDiv = document.getElementById('loading')
const mainDiV = document.getElementById('main');
const classDiv = document.getElementById('classification');
const statsDiv = document.getElementById('stats');

let score = 0;
let numQuestions = 0;
let questionIndex = 0;
let userName;


let quiz_data = JSON.parse(localStorage.getItem("quiz_data")) || {
    users: []
};

let questions = {}

const categories = {
    "General Knowledge" : 9,
    "Entertainment: Books" : 10,
    "Entertainment: Film" : 11,
    "Entertainment: Music" : 12,
    "Entertainment: Musicals & Theatres" : 13,
    "Entertainment: Television" : 14,
    "Entertainment: Video Games" : 15,
    "Entertainment: Board Games" : 16,
    "Science & Nature" : 17,
    "Science: Computers" : 18,
    "Science: Mathematics" : 19,
    "Mythology" : 20,
    "Sports" : 21,
    "Geography" : 22,
    "History" : 23,
    "Politics" : 24,
    "Art" : 25,
    "Celebrities" : 26,
    "Animals" : 27,
    "Vehicles" : 28,
    "Entertainment: Comics" : 29,
    "Science: Gadgets" : 30,
    "Entertainment: Japanese Anime & Manga" : 31,
    "Entertainment: Cartoon & Animations" : 32
}

let categoriesData = []

/* -------------------------------- Quiz Logic ---------------------------------- */

function getQuestions() {
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    initCategoriesData();

    axios
        .get(`https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}`)
        .then((res) => {   
                questions = res.data;
                numQuestions = amount;
                loadingDiv.classList.replace('loading', 'hide');
                questionContainerDiv.classList.replace('hide', 'question');
                setQuestion(questions.results[questionIndex]);
        })
        .catch((err) => console.error(err));
}

function initCategoriesData() {
    categoriesData = [];

    for (const key in categories) {
        categoriesData.push({
            name: key,
            correct_answers: 0,
            incorrect_answers: 0
        })
    }
}

function setQuestion(question) {

    while(questionDiv.firstChild) {
        questionDiv.removeChild(questionDiv.firstChild)
    }

    const divHeader = document.getElementById('question-header')
    divHeader.className = 'mb-4'
    divHeader.innerHTML = `<span>Question ${questionIndex + 1}</span> <span>Score: <span id='score'>${score}<span>/${numQuestions} </span>`

    const questionDivActual = document.createElement('div');
    questionDivActual.innerHTML = `<h1>${question.question}</h1>`;
    questionDiv.appendChild(questionDivActual);

    let answers, hexaColors;
    if(question.type !== 'boolean') {
        answers = [question.correct_answer, ...question.incorrect_answers]
        shuffleAnswers(answers);
        hexaColors = ['#E11B3E', '#1467CF', '#D69E01', '#28880D'];
    } else {
        answers = ['True', 'False']
        hexaColors = ['#00FF48', '#FF0000'];
    }
    createAnswers(answers, hexaColors)

    if(questions.results.length > questionIndex + 1) {
        const btn_nextQuestion = document.createElement('button')
        btn_nextQuestion.className = "btn-quiz next-question"
        btn_nextQuestion.innerHTML = "Next Question"
        btn_nextQuestion.disabled = true;
        btn_nextQuestion.addEventListener('click', nextQuestion)
        questionDiv.appendChild(btn_nextQuestion)
    } else {
        const btn_endQuiz = document.createElement('button')
        btn_endQuiz.className = "btn-quiz next-question"
        btn_endQuiz.innerHTML = "End Quiz";
        btn_endQuiz.disabled = true;
        btn_endQuiz.addEventListener('click', endQuiz)
        questionDiv.appendChild(btn_endQuiz)
    }
}

function createAnswers(answers, hexaColors) {

    const answersDiv = document.createElement('div')
    answersDiv.className = "answers-container"
    for (let i = 0; i < answers.length; i++) {
        const button = document.createElement('button')
        button.innerHTML = answers[i]
        button.className = "answer"
        button.style.backgroundColor = hexaColors[i];
        button.addEventListener('click', answeredQuestion)
        answersDiv.appendChild(button);
    }
    questionDiv.appendChild(answersDiv);
}

function nextQuestion(e) {
    questionIndex++;
    mainDiV.className = "hqr-container"
    setQuestion(questions.results[questionIndex])
}

function answeredQuestion() {
    document.querySelector('.next-question').disabled = false;
    if(correctAnswer(this.innerText)) {
        mainDiV.classList.add('container-correct')
        const idxCategory = categories[questions.results[questionIndex].category] - 9;
        categoriesData[idxCategory].correct_answers++;
        score++;
    } else {
        mainDiV.classList.add('container-incorrect')
        const idxCategory = categories[questions.results[questionIndex].category] - 9;
        categoriesData[idxCategory].incorrect_answers++;
    }
    disabledAnswers();
    document.getElementById('score').innerText = `${score}/${numQuestions}`
}

function disabledAnswers() {
    const answers = document.getElementsByClassName("answer");
    for (const answer of answers) {
        answer.disabled = true;
        if(!correctAnswer(answer.innerText))
            answer.classList.add('wrong-answer')
    }
}

function correctAnswer(answer) {
    return answer.trim() === decodeHtml(questions.results[questionIndex].correct_answer);
}

function decodeHtml(html) {
    let txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffleAnswers(answers) {
    let currentIndex = answers.length;
    let randomIndex;

    while (currentIndex != 0) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [answers[currentIndex], answers[randomIndex]] = [
        answers[randomIndex], answers[currentIndex]];
    }

    return answers;
}

function endQuiz() {
    mainDiV.className = "hqr-container"
    resultDiv.classList.replace('hide', 'result');
    questionContainerDiv.classList.replace('question', 'hide');
    saveDataToLocalStorage();
    showResults();
}

function saveDataToLocalStorage() {
    const userPos = findUserByName(userName);

    if( userPos > -1 ) {
        // Old user
        quiz_data.users[userPos].quizsDone.push({
            numQuestions: numQuestions,
            correct_answers: score,
            incorrect_answers: numQuestions - score
        });
        quiz_data.users[userPos].categoriesData = sumCategoryData(quiz_data.users[userPos].categoriesData, categoriesData);
    }
    else {
        // New Usuario
        quiz_data.users.push({
            name: userName,
            quizsDone: [{
                numQuestions: numQuestions,
                correct_answers: score,
                incorrect_answers: numQuestions - score
            }],
            categoriesData: categoriesData 
        })
    }
    localStorage.setItem('quiz_data', JSON.stringify(quiz_data));
}

function findUserByName(userName) {
    for (let i = 0; i < quiz_data.users.length; i++) {
        if(userName === quiz_data.users[i].name) {
            return i;
        }
    }

    return -1;
}

function sumCategoryData(currentData, newData) {
    const result = []

    for (let i = 0; i < currentData.length; i++) {
        result.push({
            name: currentData[i].name,
            correct_answers: currentData[i].correct_answers + newData[i].correct_answers,
            incorrect_answers: currentData[i].incorrect_answers + newData[i].incorrect_answers
        })
    }

    return result;
}

/* --------------------------------------------- Result Logic ---------------------------------- */

function showResults() {
    let gifUrl, gifClass, textResult;
    const correctPercentage = getPercentage(score, numQuestions);
    switch(true) {
        case correctPercentage < 50:
            gifUrl = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354088200159252/1-4.gif";
            gifClass = 'gif-result-small';
            textResult= "bad"
            break;
        case correctPercentage < 70:
            gifUrl = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354088627966102/5-6.gif";
            gifClass = 'gif-result';
            break;
        case correctPercentage < 90:
            gifUrl = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354089085157406/7-8.gif";
            gifClass = 'gif-result';
            break;
        case correctPercentage >= 90:
            gifUrl = "https://cdn.discordapp.com/attachments/1024006726866972752/1029354089559097424/9-10.gif";
            gifClass = 'gif-result';
            break;
        default:
            console.log('Some error showing results.');
    }
    resultDiv.innerHTML =
    `
    <h1>Your score was ${score}/${numQuestions}</h1>
    <p>${textResult}</p>
    <img src="${gifUrl}" alt="asdf" class="${gifClass}">
    <div class="botones-result">
        <button class="btn-quiz" onclick="restartQuiz()">Restart Quiz</button>
        <button class="btn-quiz" onclick="goMainPage()">Go to main page</button>
    </div> 
    `
}

function getPercentage(current, total) {
    return current*100/total;
}

function restartQuiz() {
    resultDiv.classList.replace('result', 'hide');
    loadingDiv.classList.replace('hide', 'loading');
    score = 0;
    questionIndex = 0;
    getQuestions();
}

function goMainPage() {
    hideAllViews();
    homeDiv.classList.replace('hide', 'home')
}

function hideAllViews() {
    mainDiV.className = "hqr-container"
    classDiv.classList.replace('classification', 'hide')
    resultDiv.classList.replace('result', 'hide')
    homeDiv.classList.replace('home', 'hide')
    questionContainerDiv.classList.replace('question', 'hide');
    statsDiv.classList.replace('stats', 'hide');
}

/* --------------------------------------- Main Page Logic ---------------------------------- */

function startQuiz(e) {
    e.preventDefault();
    loadingDiv.classList.replace('hide', 'loading');
    userName = document.getElementById('name').value.trim();
    if(userName === "")
        userName = "Default"
    questionIndex = 0;
    score = 0;
    homeDiv.classList.replace('home', 'hide')
    getQuestions();
}

function createHomePage() {
    homeDiv.innerHTML = 
    `
        <form class="form-quiz" onsubmit="startQuiz(event)">
            <label for="name">Your name:</label>
            <input type="text" id="name" name="name" class="form-control"> <br>
            <label for="amount"> Number of Questions: </label><br>
            <select id="amount" name="amount" class="form-select">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
            </select>
            <br>
            <label for="category">Select Category: </label><br>
            <select name="category" id="category" class="form-select">
                <option value="">Any type</option>
                <option value="9">General Knowledge</option>
                <option value="10">Entertainment: Books</option>
                <option value="11">Entertainment: Film</option>
                <option value="12">Entertainment: Music</option>
                <option value="13">Entertainment: Musicals & Theatres</option>
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
                <option value="32">Entertainment: Cartoon & Animations</option>
            </select>
            <br><label for="difficulty">Select Difficulty: </label>
            <select name="difficulty" id="difficulty" class="form-select">
                <option value="">Any type</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </form>
        <button class="btn-quiz" onclick="startQuiz(event)">Start</button>
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
    button.className = 'btn-quiz';
    button.onclick = goMainPage;
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
                    info10questions.percentage = getPercentage(info10questions.correct_answers, info10questions.correct_answers + info10questions.incorrect_answers );
                    break;
                case "20":
                    info20questions.number += 1;
                    info20questions.correct_answers += quiz.correct_answers;
                    info20questions.incorrect_answers += quiz.incorrect_answers;
                    info20questions.percentage = getPercentage(info20questions.correct_answers, info20questions.correct_answers + info20questions.incorrect_answers );
                    break;
                case "30":
                    info30questions.number += 1;
                    info30questions.correct_answers += quiz.correct_answers;
                    info30questions.incorrect_answers += quiz.incorrect_answers;
                    info30questions.percentage = getPercentage(info30questions.correct_answers, info30questions.correct_answers + info30questions.incorrect_answers );
                    break;
                case "40":
                    info40questions.number += 1;
                    info40questions.correct_answers += quiz.correct_answers;
                    info40questions.incorrect_answers += quiz.incorrect_answers;
                    info40questions.percentage = getPercentage(info40questions.correct_answers, info40questions.correct_answers + info40questions.incorrect_answers );
                    break;
                case "50":
                    info50questions.number += 1;
                    info50questions.correct_answers += quiz.correct_answers;
                    info50questions.incorrect_answers += quiz.incorrect_answers;
                    info50questions.percentage = getPercentage(info50questions.correct_answers, info50questions.correct_answers + info50questions.incorrect_answers );
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

// ----------------------------    Stats Logic   --------------------------------------------
const labelsColors = [
    "rgb(96, 162, 15)",
    "rgb(197, 101, 103)",
    "rgb(254, 39, 206)",
    "rgb(143, 111, 233)",
    "rgb(227, 59, 92)",
    "rgb(82, 225, 110)",
    "rgb(169, 238, 128)",
    "rgb(199, 194, 124)",
    "rgb(114, 195, 155)",
    "rgb(226, 251, 169)",
    "rgb(142, 55, 24)",
    "rgb(240, 183, 96)",
    "rgb(18, 74, 183)",
    "rgb(239, 99, 63)",
    "rgb(66, 2, 109",
    "rgb(251, 62, 196)",
    "rgb(60, 107, 235)",
    "rgb(139, 19, 144)",
    "rgb(87, 142, 83)",
    "rgb(128, 61, 200)",
    "rgb(94, 224, 239)",
    "rgb(183, 180, 56)",
    "rgb(148, 164, 232)",
    "rgb(147, 156, 138)"
]

let actualGraphic = 2;
const numberGraphics = 3;

function nextGraphic() {
    actualGraphic = (actualGraphic + 1) % numberGraphics;
    createGraphicsForUser();
}

function previousGraphic() {
    actualGraphic = (actualGraphic + numberGraphics + 1) % numberGraphics;
    createGraphicsForUser();
}

function goStats() {
    hideAllViews();
    statsDiv.classList.replace('hide', 'stats');
    createStats();
}

function createStats() {

    while(statsDiv.firstChild) {
        statsDiv.removeChild(statsDiv.firstChild);
    }

    const userStatsSelectDiv = document.createElement('div');
    userStatsSelectDiv.className = 'select-container';

    const form = document.createElement('form');
    form.id = "select-user-form";
    const label = document.createElement('label')
    label.for="users-select";
    label.innerHTML='Select one user to see the stats:'
    form.appendChild(label);
    const select = document.createElement('select');
    select.className="form-select";
    select.name="users-select";
    select.id="users-select";
    select.onchange = changeUser;
    fillUserSelect(select);
    form.appendChild(select);
    userStatsSelectDiv.appendChild(form);
    statsDiv.appendChild(userStatsSelectDiv);

    const divGraphicsData = document.createElement('div');
    divGraphicsData.className = "graphics-data-container"
    statsDiv.appendChild(divGraphicsData);
    const divTitleGraphicsData = document.createElement('div');
    divTitleGraphicsData.className = "graphic-title";
    const h1 = document.createElement('h1');
    h1.id = 'title-graphic';
    divTitleGraphicsData.appendChild(h1);
    divGraphicsData.appendChild(divTitleGraphicsData);
    const userStatsGraphicsDiv = document.createElement('div');
    userStatsGraphicsDiv.id = 'graphics-container';
    userStatsGraphicsDiv.className = 'graphics-container';
    divGraphicsData.appendChild(userStatsGraphicsDiv);
    createGraphicsForUser();
    
    const button = document.createElement('button');
    button.innerHTML = 'Go to main page';
    button.className = 'btn-quiz back';
    button.onclick = goMainPage;
    statsDiv.appendChild(button);
}

function createGraphicsForUser() {
    const parentDiv = document.getElementById('graphics-container');
    const h1 = document.getElementById('title-graphic')

    while(parentDiv.firstChild) {
        parentDiv.removeChild(parentDiv.firstChild);
    }

    const left_arrow = document.createElement('img');
    left_arrow.src = 'assets/left-arrow.png'
    left_arrow.onclick = previousGraphic;
    left_arrow.className = 'arrow'
    parentDiv.appendChild(left_arrow);

    switch(actualGraphic) {
        case 0:
            h1.innerHTML = `Number of questions done for each category`;
            createPieGraphicData(parentDiv);
            break;
        case 1:
            h1.innerHTML = `Percentage of correct answers for each category`;
            createBarGraphicData(parentDiv);
            break;
        case 2:
            h1.innerHTML = `Numbers of quizs done for each numer of questions`;
            createHorizontalBarGraphicData(parentDiv);
            break;
        default:
            console.error('Error. Graph index not contemplated.');
    }

    const right_arrow = document.createElement('img');
    right_arrow.src = 'assets/right-arrow.png'
    right_arrow.onclick = nextGraphic;
    right_arrow.className = 'arrow';
    parentDiv.appendChild(right_arrow);
}

function changeUser() {
    createGraphicsForUser();
}

function createPieGraphicData(parentDiv) {
    const info = getUserDataNumberEachCategory();
    const divLegend = document.createElement('div'); 
    divLegend.className = "chart-legend";
    divLegend.id = "chart-legend";
    for (const key in labelsColors) {
        divLegend.innerHTML += 
        `
            <div class="color-label">
                <div class="color" style="background-color: ${labelsColors[key]}"></div>
                <div class="label">${info[0][key]}</div>
            </div>
        `
    }
    parentDiv.appendChild(divLegend);

    const divChart = document.createElement('div');
    divChart.className = 'mychart-container'
    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    pieGraphic(canvas, info);
    divChart.appendChild(canvas);
    parentDiv.appendChild(divChart);
}

function pieGraphic(canvas, info) {
    const ctx = canvas.getContext('2d');
    const labels = info[0];
    const dataValues = info[1];
    const data = {
    labels: labels,
    datasets: [
        {
            backgroundColor: labelsColors,
            data: dataValues,
        },
    ],
    };
    const config = {
    type: "pie",
    data: data,
    options: {
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false,
            } 
        }
    },
    };

    const myChart = new Chart(ctx, config);
}

function createHorizontalBarGraphicData(parentDiv) {
    const info = getUserDataQuizsDone();

    const divBarContainer = document.createElement('div'); 
    divBarContainer.className = "bar-container"

    const divChart = document.createElement('div');
    divChart.className = 'mychart-container-horizontalBar'
    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    horizontalBarGraphic(canvas, info);
    divChart.appendChild(canvas);
    divBarContainer.appendChild(divChart);
    
    parentDiv.appendChild(divBarContainer);
}

function horizontalBarGraphic(canvas, info) {
    const ctx = canvas.getContext('2d');
    const labels = info[0];
    const dataValues = info[1];
    const data = {
        labels: labels,
        datasets: [{
            data: dataValues,
            backgroundColor: labelsColors,
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'y',
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            labels: {
                display: false
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                } 
            }
        },
    };
    
    const myChart = new Chart(ctx, config);
}

function createBarGraphicData(parentDiv) {
    const info = getUserDataPercentageCategory();

    const divBarContainer = document.createElement('div'); 
    divBarContainer.className = "bar-container"
    const divLegend = document.createElement('div'); 
    divLegend.className = "chart-legend-horizontal";
    divLegend.id = "chart-legend-horizontal";
    for (const key in labelsColors) {
        divLegend.innerHTML += 
        `
            <div class="color-label">
                <div class="color" style="background-color: ${labelsColors[key]}"></div>
                <div class="label">${info[0][key]}</div>
            </div>
        `
    }
    divBarContainer.appendChild(divLegend);

    const divChart = document.createElement('div');
    divChart.className = 'mychart-container-bar'
    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    barGraphic(canvas, info);
    divChart.appendChild(canvas);
    divBarContainer.appendChild(divChart);
    
    parentDiv.appendChild(divBarContainer);
}

function barGraphic(canvas, info) {
    const ctx = canvas.getContext('2d');
    const labels = info[0];
    const dataValues = info[1];
    const data = {
        labels: labels,
        datasets: [{
            data: dataValues,
            backgroundColor: labelsColors,
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    ticks: {
                        display: false
                    }
                }
            },
            labels: {
                display: false
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                } 
            }
        },
    };
    
    const myChart = new Chart(ctx, config);
}

function getUserDataNumberEachCategory() {
    const quizUsersData = JSON.parse(localStorage.getItem("quiz_data")).users || [];
    const userName = document.getElementById('users-select').value;
    const result = [[], []]

    if(userName === 'all') {
        for (const category of quizUsersData[0].categoriesData) {
            result[0].push(category.name);
            result[1].push(category.correct_answers + category.incorrect_answers)
        }
        for (let i = 1; i < quizUsersData.length; i++) {
            for (let j = 0; j < result[1].length; j++) {
                result[1][j] += quizUsersData[i].categoriesData[j].correct_answers + quizUsersData[i].categoriesData[j].incorrect_answers;
            }
        }
    } else {
        const indexUser = findUserByName(userName);
        for (const category of quizUsersData[indexUser].categoriesData) {
            result[0].push(category.name);
            result[1].push(category.correct_answers + category.incorrect_answers)
        }
    }

    return result;
}

function getUserDataPercentageCategory() {
    const quizUsersData = JSON.parse(localStorage.getItem("quiz_data")).users || [];
    const userName = document.getElementById('users-select').value;
    const result = [[], []]

    if(userName === 'all') {
        for (const category of quizUsersData[0].categoriesData) {
            result[0].push(category.name);
            result[1].push([category.correct_answers, category.incorrect_answers])
        }
        for (let i = 1; i < quizUsersData.length; i++) {
            for (let j = 0; j < result[1].length; j++) {
                result[1][j][0] += quizUsersData[i].categoriesData[j].correct_answers;
                result[1][j][1] += quizUsersData[i].categoriesData[j].incorrect_answers;
            }
        }
        for (let j = 0; j < result[1].length; j++) {
            result[1][j] = getPercentage(result[1][j][0], result[1][j][0] + result[1][j][1]);
        }
    } else {
        const indexUser = findUserByName(userName);
        for (const category of quizUsersData[indexUser].categoriesData) {
            result[0].push(category.name);
            if(category.correct_answers || category.incorrect_answers) {
                result[1].push(getPercentage(category.correct_answers, category.correct_answers + category.incorrect_answers))
            } else {
                result[1].push(0);
            }
        }
    }

    return result;
}

function getUserDataQuizsDone() {
    const quizUsersData = JSON.parse(localStorage.getItem("quiz_data")).users || [];
    const userName = document.getElementById('users-select').value;
    const result = [['Quiz of 10 questions', 'Quiz of 20 questions', 'Quiz of 30 questions', 'Quiz of 40 questions', 'Quiz of 50 questions'], [0, 0, 0, 0, 0]]

    if(userName === 'all') {
        for (const user of quizUsersData) {
            for (const quiz of user.quizsDone) {
                switch(quiz.numQuestions) {
                    case "10":
                        result[1][0]++;
                        break;
                    case "20":
                        result[1][1]++;
                        break;
                    case "30":
                        result[1][2]++;
                        break;
                    case "40":
                        result[1][3]++;
                        break;
                    case "50":
                        result[1][4]++;
                        break;
                }
            }
        }
    } else {
        const indexUser = findUserByName(userName);
        for (const quiz of quizUsersData[indexUser].quizsDone) {
            switch(quiz.numQuestions) {
                case "10":
                    result[1][0]++;
                    break;
                case "20":
                    result[1][1]++;
                    break;
                case "30":
                    result[1][2]++;
                    break;
                case "40":
                    result[1][3]++;
                    break;
                case "50":
                    result[1][4]++;
                    break;
            }
        }
    }

    console.log(result);

    return result;
}

function fillUserSelect (select) {
    const quizUsersData = JSON.parse(localStorage.getItem("quiz_data")).users || [];
    const option = document.createElement('option');
    option.value = "all";
    option.innerHTML = 'All users';
    select.appendChild(option)

    if(quizUsersData.length > 0)
    {
        for (const user of quizUsersData ) {
            const option = document.createElement('option');
            option.value = user.name;
            option.innerHTML = user.name;
            select.appendChild(option)
        }
    }
}

createHomePage();
