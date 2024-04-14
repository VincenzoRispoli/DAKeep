import { Component, Input } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { NoteListService } from '../../firebase-services/note-list.service'

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  @Input() note!: Note;
  edit = false;
  hovered = false;

  constructor(private noteService: NoteListService) { }

  changeMarkedStatus() {
    this.note.marked = !this.note.marked;
    this.saveNote();
  }

  deleteHovered() {
    if (!this.edit) {
      this.hovered = false;
    }
  }

  openEdit() {
    this.edit = true;
  }

  closeEdit() {
    this.edit = false;
    this.saveNote();
  }

  moveToTrash() {
    if (this.note.id) { // dato che l'oggetto Note ha un Id opzionale impostiamo una condizione if, altrimenti avremmo errore con docId nella funzione deleteNotes();
      this.note.type = 'trash';
      let docId = this.note.id;
      delete this.note.id;
      this.noteService.addNotes(this.note, 'trash');
      this.noteService.deleteNotes('notes', docId);
    }
  }

  moveToNotes() {
    if (this.note.id) { // dato che l'oggetto Note ha un Id opzionale impostiamo una condizione if, altrimenti avremmo errore con docId nella funzione deleteNotes();
      let docId = this.note.id;
      this.noteService.addNotes(this.note, 'notes');
      this.noteService.deleteNotes('trash', docId);
    }
  }

  deleteNote() {
   if(this.note.id){
    this.noteService.deleteNotes('trash', this.note.id)
   }
  }

  saveNote() {
    this.noteService.updateNotes(this.note)
  }

}
