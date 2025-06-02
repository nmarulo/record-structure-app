import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RecordStructureFileReq} from '@app/models/record-structure-file-req';
import {RecordStructureFileRes} from '@app/models/record-structure-file-res';
import {RecordStructureReq} from '@app/models/record-structure-req';
import {RecordStructureRes} from '@app/models/record-structure-res';

@Injectable({
  providedIn: 'root'
})
export class RecordStructure {

  private readonly _recordStructureUri = 'http://localhost:8080/record-structure';

  constructor(private httpClient: HttpClient) {
  }

  recordStructure(request: RecordStructureReq) {
    return this.httpClient.post<RecordStructureRes>(`${this._recordStructureUri}`, request);
  }

  recordStructureFromFile(request: RecordStructureFileReq) {
    return this.httpClient.post<RecordStructureFileRes>(`${this._recordStructureUri}/file`, request);
  }
}
