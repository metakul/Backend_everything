import { Document } from "mongoose";

export interface IUpadateDropShip {
    dropShipItemsId: string;
    title: string;
    description: string;
    categories:Array<any>;
    image:any;
    author:string;
    price?:number;
    totalItemRemaining?:number;
    status?:string
}

export interface IdropShip  {
  title: string;
  description: string;
  image:any;
  author:string;
  categories:Array<any>;
  price?:number;
totalItemRemaining?:number;
  status:string
}

export function isJoiError(obj: any): obj is { isJoi: boolean } {
  return typeof obj === 'object' && obj !== null && 'isJoi' in obj;
}