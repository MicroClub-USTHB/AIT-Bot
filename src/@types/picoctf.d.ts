declare interface CTFPlayer {
  id: number;
  user_id: number;
  username: string;
  pending: boolean;
  leader: boolean;
  registered: boolean;
  score: number;
}
