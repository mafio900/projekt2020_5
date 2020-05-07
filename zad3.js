const electron = require('electron');
const { ipcRenderer, remote } = electron;
let splitInput = document.getElementById("splitInput");
let uczacy = [];
let testujacy = [];

let pInput = document.getElementById("p_zad3");
let kInput = document.getElementById("k_zad3");
let p;
let k;
var komunikat = document.getElementById("komunikat");
var node = document.createElement("p");

node.style.color = "red";
node.textContent = "Wczytaj dane (ctrl + z)";
komunikat.appendChild(node);

ipcRenderer.on('data', (event, data) => {
    processData(data.msg);
    komunikat.removeChild(node);
    node.style.color = "green";
    node.textContent = "Pomyślnie wczytano dane.";
    komunikat.appendChild(node);
    setTimeout(() => {
        komunikat.removeChild(node);
    }, 2500)
});


let names = [];
let lines = [];
let data = [];
let test = [];
function processData(allText) {
    names = [];
    lines = [];
    data = [];
    test = [];
    let inputs = document.getElementById("inputs");
    inputs.style.display = "";
    let allTextLines = allText.split(/\r\n|\n/);

    for (let i = 0; i < allTextLines.length; i++) {
        allTextLines[i].split(',');
        lines.push(allTextLines[i].split(','));
    }
    console.log(lines);

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
                    xd.push(Number.parseInt(l));
                }
                test[i].push(xd);
            }
        }
    });
}

const splitFile = document.getElementById("splitFile");
const calculate = document.getElementById("calculate");
splitFile.addEventListener("click", () => {
    let ileW = Number.parseInt(splitInput.value);
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);

    console.log('k: ' + k + ', p: ' + p);
    let toSlice = [];
    for (let i = 0; i < data.length; i++) {
        toSlice[i] = [];
        console.log('data[1]length: ' + data[i].length);
        for (let j = 0; j < data[i].length; j++) {
            toSlice[i][j] = data[i][j];
        }
    }
    splitInput.value = "";
    calculate.style.display = "";
    for(let [i,ts] of toSlice.entries()){
        uczacy[i] = [];
    }

    for(let i = 0; i < toSlice.length; i++) {
        const l = toSlice[i].length;
        for (let j = 0; j < ileW / toSlice.length && j < l; j++) {
            const r = Math.floor(Math.random() * (toSlice[i].length - 1));
            uczacy[i].push(toSlice[i][r]);
            toSlice[i].splice(r, 1);
        }
        if(uczacy[i].length < ileW/toSlice.length){
            let left = (ileW / toSlice.length) - uczacy[i].length;
            for(let ii = 0; ii < toSlice.length; ii++) {
                if(toSlice[ii].length > 0) {
                    const ll = toSlice[ii].length;
                    let licz = 0;
                    for (let j = 0; j < left && j < ll; j++) {
                        const r = Math.floor(Math.random() * (toSlice[ii].length - 1));
                        uczacy[ii].push(toSlice[ii][r]);
                        toSlice[ii].splice(r, 1);
                        licz++;
                        console.log(licz);
                    }
                    left -=licz;
                }
            }
        }
    }
    for(let d of toSlice){
        testujacy = [...testujacy, ...d];
    }

    node.textContent = "Podzielono na zbiory uczący i testujący.";
    komunikat.appendChild(node);
    setTimeout(() => {
        komunikat.removeChild(node);
    }, 2500)
});

const dataText = document.getElementById("dataText");
calculate.addEventListener("click", () => {

    addLearnTable();
    addTestingTable();
});

function distance(p1, p2) {
    let sum = 0;
    for (let i = 0; i < p1.length - 1; i++) {
        sum += Math.pow(Math.abs(p1[i] - p2[i]), p);
    }
    sum = Math.pow(sum, 1 / p);
    return sum;
}

