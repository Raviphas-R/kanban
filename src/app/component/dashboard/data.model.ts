export interface Task {
  team: string;
  participant: any[];
  title: string;
  description: string;
  status: string;
  priority: string;
  createAt: Date;
  updatedAt: Date;
  readonly id: string;
  readonly _id: string;
}

export interface Team {
  readonly id: string;
  teamName: string;
  teamMember: string[];
  taskNumber: number;
}
