let pInput = document.getElementById("p");
let kInput = document.getElementById("k");
let p;
let k;
const nazwaTwoichPunktow = 'Twoje punkty';

const electron = require('electron');
const {ipcRenderer} = electron;
ipcRenderer.on('data', (event, data) => {
    processData(data.msg);
});

//Wyciągnięcie danych z innego okna danych jaki punkt ma być dodany
let points = [];
ipcRenderer.on('point', (event, data) => {
    points.push(data);
    showChart();
});


const colorsBackground = ['rgba(0, 255, 0, 0.4)', 'rgba(255, 99, 132, 0.4)', 'rgba(54, 162, 235, 0.4)', 'rgba(100, 100, 100, 0.4)'];
const colorsBorder =  ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(100, 100, 100, 1)'];


function coordinate(x, y) {
    this.x = x;
    this.y = y;
}
let sortedData;
let names = [];
let test = [];
function processData(allText) {
    let inputs = document.getElementById("inputs");

    let lines = [];
    let data = [];
    names = [];
    points = [];

    sortedData = new Map();
    inputs.style.display = "";

    //sortowanie do poszczególnych grup każdej lini
    let allTextLines = allText.split(/\r\n|\n/);

    for (var i = 0; i < allTextLines.length; i++) {
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
    names.push(nazwaTwoichPunktow);

    data.forEach((d, i)=>{
        sortedData.set(names[i], d);
    });


    ipcRenderer.send("lines", {msg: lines[0].length});

    //Dodawanie przycisków wybierania kolumn do wyświetlenia
    let selectCol1 = document.getElementById("selectCol1");
    selectCol1.className = "field opinion-scale";

    let ul = document.createElement("ul");
    selectCol1.appendChild(ul);
    let kolumna = document.createElement("p");
    kolumna.append("Wybierz kolumny:");
    kolumna.id = "kolumna";
    selectCol1.prepend(kolumna);

    for(let i = 0; i < lines[0].length; i++){
        let li = document.createElement("li");
        ul.appendChild(li);

        let node = document.createElement("input");
        node.type = "radio";
        node.name = "opinion1-scale";
        node.value = i.toString();
        node.id = "option1-"+ i.toString();
        li.appendChild(node);

        let label = document.createElement("label");
        label.className = "label is-large";
        label.htmlFor = "option1-"+ i.toString();
        li.appendChild(label);
        label.append((i+1).toString());
    }

    let selectCol2 = document.getElementById("selectCol2");
    selectCol2.className = "field opinion-scale";

    let ul2 = document.createElement("ul");
    selectCol2.appendChild(ul2);

    for(let i = 0; i < lines[0].length; i++){

        let li = document.createElement("li");
        ul2.appendChild(li);

        let node = document.createElement("input");
        node.type = "radio";
        node.name = "opinion2-scale";
        node.value = i.toString();
        node.id = "option2-"+ i.toString();
        li.appendChild(node);

        let label = document.createElement("label");
        label.className = "label is-large";
        label.htmlFor = "option2-"+ i.toString();
        li.appendChild(label);
        label.append((i+1).toString());
    }
}

//tworzenie tabeli z wybranymi kolumnami do wyświetlenia po wciśnięciu przycisku

let licznik = false;
let myChart;
let c1;
let c2;
const showChart = () => {
    if(licznik){
        myChart.destroy();
    }
    licznik = true;
    const dataSet = [];
    const col1 = document.getElementsByName('opinion1-scale');
    const col2 = document.getElementsByName('opinion2-scale');


    for (let i = 0; i < col1.length; i++) {
        if (col1[i].checked) {
            c1 = col1[i].id.slice(8,col1[i].length);
            break;
        }
    }
    for (let i = 0; i < col2.length; i++) {
        if (col2[i].checked) {
            c2 = col2[i].id.slice(8,col2[i].length);
            break;
        }
    }

    for(name of names){
        let tmp2 = [];
        if(name === nazwaTwoichPunktow && points !== []){
            points.forEach((t)=>{
                tmp2.push(new coordinate(Number.parseInt(t[c1]), Number.parseInt(t[c2])));
            });
        }
        else{
            let tmp = sortedData.get(name);
            tmp.forEach((t)=>{
                tmp2.push(new coordinate(Number.parseInt(t[c1]), Number.parseInt(t[c2])));
            });
        }
        dataSet.push(tmp2);
    }
    //test = dataSet;

    let dataSets = [];
    dataSet.forEach((d, i)=>{
        dataSets.push({
            label: names[i],
            data: d,
            backgroundColor: colorsBackground[i],
            borderColor: colorsBorder[i],
            borderWidth: 1,
            radius: 3,
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
submit.addEventListener("click", ()=>{
    showChart();
    k = Number.parseInt(kInput.value);
    p = Number.parseInt(pInput.value);
    testDiv.style.display = "";
});

const testb = document.getElementById("test");
testb.addEventListener("click", ()=>{
    let l = 0;
    for(let po of points){
        l++;
        const fn = find_neighbors(po);
        const mv = majority_vote(fn);
        console.log("Podany punkt o wspolrzednych x:"+po[c1]+" y:"+po[c2]+" nalezy do: "+names[mv]);
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
    for (let i = 0; i < test.length; i++) {
        for(let j = 0; j < test[i].length; j++) {
            const dist = distance(point, test[i][j]);
            dists.push( [ dist, [test[i][j], i] ] );
        }
    }
    dists.sort(function(a, b) { return a[0] - b[0]});
    const neighbors = [];
    for (let i = 0; i < k && i < dists.length; i++) {
        neighbors.push(dists[i][1]);
    }
    console.log(neighbors);
    return neighbors;
}

function majority_vote(ps) {
    let votes = new Map();
    for (let c = 0; c < names.length-1; c++) {
        votes.set(names[c], 0);
    }
    for (let c = 0; c < names.length-1; c++) {
        for (let i = 0; i < ps.length; i++) {
            if(c===ps[i][1]) {
                votes.set(names[c], votes.get(names[c]) + 1);
            }
        }
    }

    var max_votes = 0;
    var winner = null;
    for (var c = 0; c < names.length-1; c++) {
        if (votes.get(names[c]) === max_votes) {
            winner = null;
        } else if (votes.get(names[c]) > max_votes) {
            max_votes = votes.get(names[c]);
            winner = c;
        }
    }
    return winner;
}

// przyciski p i k
jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up">+</div><div class="quantity-button quantity-down">-</div></div>').insertAfter('.quantity input');
jQuery('.quantity').each(function() {
    var spinner = jQuery(this),
    input = spinner.find('input[type="number"]'),
    btnUp = spinner.find('.quantity-up'),
    btnDown = spinner.find('.quantity-down'),
    min = input.attr('min'),
    max = input.attr('max');

    btnUp.click(function() {
        var oldValue = parseFloat(input.val());
        if (oldValue >= max) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue + 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
    });

    btnDown.click(function() {
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
