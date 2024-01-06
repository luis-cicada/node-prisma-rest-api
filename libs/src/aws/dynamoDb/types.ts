import { GetItemCommandOutput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb'

export type IPutItemCommandOutput<T> = Omit<PutItemCommandOutput, 'Attributes'> & {
  Attributes?: T
}

export type IGetItemCommandOutput<T> = Omit<GetItemCommandOutput, "Item"> & {
    Item?: T;
  };
  
  
