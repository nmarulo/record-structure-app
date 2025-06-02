import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RecordStructureFileReq} from '@app/models/record-structure-file-req';
import {RecordStructureFileRes} from '@app/models/record-structure-file-res';

@Injectable({
  providedIn: 'root'
})
export class RecordStructure {

  private readonly _recordStructureUri = 'http://localhost:8080/record-structure';

  constructor(private httpClient: HttpClient) {
  }

  recordStructureFromFile(request: RecordStructureFileReq) {
    return this.httpClient.post<RecordStructureFileRes>(`${this._recordStructureUri}/file`, request);
  }
}
