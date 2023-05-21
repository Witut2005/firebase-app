
export type Workspace = {
  name: string,
  files: Map<string, string>,
  fileOpened: {
    name: string,
    code: string
  }
};

export type WorkspaceFile = {
  name: string,
  code: string
}
