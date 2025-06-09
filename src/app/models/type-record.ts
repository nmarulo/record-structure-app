import {RecordField} from '@app/models/record-field';

export interface TypeRecord {
  name: string;
  lineIdentifier: string;
  typeRecord: RecordField[];
  formControl: any;
}
