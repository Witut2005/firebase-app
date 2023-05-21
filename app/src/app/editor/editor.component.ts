import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { getDatabase, ref, child, get, set, update, push } from "firebase/database";
import { DatabaseService } from 'src/database.service';
import { userGet } from 'src/user';
import { Workspace } from 'src/workspace';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  editorOptions = {theme: 'vs-dark', language: 'javascript'};

  userLogged: User;
  currentWorkspace: Workspace; 
  userWorkspacesNames: string[] = [];
  db = getDatabase();

  constructor(private router: Router, public communication: DatabaseService)
  {
    this.currentWorkspace = {name: '', files: new Map<string,string>(), fileOpened: {name:'', code: ''}};
    
    
    this.communication.workspacesAvailableNamesGet().then((data)=>{
      this.userWorkspacesNames = data;
      console.log(this.userWorkspacesNames);
    });


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

    this.fileOpen(this.currentWorkspace.name, event.target.innerHTML);
    // if(this.currentWorkspace.fileOpened.name == event.srcElement.innerHTML)
    //   return;

    // this.sync();

    // const filename = event.srcElement.innerHTML.replaceAll(' ', '');
    // await this.communication.fileLoad(this.currentWorkspace, filename)

    // this.currentWorkspace.fileOpened.name = event.srcElement.innerHTML as string;
    // this.currentWorkspace.fileOpened.code = this.currentWorkspace.files.get(filename) as string;
  }

  sync()
  {
    this.communication.openedFileSynchronize(this.currentWorkspace);
  }

  async workspaceOpen(workspaceName: string)
  {

    this.sync();

    this.currentWorkspace.files.clear();
    this.currentWorkspace.files = await this.communication.workspaceRead(workspaceName);
    this.currentWorkspace.name = workspaceName;

    // Open with first file detected
    this.currentWorkspace.fileOpened.name = this.map2Array(this.currentWorkspace.files)[0][0] //name
    this.currentWorkspace.fileOpened.code = this.map2Array(this.currentWorkspace.files)[0][1] //code 
  }
  
  async fileOpen(workspaceName: string, filename: string)
  {
    this.workspaceOpen(workspaceName);
    const fileData = await this.communication.fileLoad(this.currentWorkspace, filename);

    console.log('file', fileData);
    this.currentWorkspace.fileOpened.name = fileData.name;
    this.currentWorkspace.fileOpened.code = fileData.code;
  }

  workspaceChange(workspace: string)
  {
    this.currentWorkspace.name = workspace;
  }

  async workspaceOptionHandle(option: string)
  {
    if (option == 'Add')
    {
      const newWorkspaceName = String(prompt('Type workspace name')).replaceAll(' ', '');

      if(newWorkspaceName == 'null')
        return;

      await this.communication.workspaceAdd(newWorkspaceName)
      await this.workspaceOpen(newWorkspaceName)

      this.userWorkspacesNames.push(newWorkspaceName)
    }

  }

  async fileOptionHandle(option: string)
  {
    if (option == 'Add')
    {

      if(this.currentWorkspace.name == '')
      {
        alert('You must firstly create a new workspace');
        return;
      }

      const filename = prompt('Type filename to add');
      
      if(filename == null)
        return;

      await this.communication.fileAdd(this.currentWorkspace, filename);
      await this.workspaceOpen(this.currentWorkspace.name);

      this.currentWorkspace.fileOpened.name = filename;
      this.currentWorkspace.fileOpened.code = this.currentWorkspace.files.get(filename) as string;
    }

    else if(option == 'Load')
    {

    }
  }

  userLogOut():void
  {
    this.router.navigateByUrl('login');
  }

}
