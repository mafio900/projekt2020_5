const electron = require('electron');
const {ipcRenderer, remote} = electron;
let splitInput = document.getElementById("splitInput");
let uczacy = [];
let testujacy = [];

ipcRenderer.on('data', (event, data) => {
    processData(data.msg);
});

let names = [];
let lines = [];
let data = [];
function processData(allText) {
    names = [];
    lines = [];
    data = [];
    let inputs = document.getElementById("inputs");
    inputs.style.display = "flex";
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
        for(let line of lines){
            let xd = [];
            if(line[line.length-1]===name){
                line.pop();
                data[i].push(line);
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
    calculate.style.display = "flex";
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
});


