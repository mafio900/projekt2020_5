const electron = require('electron');
const {ipcRenderer, remote} = electron;

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



