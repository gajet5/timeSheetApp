const events = require('./events');
const init = require('./services/init');

init();

const {
    app,
    BrowserWindow,
    globalShortcut
} = require('electron');

let mainWindow = null;
let winURL = '';

if (process.env.NODE_ENV === 'development') {
    winURL = `http://localhost:8080`;
} else {
    winURL = `file://${__dirname}/../render/dist/index.html`;
}


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 550,
        resizable: false,
        title: 'Time Sheet',
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });

    mainWindow.setMenu(null);
    mainWindow.loadURL(winURL);

    //devTool
    globalShortcut.register('Control+Alt+D', () => {
        if (mainWindow.isFocused()) {
            mainWindow.webContents.openDevTools();
        }
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
    //devTool

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

//close secound instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
}
//close secound instance

app.on('ready', createWindow);
app.on('ready', () => {
    if (process.env.NODE_ENV !== 'production') {
        require('vue-devtools').install()
    }
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});

events();
