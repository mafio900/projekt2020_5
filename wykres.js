let p = document.getElementById("p");
let k = document.getElementById("k");
const submit = document.getElementById("sub");
submit.addEventListener("click", ()=>{
    console.log(p.value);
    console.log(k.value);
});

const electron = require('electron');
const {ipcRenderer} = electron;
ipcRenderer.on('data', (event, data) => {
    processData(data.msg);
});


const lines = [];


const klasaA = new Array();
const klasaB = new Array();
const klasaC = new Array();

function coordinate(x, y) {
    this.x = x;
    this.y = y;
}

let inputs = document.getElementById("inputs");

function processData(allText) {
    inputs.style.display = "flex";

    const allTextLines = allText.split(/\r\n|\n/);

    for (var i = 0; i < allTextLines.length; i++) {
        allTextLines[i].split(',');
        lines.push(allTextLines[i].split(','));
    }

        //przydziel do klasy
        for (var i = 0; i < lines.length; i++) {
            if ((lines[i][2]) === "KlasaA")
                klasaA.push(new coordinate(Number.parseInt(lines[i][0]), Number.parseInt(lines[i][1])));
            if ((lines[i][2]) === "KlasaB")
                klasaB.push(new coordinate(Number.parseInt(lines[i][0]), Number.parseInt(lines[i][1])));
            if ((lines[i][2]) === "KlasaC")
                klasaC.push(new coordinate(Number.parseInt(lines[i][0]), Number.parseInt(lines[i][1])));
        }


    //wykres
    const ctx = document.getElementById('wykres').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Klasa A',
                data: klasaA,
                backgroundColor:
                    'rgba(0, 255, 0, 0.9)',
                borderColor:
                    'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                radius: 10,
                pointStyle: "triangle"
            }, {
                label: 'Klasa B',
                data: klasaB,
                backgroundColor:
                    'rgba(255, 99, 132, 0.9)',
                borderColor:
                    'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                radius: 10,
                pointStyle: "rect"
            }, {
                label: 'Klasa C',
                data: klasaC,
                backgroundColor:
                    'rgba(54, 162, 235, 0.9)',
                borderColor:
                    'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                radius: 10,
                pointStyle: "circle"
            }]
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
}
