import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { getDatabase, ref, child, get, set, update, push, Database } from "firebase/database";
import { userGet } from 'src/user';
import { Router } from '@angular/router';
import { Workspace, WorkspaceFile } from './workspace';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  
  private userLogged: User;

  constructor(private router: Router) { 

    if(userGet() == null)
    {
      console.log('NO USER LOGGED')
      this.router.navigateByUrl('login');
    }
    this.userLogged = userGet() as User;
    
  }

  async workspacesAvailableNamesGet(): Promise<string[]>
  {
    const db = getDatabase();
    this.userLogged = userGet() as User;
    console.log(this.userLogged)
    const path = this.userLogged.uid + '/';
    const availableWorkspaces: string[]= [];

    const data = (await get(child(ref(db), path))).val();

    for(let x in data)
    {
      console.log('TEST', x, data[x].WORKSPACE)
      availableWorkspaces.push(x)
    }

    console.log('YOUR SPACES', availableWorkspaces);

    return availableWorkspaces;

  }

  async workspaceRead(workspace: string, changeWorkpaceAutomatically: boolean = false): Promise<Map<string, string>>
  {
    console.log(this.userLogged.uid + '/' + workspace + '/');

    const path = this.userLogged.uid + '/' + workspace + '/';
    const db = getDatabase();
    const workspaceFiles = new Map<string, string>();

    const data = (await (get(child(ref(db), path)))).val()

    for(let x in data)
    {
      if(x == 'WORKSPACE')
        continue;
      console.log(x)
      workspaceFiles.set(x, data[x].code)
    }

    return workspaceFiles;
  }

  async openedFileSynchronize(workspace: Workspace): Promise<void>
  {
    if(workspace.fileOpened.name == '')
      return;
    
    const db = getDatabase();
    // console.log(this.userLogged.uid + '/' + workspace.name + '/' + filename, workspace.files.get(filename))

    await update(ref(db, (this.userLogged.uid + '/' + workspace.name + '/' + workspace.fileOpened.name).replaceAll(' ', '')), {code: workspace.fileOpened.code});
  }

  async fileAdd(workspace: Workspace, filename: string): Promise<void>
  {
    const db = getDatabase();

    // Get a key for a new Post.
    const newEntryKey = push(child(ref(db), workspace.name)).key;
    console.log(newEntryKey)

    const updates = {};
    // @ts-ignore
    updates[this.userLogged.uid + '/' + workspace.name + '/' + filename] = {code: ''};
    // @ts-ignore
    // updates[path + '/' + newEntryKey] = dataToUpdate;

    console.log(updates)
  
    // Write the new post's data simultaneously in the posts list and the user's post list.
    update(ref(db), updates);
  }

  async dataWrite<T>(path: string, data: T): Promise<void>
  {
    const db = getDatabase();
    await set(ref(db, path), data);
  }

  async workspaceAdd(workspaceName: string): Promise<void>
  {
    await this.dataWrite(this.userLogged.uid + '/' + workspaceName, {WORKSPACE: workspaceName})
  }

  async fileLoad(workspace: Workspace, filename: string): Promise<WorkspaceFile>
  {
    console.log(this.userLogged.uid + '/' + workspace.name + '/');

    const path = this.userLogged.uid + '/' + workspace.name + '/';
    const db = getDatabase();
    const workspaceFiles = new Map<string, string>();

    const data = (await (get(child(ref(db), path)))).val()

    let ret = {name: '', code: ''};

    for(let x in data)
    {
      console.log('klucz', x, filename)
      if(x.replaceAll(' ', '') == filename.replaceAll(' ', ''))
      {
        console.log('ROWNE')
        ret = {name: x, code: data[x].code}
      }
    }

    return ret;

  }

}
