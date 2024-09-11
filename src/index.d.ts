// index.d.ts

export function Location(data?: any[]): {
    read(location: "region" | "township" | "villageTract" | "village"): Promise<any>;

    lookup(location: "region" | "township" | "villageTract" | "village", options: {
        as?: string;
        localId: string;
        foreignId?: string;
        result?: {
            select: string | null;
        };
    }): ReturnType<typeof Location>;

    get(options?: {
        parallelLookup?: boolean;
    }): Promise<any[]>;
};

export const Region: {
    getAll(): Promise<any[]>;
    getById(id: string | number): Promise<any | null>;
};

export const Township: {
    getAll(): Promise<any[]>;
    getById(id: string | number): Promise<any | null>;
};

export const VillageTract: {
    getAll(): Promise<any[]>;
    getById(id: string | number): Promise<any | null>;
};

export const Village: {
    getAll(): Promise<any[]>;
    getById(id: string | number): Promise<any | null>;
};