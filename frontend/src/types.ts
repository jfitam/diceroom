export type RollResult = {
  id: string;
  name: string;
  details: string;
  total: number;
};

export type ServerResponse =
  | {
      type: "history";
      data: RollResult[];
    }
  | {
      type: "roll";
      data: RollResult;
    }
  | {
      type: "error";
      data: string;
    };