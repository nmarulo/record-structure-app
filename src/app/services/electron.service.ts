import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  private readonly electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  get isElectron(): boolean {
    return !!(window && this.electronAPI);
  }

  selectFile() {
    if (this.isElectron) {
      return from(this.electronAPI.selectFile()) as Observable<string>;
    }

    return from('');
  }

  startSpringBoot() {
    if (this.isElectron) {
      return from(this.electronAPI.startSpringBoot()) as Observable<void>;
    }

    return from(Promise.resolve());
  }
}
