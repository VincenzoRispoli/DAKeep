import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, deleteDoc, doc, onSnapshot, addDoc, updateDoc, query, where, limit, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  normalNotes: Note[] = [];
  trashNotes: Note[] = [];
  markedNotes: Note[] = [];
  // items$;
  // items;

  unsubNotes;
  unsubTrash;
  unsubMarkedNotes;
  firestore: Firestore = inject(Firestore);

  constructor() {

    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    // this.unsubSingle = onSnapshot(this.getSingleDocRef('notes', 'njJeVZPAmb0ChTEr8FAb'), (element) => {  // onSnapshot ha bisogno di una referenza e di una funzione
    //   console.log(element.ref);
    // });



    // this.items$ = collectionData(this.getNotesRef());
    // this.items = this.items$.subscribe((list) => {
    //   console.log(list);;
    // });
  }

  async updateNotes(note: Note) { // oggetto item Note {} che sarebbe la note in questione
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id)
      await updateDoc(docRef, this.getCleanJson(note)).catch(      // anche la funzione updateDoc ha bisogno di sapere dove aggiornare e cosa
        (err) => {
          console.error(err);
        }
      ).then();
    }
  }

  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    }
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }

  subNotesList() {
    const q = query(this.getNotesRef(), limit(4))
    return onSnapshot(q, (list) => {  // onSnapshot ha bisogno di una referenza e di una funzione
      this.normalNotes = [];
      list.forEach((el) => {
        this.normalNotes.push(this.setNotesObject(el.data(), el.id)); // 
      })
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed note: ", change.doc.data());
        }
      })
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where('marked', '==', true), limit(4))
    return onSnapshot(q, (list) => {  // onSnapshot ha bisogno di una referenza e di una funzione
      this.markedNotes = [];
      list.forEach((el) => {
        this.markedNotes.push(this.setNotesObject(el.data(), el.id));
      })
    });
  }

  // subNotesList() {
  //   return onSnapshot(this.getNotesRef(), (list) => {  // onSnapshot ha bisogno di una referenza e di una funzione
  //     this.normalNotes = [];
  //     list.forEach((el) => {
  //       this.normalNotes.push(this.setNotesObject(el.data(), el.id)); // 
  //     })
  //   });
  // }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {  // onSnapshot ha bisogno di una referenza e di una funzione
      this.trashNotes = [];
      list.forEach((el) => {
        this.trashNotes.push(this.setNotesObject(el.data(), el.id)); // 
      })
    })
  }

  // abbiamo creato/aggiornato gli oggetti presenti nella raccolta 'notes', costruendo al suo interno piú proprietá. 
  // All'inizio, l'oggetto all'interno della raccolta 'notes' o 'trash' aveva solamente la proprietá title
  setNotesObject(obj: any, id: string) {
    return {
      id: id || "",
      type: obj.type || 'notes',
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  }

  // funzione per aggiungere le notes. Creiamo una funzione asincrona chiamata addNote  
  //e richiamiamo al suo interno la funzione di firebase addDoc() che serve per aggiungere nuovi oggetti in questo caso le tasks.
  // addDoc() é una Promise e ha bisogno di sapere due cose, dove deve aggiungere e cosa.
  async addNotes(item: Note, colId: 'notes' | 'trash') { // item é l'oggetto con tutte le proprieta´, che vogliamo aggiungere;
    if (colId == 'notes') {
      await addDoc(this.getNotesRef(), item).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("Document written with ID: ", docRef?.id) })
    } else {
      await addDoc(this.getTrashRef(), item).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("Document written with ID: ", docRef?.id) })
    }
  }

  // anche deleteDoc() ha bisogno di saper dove e cosa eliminare;
  async deleteNotes(colId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => { console.error(err) }
    ).then();
  }

  ngOnDestroy() {
    this.unsubNotes(); // unsubscribe
    this.unsubTrash(); // unsubscribe
    this.unsubMarkedNotes();
    // this.items.unsubscribe(); // operazione da svolgere alla fine
  }

  getNotesRef() {
    return collection(this.firestore, 'notes'); // 'notes é l'id della collezione/raccolta notes
  }

  getTrashRef() {
    return collection(this.firestore, 'trash'); // trash é l'id della collezione/raccolta trash
  }

  getSingleDocRef(colId: string, docId: string) {  // ottenere la referenza di un singolo elemento/id della raccolta
    return doc(collection(this.firestore, colId), docId)
  }

}

// con collection accediamo a tutta la raccolta/collezione di notes oppure trash
// con doc accediamo al singolo id di una raccolta, abbiamo comunque bisogno di dichiarare anche in nome della raccolta, per poter accedere all'id di un documento
