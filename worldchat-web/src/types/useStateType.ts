export interface StyleState { 
  isLoading: boolean;
  errorUsername: boolean;
  errorPassword: boolean;
}

export interface ChatMessage { 
  sender: string;
  text: string;
  isMine: boolean;
}

export interface Usuario { 
  connectionId: string;
  username: string;
  mensages: number;
}