function find_neighbors(point) {
    const dists = [];
    for (let i = 0; i < uczacy.length; i++) {
        for (let j = 0; j < uczacy[i].length; j++) {
            const dist = distance(point, uczacy[i][j]);
            dists.push([dist, [uczacy[i][j], i]]);
        }
    }
    dists.sort(function (a, b) { return a[0] - b[0] });
    const neighbors = [];
    for (let i = 0; i < k && i < dists.length; i++) {
        neighbors.push(dists[i][1]);
    }
    return neighbors;
}

function majority_vote(ps) {
    let votes = new Map();
    for (let c = 0; c < names.length; c++) {
        votes.set(names[c], 0);
    }
    for (let c = 0; c < names.length; c++) {
        for (let i = 0; i < ps.length; i++) {
            if (c === ps[i][1]) {
                votes.set(names[c], votes.get(names[c]) + 1);
            }
        }
    }

    let max_votes = 0;
    let winner = null;
    for (let c = 0; c < names.length; c++) {
        if (votes.get(names[c]) === max_votes) {
            winner = null;
        } else if (votes.get(names[c]) > max_votes) {
            max_votes = votes.get(names[c]);
            winner = c;
        }
    }
    return winner;
}

//wyswietla tabele ze zbiorem testujacym
function addTestingTable() {
    var div1 = document.createElement('div');
    div1.className = "section-table-2";
    var h = document.createElement('h3');
    h.innerHTML = "Zestaw testujących";
    div1.appendChild(h);
    var table = document.createElement('table');
    table.className = "table";
    let classificationPercent = 0;
    for (let [i, po] of testujacy.entries()) {
        const fn = find_neighbors(po);
        const mv = majority_vote(fn);

        console.log("Podany punkt o wspolrzednych: " + po + " nalezy do: " + names[mv]);

        //tworzymy wiersze
        var tr = document.createElement('tr');

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(i + 1));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(po));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(names[mv]));
        tr.appendChild(td);

        //dla każdego wiersza sprawdzamy czy wyliczona wartość mv jest zgodna z typem punktu z excela
        //jeśli jest zgodna to w tabeli zaznaczy się na kolor zielony jeśli nie to na czerwony
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < data[i].length; j++) {
                if (po === data[i][j]) {
                    if (mv === i) {
                        tr.style.backgroundColor = "green";
                        classificationPercent++;
                    }
                    else {
                        tr.style.backgroundColor = "red";
                    }
                }
            }
            table.appendChild(tr);
        }

    }
    console.log(classificationPercent/testujacy.length);
    const classificationTr = document.createElement('tr');
    const classificationTd = document.createElement('td');
    classificationTd.textContent = "Dokładność klasyfikacji wynosi: " + ((classificationPercent/testujacy.length)*100).toPrecision(4).toString() + "%";
    classificationTd.colSpan = 3;
    classificationTr.appendChild(classificationTd);
    table.appendChild(classificationTr);
    div1.appendChild(table);
    dataText.appendChild(div1);

}

//wyświetla tebelę ze zbiorem uczącym się
function addLearnTable() {
    var div2 = document.createElement('div');
    div2.className = "section-table-1";
    var h = document.createElement('h3');
    h.innerHTML = "Zestaw uczących się";
    div2.appendChild(h);
    var table2 = document.createElement('table');
    table2.className = "table";

    //najpierw uczacy[0] czyli lagodne
    for (j = 0; j < uczacy[0].length; j++) {
        var tr = document.createElement('tr');

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(j + 1));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(uczacy[0][j]));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode('lagodny'));
        tr.appendChild(td);

        table2.appendChild(tr);
    }

    //potem wyswietlane uczacy[1] czyli zlosliwe  --mozna by to wyswietlac jakos randomowo ale nie wiem za bardzo jak 
    for (j = 0; j < uczacy[1].length; j++) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.appendChild(document.createTextNode(j + uczacy[0].length+1));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(uczacy[1][j]));
        tr.appendChild(td);

        var td = document.createElement('td');
        td.appendChild(document.createTextNode('zlosliwy'));
        tr.appendChild(td);

        table2.appendChild(tr);
    }
    div2.appendChild(table2);
    dataText.appendChild(div2);
}

