let pInput = document.getElementById("p");
let kInput = document.getElementById("k");
let p;
let k;
const nazwaTwoichPunktow = 'Twoje punkty';

let komunikat = document.getElementById("komunikat");
let node = document.createElement("p");
node.style.color = "red";
node.textContent = "Wczytaj dane (ctrl + z)";
komunikat.appendChild(node);

const electron = require('electron');
const {ipcRenderer} = electron;
ipcRenderer.on('data', (event, data) => {
    //komunikat.removeChild(node);
    node.style.color = "green";
    node.textContent = "Pomyślnie wczytano dane, trwa przetwarzanie...";
    komunikat.appendChild(node);
    setTimeout(() => {
        komunikat.removeChild(node);
        processData(data.msg);
    }, 2500);
});

//Wyciągnięcie danych z innego okna danych jaki punkt ma być dodany
const addPointButton = document.getElementById("addPointButton");
addPointButton.addEventListener("click", () => {
    if (!(data.length > 0)) {
        node.textContent = "Nie wczytano pliku!";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        return;
    }
    ipcRenderer.send("showAddPoint");
});

let points = [];
ipcRenderer.on('point', (event, data) => {
    points.push(data);
    showChart();
});


const colorsBackground = ['rgba(0, 255, 0, 0.4)', 'rgba(255, 99, 132, 0.4)', 'rgba(54, 162, 235, 0.4)', 'rgba(100, 100, 100, 0.4)'];
const colorsBorder = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(100, 100, 100, 1)'];


function coordinate(x, y) {
    this.x = x;
    this.y = y;
}

let sortedData;
let names = [];
let test = [];
let data = [];

function processData(allText) {
    let inputs = document.getElementById("inputs");

    let lines = [];
    data = [];
    names = [];
    points = [];

    sortedData = new Map();

    //sortowanie do poszczególnych grup każdej lini
    let allTextLines = allText.split(/\r\n|\n/);

    for (let i = 0; i < allTextLines.length; i++) {
        lines.push(allTextLines[i].split(','));
    }

    let columns = lines[0].length;
    for (let line of lines) {
        if (columns !== line.length) {
            node.style.color = "red";
            node.textContent = "Niepoprawne dane";
            komunikat.appendChild(node);
            return;
        }
        for (let i = 0; i < line.length - 1; i++) {
            if (isNaN(line[i])) {
                node.style.color = "red";
                node.textContent = "Niepoprawny typ danych";
                komunikat.appendChild(node);
                return;
            }
        }
    }
    inputs.style.display = "";

    for (let line of lines) {
        let flag = false;
        for (let name of names) {
            if (name === line[line.length - 1])
                flag = true;
        }
        if (!flag) {
            names.push(line[line.length - 1]);
        }
    }
    names.forEach((name, i) => {
        data[i] = [];
        test[i] = [];
        for (let line of lines) {
            let xd = [];
            if (line[line.length - 1] === name) {
                line.pop();
                data[i].push(line);
                for (let l of line) {
                    xd.push(Number.parseFloat(l));
                }
                test[i].push(xd);
            }
        }
    });
    names.push(nazwaTwoichPunktow);

    data.forEach((d, i) => {
        sortedData.set(names[i], d);
    });


    ipcRenderer.send("lines", {msg: lines[0].length});

    //Dodawanie przycisków wybierania kolumn do wyświetlenia
    let selectCol1 = document.getElementById("selectCol1");
    selectCol1.textContent = "";
    selectCol1.className = "field opinion-scale";

    let ul = document.createElement("ul");
    selectCol1.appendChild(ul);
    let kolumna = document.createElement("p");
    kolumna.append("Wybierz kolumny:");
    kolumna.id = "kolumna";
    selectCol1.prepend(kolumna);

    for (let i = 0; i < lines[0].length; i++) {
        let li = document.createElement("li");
        ul.appendChild(li);

        let node = document.createElement("input");
        node.type = "radio";
        node.name = "opinion1-scale";
        node.value = i.toString();
        node.id = "option1-" + i.toString();
        li.appendChild(node);

        let label = document.createElement("label");
        label.className = "label is-large";
        label.htmlFor = "option1-" + i.toString();
        li.appendChild(label);
        label.append((i + 1).toString());
    }

    let selectCol2 = document.getElementById("selectCol2");
    selectCol2.textContent = "";
    selectCol2.className = "field opinion-scale";

    let ul2 = document.createElement("ul");
    selectCol2.appendChild(ul2);

    for (let i = 0; i < lines[0].length; i++) {

        let li = document.createElement("li");
        ul2.appendChild(li);

        let node = document.createElement("input");
        node.type = "radio";
        node.name = "opinion2-scale";
        node.value = i.toString();
        node.id = "option2-" + i.toString();
        li.appendChild(node);

        let label = document.createElement("label");
        label.className = "label is-large";
        label.htmlFor = "option2-" + i.toString();
        li.appendChild(label);
        label.append((i + 1).toString());
    }
}

