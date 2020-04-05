let p = document.getElementById("p");
let k = document.getElementById("k");

const electron = require('electron');
const {ipcRenderer} = electron;
ipcRenderer.on('data', (event, data) => {
    processData(data.msg);
});

//Wyciągnięcie danych z innego okna danych jaki punkt ma być dodany
let pointToAdd;
ipcRenderer.on('point', (event, data) => {
    pointToAdd = data;
    console.log(pointToAdd);
});


const colorsBackground = ['rgba(0, 255, 0, 0.4)', 'rgba(255, 99, 132, 0.4)', 'rgba(54, 162, 235, 0.4)'];
const colorsBorder =  ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'];


function coordinate(x, y) {
    this.x = x;
    this.y = y;
}
let sortedData;
let names = [];
function processData(allText) {
    let inputs = document.getElementById("inputs");

    let lines = [];
    let data = [];
    names = [];

    sortedData = new Map();
    inputs.style.display = "flex";

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
        for(let line of lines){
            if(line[line.length-1]===name){
                line.pop();
                data[i].push(line);
            }
        }
    });

    data.forEach((d, i)=>{
        sortedData.set(names[i], d);
    });

    ipcRenderer.send("lines", {msg: lines[0].length});

    //Dodawanie przycisków wybierania kolumn do wyświetlenia
    let selectCol1 = document.getElementById("selectCol1");
    selectCol1.textContent = '';
    selectCol1.style.display = "flex";
    for(let i = 0; i < lines[0].length; i++){
        let node = document.createElement("input");
        node.type = "radio";
        node.name = "col1";
        node.id = "col1"+i.toString();
        selectCol1.appendChild(node);

        let label = document.createElement("label");
        label.htmlFor = i.toString();
        label.textContent = "Kolumna: " + (i+1).toString()+" ";
        selectCol1.appendChild(label);
    }

    let selectCol2 = document.getElementById("selectCol2");
    selectCol2.style.display = "flex";
    selectCol2.textContent = '';
    for(let i = 0; i < lines[0].length; i++){
        let node = document.createElement("input");
        node.type = "radio";
        node.name = "col2";
        node.id = "col2"+i.toString();
        selectCol2.appendChild(node);

        let label = document.createElement("label");
        label.htmlFor = i.toString();
        label.textContent = "Kolumna: " + (i+1).toString()+" ";
        selectCol2.appendChild(label);
    }
}


//tworzenie tabeli z wybranymi kolumnami do wyświetlenia po wciśnięciu przycisku
let licznik = false;
let myChart;
const showChart = () => {
    if(licznik){
        myChart.destroy();
    }
    licznik = true;
    const dataSet = [];
    const col1 = document.getElementsByName('col1');
    const col2 = document.getElementsByName('col2');

    let c1;
    let c2;
    for (let i = 0; i < col1.length; i++) {
        if (col1[i].checked) {
            c1 = col1[i].id.slice(4,col1[i].length);
            break;
        }
    }
    for (let i = 0; i < col2.length; i++) {
        if (col2[i].checked) {
            c2 = col2[i].id.slice(4,col2[i].length);
            break;
        }
    }

    for(name of names){
        let tmp = sortedData.get(name);
        let tmp2 = [];
        tmp.forEach((t)=>{
            tmp2.push(new coordinate(Number.parseInt(t[c1]), Number.parseInt(t[c2])));
        });
        dataSet.push(tmp2);
    }

    let dataSets = [];
    dataSet.forEach((d, i)=>{
        dataSets.push({
            label: names[i],
            data: d,
            backgroundColor: colorsBackground[i],
            borderColor: colorsBorder[i],
            borderWidth: 1,
            radius: 10,
            pointStyle: "triangle",
            showLine: true
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
const submit = document.getElementById("sub");
submit.addEventListener("click", ()=>{
    showChart();
});
