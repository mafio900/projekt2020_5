const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu, dialog} = electron;

let mainWindow;

//Listen for app to be ready

app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        }
    });
    //Load html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'main.html'),
        protocol: 'file',
        slashes: true
    }));
    //Quit when closed
    mainWindow.on('close', function () {
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

//Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Load data from file',
                click(){
                    loadFile();
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//Add developer tools
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Dev tools',
        submenu: [
            {
                label: 'Toggle dev tools',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

function loadFile() {
    //Show dialog window
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    }).then(result => {
        fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
            if(err){
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            //Send data to renderer window
            mainWindow.webContents.send('data', {msg: data});
        });
    }).catch(err => {
        console.log(err);
    });
}

