export interface GenericResponseDTO<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[];
    autoShowError:boolean;
  }