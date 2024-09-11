// index.d.ts

export interface Location {
    read(location: "region" | "township" | "villageTract" | "village"): Promise<Array<Object>>;
    lookup(
      location: "region" | "township" | "villageTract" | "village",
      options: {
        as: string;
        localId: string;
        foreignId?: string;
        result: {
          select?: string | null;
        };
      }
    ): this;
    get(options: { parallelLookup: boolean }): Promise<Array<Object>>;
  }
  
  export interface Region {
    getAll(): Promise<any>;
    getById(id: string): Promise<any>;
  }
  
  export interface Township {
    getAll(): Promise<any>;
    getById(id: string): Promise<any>;
  }
  
  export interface VillageTract {
    getAll(): Promise<any>;
    getById(id: string): Promise<any>;
  }
  
  export interface Village {
    getAll(): Promise<any>;
    getById(id: string): Promise<any>;
  }
  
  export const Location: Location;
  export const Region: Region;
  export const Township: Township;
  export const VillageTract: VillageTract;
  export const Village: Village;  