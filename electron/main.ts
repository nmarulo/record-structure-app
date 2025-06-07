import {app, BrowserWindow, dialog, ipcMain} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {ChildProcess, spawn} from 'child_process';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow: BrowserWindow;
let springBootProcess: ChildProcess | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload/preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../record-structure-app/browser/index.html');

    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error(`No se pudo encontrar el archivo: ${indexPath}`);
      app.quit();
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
}

app.whenReady()
   .then(() => {
     createWindow();

     app.on('activate', () => {
       if (BrowserWindow.getAllWindows().length === 0) {
         createWindow();
       }
     });
   });

app.on('before-quit', (event) => {
  if (springBootProcess && !springBootProcess.killed) {
    springBootProcess.kill('SIGTERM');

    // Forzar cierre después de 5 segundos
    setTimeout(() => {
      if (springBootProcess && !springBootProcess.killed) {
        springBootProcess.kill('SIGKILL');
      }
    }, 5000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Todos los archivos',
        extensions: ['*']
      }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }

  return null;
});

ipcMain.handle('start-spring-boot', async () => {
  if (isDev) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const resourcesPath = isDev
      ? path.join(__dirname, '..', '..', 'backend')
      : path.join(process.resourcesPath, 'api');
    const jrePath = path.join(resourcesPath, 'jre', 'bin', 'java.exe');
    const jarPath = path.join(resourcesPath, 'record-structure-api.jar');

    if (!fs.existsSync(jrePath)) {
      console.error('JRE no encontrado en:', jrePath);
      reject(new Error('JRE no encontrado'));
      return;
    }

    if (!fs.existsSync(jarPath)) {
      console.error('JAR no encontrado en:', jarPath);
      reject(new Error('JAR no encontrado'));
      return;
    }

    springBootProcess = spawn(jrePath, [
      '-jar',
      jarPath,
      '--server.port=8099'
    ], {
      cwd: path.dirname(jarPath),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    springBootProcess.stdout?.on('data', (data) => {
      // Detectar cuando Spring Boot esté listo
      // EJ: 2025-06-08T01:06:45.947+02:00  INFO 44108 --- [record-structure-api] [           main] d.n.r.RecordStructureApiApplication      : Started RecordStructureApiApplication in 1.742 seconds (process running for 2.124)
      const message = data.toString();

      if (message.includes('Started') && message.includes('seconds')) {
        console.log(message, 'Spring Boot listo!');
        resolve();
      }
    });

    springBootProcess.stderr?.on('data', (data) => {
      console.error(`Spring Boot Error: ${data}`);
    });

    springBootProcess.on('close', (code) => {
      console.log(`Spring Boot terminó con código: ${code}`);
    });

    springBootProcess.on('error', (error) => {
      console.error('Error ejecutando Spring Boot:', error);
      reject(error);
    });

    // Timeout de 30 segundos para el inicio
    setTimeout(() => {
      if (springBootProcess && !springBootProcess.killed) {
        reject(new Error('Timeout iniciando Spring Boot'));
      }
    }, 30000);
  });
});
