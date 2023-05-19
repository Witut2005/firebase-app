import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { getDatabase, ref, child, get, set, update, push, Database } from "firebase/database";
import { userGet } from 'src/user';
import { Router } from '@angular/router';

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

}
