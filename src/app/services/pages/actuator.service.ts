import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ActuatorService {

  private readonly _actuatorUri = 'http://localhost:8099/actuator';

  constructor(private httpClient: HttpClient) {
  }

  health() {
    return this.httpClient.get<{ status: string }>(`${this._actuatorUri}/health`);
  }

}
