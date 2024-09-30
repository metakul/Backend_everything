import { AccountStatusType, CategoryType } from "../types/IUserType";
import { UserCategory } from "../enums/IUserEnums";


export interface IsystemAdmin {
    email: string;
    password: string;
    name: string
    category?: UserCategory,
    permissions?: string[]
}
export interface IloginUser {
    email: string;
    password: string;
    accountStatus?: AccountStatusType
}
export interface IUser extends IloginUser {
    id: any;
    name: string;
    phoneNumber: string;
    address: string;
    category: CategoryType
    permissions?: string[];
}

export interface IUserWithDid extends IUser {
    didCreated: boolean;
    api_key: string
    publicKey?: string;
    privateKey: string;
}

export interface ICredentialSubject {
    id: string;
    bloodType: string;
    hemoglobinLevel: number
    cholesterolLevel: number
}

export interface PerLogInfo {
    timestamp: number
    message: string
    label: string
    level: number
}

export interface Permissions {
    createPermissions: { [key: string]: string };
    readPermissions: { [key: string]: string };
    updatePermissions: { [key: string]: string };
    deletePermissions: { [key: string]: string };
}
