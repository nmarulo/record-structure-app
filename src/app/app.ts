import {Component, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ActuatorService} from '@app/services/pages/actuator.service';
import {ElectronService} from '@app/services/electron.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'record-structure-app';

  backendReady = signal(false);

  constructor(
    private electronService: ElectronService,
    private actuatorService: ActuatorService) {
  }

  ngOnInit() {
    this.electronService.startSpringBoot()
        .subscribe();
    this.checkBackendStatus();
  }

  private checkBackendStatus() {
    const checkInterval = setInterval(() => {
      this.actuatorService.health()
          .subscribe({
            next: (response) => {
              this.backendReady.set(response.status == 'UP');

              if (this.backendReady()) {
                clearInterval(checkInterval);
                console.log('Backend conectado correctamente');
              } else {
                console.log('Backend no disponible');
              }
            },
            error: () => {
              console.log('Backend no disponible, reintentando...');
            }
          });
    }, 1000);
  }

}
