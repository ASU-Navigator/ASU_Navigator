export type ParsedEvent = {
  uid: string;
  summary: string;
  location: string;
  start: Date;
  end: Date;
  isRecurring: boolean;
};
