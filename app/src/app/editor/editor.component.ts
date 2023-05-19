import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { getDatabase, ref, child, get, set, update, push } from "firebase/database";
import { userGet } from 'src/user';
import * as firebase from 'firebase/app';
import 'firebase/database';import 'firebase/database';
import { StreamableFile } from '@nestjs/common';

type Workspace = {
  name: string,
  files: Map<string, string>,
  fileOpened: {
    name: string,
    code: string
  }
};

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  editorOptions = {theme: 'vs-dark', language: 'javascript'};

  userLogged: User;
  currentWorkspace: Workspace; 
  db = getDatabase();

  constructor(private router: Router)
  {
    this.currentWorkspace = {name: '', files: new Map<string,string>(), fileOpened: {name:'', code: ''}};

    this.userLogged = userGet() as User;
    if(this.userLogged == null)
    {
      alert('USER NOT LOGGED')
      this.router.navigateByUrl('login');
    }

  }

  map2Array(map: Map<string, string>)
  {
    return Array.from(map);
  }

  mapKeys2Array(map: Map<string, string>)
  {
    return Array.from(map.keys());
  }

  async synchronizeFileWithDb(filename: string)
  {
    // console.log('UPDATE', (this.userLogged.uid + '/' + this.currentWorkspace.name + '/' + filename).replaceAll(' ', ''));
    await update(ref(this.db, (this.userLogged.uid + '/' + this.currentWorkspace.name + '/' + filename).replaceAll(' ', '')), {code: this.currentWorkspace.fileOpened.code});

  }

  async loadFileDataFromDb(workspace: string, filename: string)
  {
    console.log('LOADING', this.userLogged.uid + '/' + workspace + '/' + filename);
    get(child(ref(this.db), this.userLogged.uid + '/' + workspace + '/' + filename)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log('SNAPSHOT', snapshot.val());
        const data = snapshot.val()

        this.currentWorkspace.fileOpened.name = filename;
        this.currentWorkspace.fileOpened.code = data.code;

      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  async loadSelectedFile(event: any)
  {

    if(this.currentWorkspace.fileOpened.name == event.srcElement.innerHTML)
      return;

    this.sync();

    const filename = event.srcElement.innerHTML.replaceAll(' ', '');
    await this.loadFileDataFromDb(this.currentWorkspace.name, filename);

    this.currentWorkspace.fileOpened.name = event.srcElement.innerHTML as string;
    this.currentWorkspace.fileOpened.code = this.currentWorkspace.files.get(filename) as string;
  }

  sync()
  {
    this.synchronizeFileWithDb(this.currentWorkspace.fileOpened.name);
  }

  async workspaceReadFromDb(workspace: string)
  {
    console.log(this.userLogged.uid + '/' + workspace + '/');

    const path = this.userLogged.uid + '/' + workspace + '/';

    get(child(ref(this.db), path)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log('SNAPSHOT', snapshot.val());
        const data = snapshot.val()

        for(let x in data)
        {
          if(x == 'WORKSPACE')
            continue;
          console.log(x)
          this.currentWorkspace.files.set(x, data[x].code)
        }
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

  }

  async writeDataToDb<T>(path: string, dataToWrite: T): Promise<void>
  {
    const db = getDatabase();
    await set(ref(db, path), dataToWrite);
  }

  async addNewFileToDb(workspace: string, filename: string)
  {
    const db = getDatabase();

    // Get a key for a new Post.
    const newEntryKey = push(child(ref(db), workspace)).key;
    console.log(newEntryKey)

    const updates = {};
    // @ts-ignore
    updates[this.userLogged.uid + '/' + workspace + '/' + filename] = {code: ''};
    // @ts-ignore
    // updates[path + '/' + newEntryKey] = dataToUpdate;

    console.log(updates)
  
    // Write the new post's data simultaneously in the posts list and the user's post list.
    update(ref(db), updates);

  }

  async workspaceOptionHandle(option: string)
  {
    if (option == 'Add')
    {
      this.currentWorkspace.name = String(prompt('Type workspace name')).replaceAll(' ', '');

      if(this.currentWorkspace.name == null)
        return;

      await this.writeDataToDb(this.userLogged.uid + '/' + this.currentWorkspace.name, {WORKSPACE: this.currentWorkspace.name})
    }

    else if(option == 'Load')
    {
      const workspaceName = String(prompt('Workspace to load'));
      
      if(workspaceName == null)
        return;

      await this.workspaceReadFromDb(workspaceName);

      this.currentWorkspace.name = workspaceName;
      
      console.log(this.map2Array(this.currentWorkspace.files)[0])
      this.currentWorkspace.fileOpened.name = this.map2Array(this.currentWorkspace.files)[0][0] //name
      this.currentWorkspace.fileOpened.code = this.map2Array(this.currentWorkspace.files)[0][1] //code 

      console.log('NEW MAIN FILE', this.currentWorkspace.fileOpened.name)
    }
  }

  async fileOptionHandle(option: string)
  {
    if (option == 'Add')
    {
      const filename = prompt('Type filename to add');
      
      if(filename == null)
        return;

      await this.addNewFileToDb(this.currentWorkspace.name, filename);
      await this.workspaceReadFromDb(this.currentWorkspace.name);

      this.currentWorkspace.fileOpened.name = filename;
      this.currentWorkspace.fileOpened.code = this.currentWorkspace.files.get(filename) as string;
    }

    else if(option == 'Load')
    {

    }
  }

  userLogOut():void
  {

  }

}
