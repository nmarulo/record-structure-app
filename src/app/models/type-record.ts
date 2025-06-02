import {RecordField} from '@app/models/record-field';

export interface TypeRecord {
  name: string;
  lineIdentifier: string;
  recordField: FieldTypeRecord[];
}

export interface FieldTypeRecord extends RecordField {
  columnName: string;
}
