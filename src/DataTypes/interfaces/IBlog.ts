import { Document } from "mongoose";

export interface IUpadateBlog {
    blogId: string;
    title: string;
    description: string;
    categories:Array<any>;
    image:any;
    author:string;
    cryptoSymbol:string
    status?:string
}

export interface Iblog  {
  title: string;
  description: string;
  image:any;
  author:string;
  categories:Array<any>;
  cryptoSymbol:string;
  status:string
}

export function isJoiError(obj: any): obj is { isJoi: boolean } {
  return typeof obj === 'object' && obj !== null && 'isJoi' in obj;
}