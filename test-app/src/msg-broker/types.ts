export interface IRecord {
    topic: string;
    message: any;
}

export interface IDiskStorage {
    createRecord(record: IRecord): void;
    getRecords(): any[];
}