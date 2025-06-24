import {Component, effect, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {TypeRecord} from '@app/models/type-record';
import {RecordStructure} from '@app/services/pages/record-structure';
import {RecordStructureFileReq} from '@app/models/record-structure-file-req';
import {catchError, tap} from 'rxjs';
import {RecordStructureFileRes} from '@app/models/record-structure-file-res';
import {ElectronService} from '@app/services/electron.service';
import {RecordField} from '@app/models/record-field';
import {GenerateCsvRecordStructureReq} from '@app/models/generate-csv-record-structure-req';

const initTypeRecord: TypeRecord = {
  name: '',
  lineIdentifier: '',
  typeRecord: [],
  formControl: null as any
};

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

  recordStructureFileRes = signal<RecordStructureFileRes>({
    recordStructures: []
  });

  typeRecords = signal<TypeRecord[]>([]);

  selectedTypeRecord = signal<TypeRecord>(initTypeRecord);

  selectedFilePath = signal<string>('');

  showNewForm = signal(true);

  showEditForm = signal(false);

  typeRecordForm = this.formBuilder.nonNullable.group({
    name: [''],
    lineIdentifier: [''],
    lengths: [''],
    columns: ['']
  });

  constructor(
    private recordStructure: RecordStructure,
    private electronService: ElectronService
  ) {
    effect(() => {
      this.reloadFileSelected();
    });
  }

  recordStructureFromFile(filePath: string, typeRecord: TypeRecord) {
    const request: RecordStructureFileReq = {
      filePath: filePath,
      lineIdentifier: typeRecord.lineIdentifier,
      recordFields: typeRecord.typeRecord
    };

    this.recordStructure.recordStructureFromFile(request)
        .pipe(
          tap(response => {
            console.log(response);
            this.recordStructureFileRes.set(response);
          })
        )
        .subscribe();
  }

  typeRecordSubmit() {
    if (this.lineIdentifierExists() && !this.showEditForm()) {
      console.log('error: El identificador de linea ya existe.');

      return;
    }

    const lengths = this.typeRecordForm.value.lengths!;
    const columns = this.typeRecordForm.value.columns!;
    const recordFields = this.getRecordFields(lengths, columns);
    const typeRecord: TypeRecord = {
      name: this.typeRecordForm.value.name!,
      lineIdentifier: this.typeRecordForm.value.lineIdentifier!,
      typeRecord: recordFields,
      formControl: this.typeRecordForm.getRawValue() as any
    };

    this.typeRecords.update(value => {
        const findIndex = value.findIndex(typeRecord => typeRecord == this.selectedTypeRecord());

        if (this.showEditForm()) {
          value[findIndex] = typeRecord;

          this.selectedTypeRecord.set(typeRecord);
        } else {
          value.push(typeRecord);
        }

        return value;
      }
    );

    this.showNewForm.set(false);
    this.showEditForm.set(false);
  }

  private lineIdentifierExists() {
    if (this.typeRecords().length == 0) {
      return false;
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
    const recordFields: RecordField[] = [];
    const lengthSplit = lengths.split(separator);
    const columnSplit = columns.split(separator);

    for (let i = 0; i < lengthSplit.length; i++) {
      const fieldTypeRecord: RecordField = {
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

  selectTypeRecord(typeRecord: TypeRecord) {
    this.showNewForm.set(false);
    this.showEditForm.set(false);
    this.selectedTypeRecord.set(typeRecord);
  }

  openFileSelector() {
    if (this.electronService.isElectron) {
      this.electronService.selectFile()
          .pipe(
            tap(value => {
              console.log('Selected file path:', value);
              this.selectedFilePath.set(value);
            })
          )
          .subscribe();
    }
  }

  showNewFormEvent() {
    this.typeRecordForm.reset();
    this.showNewForm.set(true);
  }

  deleteSelectedTypeRecord() {
    this.typeRecords.update(value => {
      value.splice(this.typeRecords()
                       .indexOf(this.selectedTypeRecord()), 1);

      return value;
    });
    this.selectedTypeRecord.set(initTypeRecord);
  }

  editSelectedTypeRecord() {
    this.typeRecordForm.setValue(this.selectedTypeRecord().formControl as any);
    this.showEditForm.set(true);
  }

  cancelForm() {
    this.showNewForm.set(false);
    this.showEditForm.set(false);
    this.typeRecordForm.reset();
  }

  downloadCsv() {
    if (!this.selectedFilePath() || !this.selectedTypeRecord().formControl) {
      console.error('No hay archivo seleccionado o tipo de registro seleccionado');
      return;
    }

    const request: GenerateCsvRecordStructureReq = {
      filePath: this.selectedFilePath(),
      lineIdentifier: this.selectedTypeRecord().lineIdentifier,
      recordFields: this.selectedTypeRecord().typeRecord
    };

    this.recordStructure.generateCsv(request)
        .pipe(
          tap(response => {
            this.electronService.openFile(response.filePath)
                .subscribe();
          }),
          catchError(error => {
            console.error('Error al generar CSV:', error);
            throw error;
          })
        )
        .subscribe();
  }

  reloadFileSelected() {
    const filePath = this.selectedFilePath();
    const typeRecord = this.selectedTypeRecord();

    if (filePath && typeRecord.formControl) {
      this.recordStructureFromFile(filePath, this.selectedTypeRecord());
    }
  }
}
