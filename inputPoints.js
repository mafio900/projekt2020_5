const electron = require('electron');
const {ipcRenderer, remote} = electron;
let lines;
const addPoint = document.getElementById("addPoint");
console.log("lol");

ipcRenderer.send('sendLines');

ipcRenderer.on('data', (event, data) => {
    lines = data.msg;
    console.log("xd");
    for(let i = 0; i < lines; i++){

        //Dodanie inputów do dodania punktu na wykresie
        let text = document.createElement("input");
        text.type = "number";
        text.placeholder = "kolumna nr " + (i+1).toString();
        text.name = i.toString();
        text.id = i.toString();
        text.className = "pointInputs"
        addPoint.insertBefore(text, addPoint.childNodes[i]);
    }

    const addPointButton = document.getElementById("addPointButton");
    let dataToSend = [];
    addPointButton.addEventListener('click', ()=>{
        for(let i = 0; i < lines; i++){
            dataToSend.push(document.getElementById(i.toString()).value);
        }
        ipcRenderer.send('point', dataToSend);
        remote.getCurrentWindow().close();
    });
});



