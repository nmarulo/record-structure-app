import {RecordField} from '@app/models/record-field';

export interface RecordStructureReq {
  line: string;
  lineIdentifier: string;
  recordFields: RecordField[];
}
