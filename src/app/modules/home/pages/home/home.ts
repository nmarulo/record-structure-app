import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule} from '@angular/forms';
import {FieldTypeRecord, TypeRecord} from '@app/models/type-record';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  private formBuilder = inject(FormBuilder);

  fileInput: FormControl = new FormControl('', {nonNullable: true});

  typeRecords = signal<TypeRecord[]>([]);

  typeRecordForm = this.formBuilder.nonNullable.group({
    name: [''],
    lineIdentifier: [''],
    lengths: [''],
    columns: ['']
  });

  constructor() {
  }

  typeRecordSubmit() {
    if (this.lineIdentifierExists()) {
      console.log('error: El identificador de linea ya existe.');

      return;
    }

    const lengths = this.typeRecordForm.value.lengths!;
    const columns = this.typeRecordForm.value.columns!;
    const recordFields = this.getRecordFields(lengths, columns);
    const typeRecord: TypeRecord = {
      name: this.typeRecordForm.value.name!,
      lineIdentifier: this.typeRecordForm.value.lineIdentifier!,
      recordField: recordFields
    };

    this.typeRecords.update(value => {
        value.push(typeRecord);

        return value;
      }
    );
  }

  private lineIdentifierExists() {
    if (this.typeRecords().length) {
      return true;
    }

    return this.typeRecords()
               .filter(typeRecord => {
                   console.log(typeRecord.lineIdentifier);
                   console.log(this.typeRecordForm.value.lineIdentifier);

                   return typeRecord.lineIdentifier == this.typeRecordForm.value.lineIdentifier;
                 }
               ).length;
  }

  private getRecordFields(lengths: string, columns: string) {
    if (lengths.includes('\n') && columns.includes('\n')) {
      return this.splitRecordFields(lengths, columns, '\n');
    }

    if (lengths.includes(',') && columns.includes(',')) {
      return this.splitRecordFields(lengths, columns, ',');
    }

    console.log('error: Las longitud y columnas deben ser separados por coma o salto de linea.');

    return [];
  }

  private splitRecordFields(lengths: string, columns: string, separator: string) {
    const recordFields: FieldTypeRecord[] = [];
    const lengthSplit = lengths.split(separator);
    const columnSplit = columns.split(separator);

    for (let i = 0; i < lengthSplit.length; i++) {
      const fieldTypeRecord: FieldTypeRecord = {
        columnName: columnSplit[i],
        order: i,
        length: parseInt(lengthSplit[i]),
        type: 'STRING',
        format: 'DEFAULT'
      };

      recordFields.push(fieldTypeRecord);
    }

    return recordFields;
  }
}
