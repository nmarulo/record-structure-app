import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  fileInput: FormControl = new FormControl('', {nonNullable: true});

  constructor() {
  }

}
