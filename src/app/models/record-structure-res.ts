export interface RecordStructureRes {
  lineIdentifier: string;
  structuredRecords: StructuredRecord[];
}

export interface StructuredRecord {
  order: number;
  value: object;
  type: string;
}
