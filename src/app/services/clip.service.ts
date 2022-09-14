import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import IClip from '../models/cilp.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, of, switchMap ,BehaviorSubject,combineLatest} from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';




@Injectable({
  providedIn: 'root',
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {
    this.clipsCollection = this.db.collection('clips');
  }

  async createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return await this.clipsCollection.add(data);
  }

  getUserClips(sort$:BehaviorSubject<string>) {
    return combineLatest([this.auth.user,sort$]).pipe(
      switchMap((values) => {
        const [user,sort] = values

        console.log(values)
        if (!user) {
          return of([]);
        }
        const query = this.clipsCollection.ref.where('uid', '==' , user.uid).orderBy(
          'timestamp',
          sort === '1' ? 'desc': 'asc'
        );
        console.log()
        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title,
    });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    await clipRef.delete();
    return this.clipsCollection.doc(clip.docID).delete();
  }
}