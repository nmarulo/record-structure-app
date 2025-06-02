import {RecordField} from '@app/models/record-field';

export interface RecordStructureFileReq {
  filePath: string;
  lineIdentifier: string;
  recordFields: RecordField[];
}