//tworzenie tabeli z wybranymi kolumnami do wyświetlenia po wciśnięciu przycisku

let licznik = false;
let myChart;
let c1;
let c2;
const showChart = () => {
    if (licznik) {
        myChart.destroy();
    }
    licznik = true;
    const dataSet = [];
    const col1 = document.getElementsByName('opinion1-scale');
    const col2 = document.getElementsByName('opinion2-scale');


    for (let i = 0; i < col1.length; i++) {
        if (col1[i].checked) {
            c1 = col1[i].id.slice(8, col1[i].length);
            break;
        }
    }
    for (let i = 0; i < col2.length; i++) {
        if (col2[i].checked) {
            c2 = col2[i].id.slice(8, col2[i].length);
            break;
        }
    }

    for (name of names) {
        let tmp2 = [];
        if (name === nazwaTwoichPunktow && points !== []) {
            points.forEach((t) => {
                tmp2.push(new coordinate(Number.parseFloat(t[c1]), Number.parseFloat(t[c2])));
            });
        } else {
            let tmp = sortedData.get(name);
            tmp.forEach((t) => {
                tmp2.push(new coordinate(Number.parseFloat(t[c1]), Number.parseFloat(t[c2])));
            });
        }
        dataSet.push(tmp2);
    }
    //test = dataSet;

    let dataSets = [];
    dataSet.forEach((d, i) => {
        dataSets.push({
            label: names[i],
            data: d,
            backgroundColor: colorsBackground[i],
            borderColor: colorsBorder[i],
            borderWidth: 1,
            radius: 6,
            pointStyle: "circle"
        });
    });

    //wykres
    const canvas = document.getElementById("wykres");
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: dataSets
        },
        options: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    padding: 10
                }
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
};


const testDiv = document.getElementById("testDiv");
const submit = document.getElementById("sub");
submit.addEventListener("click", () => {
    if (!(data.length > 0)) {
        node.textContent = "Nie wczytano pliku!";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        return;
    }
    showChart();
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);
    testDiv.style.display = "";
});

