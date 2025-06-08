import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ActuatorService {

  private readonly _actuatorUri = `${environment.RECORD_STRUCTURE_API_URL}/actuator`;

  constructor(private httpClient: HttpClient) {
  }

  health() {
    return this.httpClient.get<{ status: string }>(`${this._actuatorUri}/health`);
  }

}
