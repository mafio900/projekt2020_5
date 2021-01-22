const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu, dialog, ipcMain} = electron;

let mainWindow;
let addWindow;
let lines = 2;

let zad3Menu;

//Listen for app to be ready

app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({
        minWidth: 1200,
        minHeight: 900,
        icon: __dirname + '/assets/icons/win/icon.ico',
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


    ipcMain.on('lines', (e, data)=>{
        lines = data.msg;
    });

    ipcMain.on('sendLines', (e)=>{
        addWindow.webContents.send('data', {msg: lines});
    });

    ipcMain.on('point', (e, data)=>{
        mainWindow.webContents.send('point', data);
    });

    ipcMain.on('showAddPoint', (e, data)=>{
        addWindow = new BrowserWindow({
            width: 600,
            height: 400,
            icon: __dirname + '/assets/icons/win/icon.ico',
            webPreferences: {
                nodeIntegration: true
            },
            parent: mainWindow
        });
        addWindow.resizable = false;
        //Load html
        addWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'inputPoints.html'),
            protocol: 'file',
            slashes: true
        }));
        //Quit when closed
        addWindow.on('close', function () {
            addWindow = null;
        });
        addWindow.setMenu(null);
    });
});

//Create menu template
const mainMenuTemplate = [
    {
        label: 'Plik',
        submenu:[
            {
                label: 'Załaduj plik z danymi',
                accelerator: process.platform === 'darwin' ? 'Command+Z' : 'Ctrl+Z',
                click(){
                    loadFile();
                }
            },
            {
                label: 'Wyjście',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
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
                accelerator: process.platform === 'darwin' ? 'Command+D' : 'Ctrl+D',
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
        filters: [
            { name: 'Programy tekstowe', extensions: ['txt', 'csv'] }
            ],
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
