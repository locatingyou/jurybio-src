interface LastFMData {
  user: {
    username: string;
    avatar: string | null;
    scrobbles: number;
    artists: number;
  };
  song: {
    nowPlaying: boolean;
    song: string | null;
    artist: string | null;
    album: string | null;
    albumArt: string | null;
  };
}

export type { LastFMData };
