const electron = require('electron');
const {ipcRenderer, remote} = electron;
let splitInput = document.getElementById("splitInput");
let uczacy = [];
let testujacy = [];

const p = 2;
const k = 3;
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
    setTimeout(()=> {
        komunikat.removeChild(node);
    },2500)
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

    for(let line of lines){
        let flag = false;
        for(let name of names){
            if(name === line[line.length-1])
                flag = true;
        }
        if(!flag){
            names.push(line[line.length-1]);
        }
    }
    names.forEach((name, i)=>{
        data[i] = [];
        test[i] = [];
        for(let line of lines){
            let xd = [];
            if(line[line.length-1]===name){
                line.pop();
                data[i].push(line);
                for(let l of line){
                    xd.push(Number.parseInt(l));
                }
                test[i].push(xd);
            }
        }
    });
}

const splitFile = document.getElementById("splitFile");
const calculate = document.getElementById("calculate");
splitFile.addEventListener("click", ()=>{
    let ileW = Number.parseInt(splitInput.value);
    let toSlice = [];
    for(let i = 0; i < data.length; i++){
        toSlice[i] = [];
        for(let j = 0; j < data[i].length; j++){
            toSlice[i][j] = data[i][j];
        }
    }
    splitInput.value = "";
    calculate.style.display = "";
    for(let i = 0; i < toSlice.length; i++) {
        uczacy[i] = [];
        if(toSlice[i].length <= ileW/toSlice.length){
            uczacy[i] = toSlice[i];
            for (let n = 0; n < (ileW/toSlice.length) - toSlice[i].length; n++) {
                const r = Math.floor(Math.random()*(toSlice[0].length-1));
                uczacy[0].push(toSlice[0][r]);
                toSlice[0].splice(r,1);
            }
        }
        else{
            for (let j = 0; j < ileW / toSlice.length; j++) {
                const r = Math.floor(Math.random()*(toSlice[i].length-1));
                uczacy[i].push(toSlice[i][r]);
                toSlice[i].splice(r,1);
            }
        }
    }
    for(let d of toSlice){
        testujacy = [...testujacy, ...d];
    }

    node.textContent = "Podzielono na zbiory uczący i testujący.";
    komunikat.appendChild(node);
    setTimeout(()=> {
        komunikat.removeChild(node);
    },2500)
});

const dataText = document.getElementById("dataText");
calculate.addEventListener("click", ()=>{
    for(let [i, po] of testujacy.entries()){
        const fn = find_neighbors(po);
        const mv = majority_vote(fn);
        console.log("Podany punkt o wspolrzednych: "+ po + " nalezy do: "+names[mv]);
        const node = document.createElement("p");
        const br = document.createElement("br");
        node.textContent = (i+1)+". Podany punkt o wspolrzednych: "+ po + " nalezy do: "+names[mv];

        if(names[mv] == "zlosliwy")
            node.style.color = "red";
        else
            node.style.color = "green";

        dataText.appendChild(node);
        dataText.appendChild(br);
    }
});

function distance(p1, p2) {
    let sum = 0;
    for(let i =0; i < p1.length-1; i++){
        sum += Math.pow(Math.abs(p1[i] - p2[i]), p);
    }
    sum = Math.pow(sum, 1/p);
    return sum;
}

function find_neighbors(point) {
    const dists = [];
    for (let i = 0; i < uczacy.length; i++) {
        for(let j = 0; j < uczacy[i].length; j++) {
            const dist = distance(point, uczacy[i][j]);
            dists.push( [ dist, [uczacy[i][j], i] ] );
        }
    }
    dists.sort(function(a, b) { return a[0] - b[0]});
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
            if(c===ps[i][1]) {
                votes.set(names[c], votes.get(names[c]) + 1);
            }
        }
    }

    var max_votes = 0;
    var winner = null;
    for (var c = 0; c < names.length; c++) {
        if (votes.get(names[c]) === max_votes) {
            winner = null;
        } else if (votes.get(names[c]) > max_votes) {
            max_votes = votes.get(names[c]);
            winner = c;
        }
    }
    return winner;
}
