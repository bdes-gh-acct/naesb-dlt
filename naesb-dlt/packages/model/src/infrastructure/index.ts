export interface IWell {
  id: string;
  name: string;
  createdBy: string;
  created?: Date;
  fieldId?: string;
  updated?: Date;
  updatedBy: string;
}

export interface IField {
  id: string;
  name: string;
  createdBy: string;
  created?: Date;
  updated?: Date;
  updatedBy: string;
}