const testb = document.getElementById("test");
const classPoints = document.getElementById("classificationContent");
testb.addEventListener("click", () => {
    if (!(data.length > 0)) {
        node.textContent = "Nie wczytano pliku!";
        komunikat.appendChild(node);
        setTimeout(() => {
            komunikat.removeChild(node);
        }, 1500);
        return;
    }
    if (points.length === 0) {
        return;
    }
    let l = 0;
    const tableClass = document.createElement('table');
    tableClass.className = "table";
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);
    for (let po of points) {
        const fn = find_neighbors(po, test);
        const mv = majority_vote(fn);
        const neighborsTable = [];
        for(let i = 0; i < fn.length; i++){
            if(fn[i][1] === mv){
                neighborsTable.push(fn[i][0]);
            }
        }

        const tr = document.createElement('tr');
        let td = document.createElement('td');
        td.appendChild(document.createTextNode(++l));
        tr.appendChild(td);

        td = document.createElement('td');
        const divPoint = document.createElement('div');
        divPoint.appendChild(document.createTextNode(po));
        divPoint.id = l.toString();
        divPoint.className = "classClick";
        const neighborsText = document.createElement('p');
        neighborsText.id = l.toString() + "n";
        neighborsText.className = "hideText";
        neighborsTable.forEach((neigh)=>{
            const neighborText = document.createElement("p");
            neighborText.textContent = neigh;
            neighborsText.appendChild(neighborText);
        });
        divPoint.appendChild(neighborsText);
        td.appendChild(divPoint);
        tr.appendChild(td);

        td = document.createElement('td');
        td.appendChild(document.createTextNode(names[mv]));
        tr.appendChild(td);
        tableClass.appendChild(tr);
    }

    classPoints.textContent = "";
    const infoH = document.createElement('h3');
    infoH.innerHTML = "Zklasyfikowane punkty";
    const infoP = document.createElement('p');
    infoP.appendChild(infoH);
    classPoints.appendChild(infoP);
    classPoints.appendChild(tableClass);

    const els = document.getElementsByClassName("classClick");
    Array.from(els).forEach((el) => {
        el.addEventListener("click", ()=>{
            const neighbor = document.getElementById(el.id.toString() + "n");
            if(neighbor.className === "hideText"){
                neighbor.className = "";
            }else{
                neighbor.className = "hideText";
            }
        });
    });
});

function distance(p1, p2) {
    let sum = 0;
    for (let i = 0; i < p1.length; i++) {
        sum += Math.pow(Math.abs(p1[i] - p2[i]), p);
    }
    sum = Math.pow(sum, 1 / p);
    return sum;
}

function find_neighbors(point, tt) {
    const dists = [];
    for (let i = 0; i < tt.length; i++) {
        for (let j = 0; j < tt[i].length; j++) {
            const dist = distance(point, tt[i][j]);
            dists.push([dist, [tt[i][j], i]]);
        }
    }
    dists.sort(function (a, b) {
        return a[0] - b[0]
    });
    const neighbors = [];
    for (let i = 0; i < k && i < dists.length; i++) {
        neighbors.push(dists[i][1]);
    }
    return neighbors;
}

function majority_vote(ps) {
    let votes = new Map();
    for (let c = 0; c < names.length - 1; c++) {
        votes.set(c, 0);
    }
    for (let c = 0; c < names.length - 1; c++) {
        for (let i = 0; i < ps.length; i++) {
            if (c === ps[i][1]) {
                votes.set(c, votes.get(c) + 1);
            }
        }
    }

    let max_votes = 0;
    let winner = null;
    for (let c = 0; c < names.length - 1; c++) {
        if (votes.get(c) === max_votes) {
            winner = null;
        }
        if (votes.get(c) > max_votes) {
            max_votes = votes.get(c);
            winner = c;
        }
    }
    if (winner === null) {
        let equalVoters = [];
        votes.forEach((value, key) => {
            if (value === max_votes) {
                equalVoters.push(key);
            }
        });
        let newWinnerLength = 0;
        for (let c = 0; c < equalVoters.length; c++) {
            if (data[c].length > newWinnerLength) {
                newWinnerLength = data[c].length;
                winner = c;
            }
        }
    }
    return winner;
}

// przyciski p i k
jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up">+</div><div class="quantity-button quantity-down">-</div></div>').insertAfter('.quantity input');
jQuery('.quantity').each(function () {
    var spinner = jQuery(this),
        input = spinner.find('input[type="number"]'),
        btnUp = spinner.find('.quantity-up'),
        btnDown = spinner.find('.quantity-down'),
        min = input.attr('min'),
        max = input.attr('max');

    btnUp.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue >= max) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue + 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
    });

    btnDown.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue <= min) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue - 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");

    });

});
// koniec przyciski p i k
