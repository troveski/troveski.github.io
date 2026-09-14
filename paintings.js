// ---------------------------------------------------------------
// Museum painting data — "A Love Story: Álvaro & Anoucka"
//
// Photos live in /images, numbered 01-22 in the alphabetical order
// they were provided in.
//
// `title` is a placeholder chapter/moment name — replace with the
// real caption whenever you like.
//
// room:   room id, 0-4 (see museum.js ROOMS — one row, A→B→C→D→E)
// wall:   "north" | "south" | "east" | "west" — which wall of the
//         room the painting hangs on
// offset: position along that wall, from -1 (one end) to 1 (other
//         end), 0 is centered
// ---------------------------------------------------------------

const PAINTINGS = [
  // Room A — how it began
  { id: 1, room: 0, wall: "north", offset: -0.5, title: "How We Met",  image: "images/01.jpeg" },
  { id: 2, room: 0, wall: "north", offset:  0.5, title: "First Words", image: "images/02.jpeg" },
  { id: 3, room: 0, wall: "south", offset: -0.5, title: "First Look",  image: "images/03.jpeg" },
  { id: 4, room: 0, wall: "south", offset:  0.5, title: "That Day",    image: "images/04.jpeg" },

  // Room B — falling
  { id: 5, room: 1, wall: "north", offset: -0.5, title: "Getting Closer", image: "images/05.jpeg" },
  { id: 6, room: 1, wall: "north", offset:  0.5, title: "The First Trip", image: "images/06.jpeg" },
  { id: 7, room: 1, wall: "south", offset: -0.5, title: "Little Moments", image: "images/07.jpeg" },
  { id: 8, room: 1, wall: "south", offset:  0.5, title: "Falling",        image: "images/08.jpeg" },

  // Room C — together
  { id: 9,  room: 2, wall: "north", offset: -0.5, title: "Coming Together", image: "images/09.jpeg" },
  { id: 10, room: 2, wall: "north", offset:  0.5, title: "Home",            image: "images/10.jpeg" },
  { id: 11, room: 2, wall: "south", offset: -0.5, title: "Adventures",      image: "images/11.jpeg" },
  { id: 12, room: 2, wall: "south", offset:  0.5, title: "Through It All",  image: "images/12.jpeg" },

  // Room D — everyday life
  { id: 13, room: 3, wall: "north", offset: -0.5, title: "Ordinary Days", image: "images/13.jpeg" },
  { id: 14, room: 3, wall: "north", offset:  0.5, title: "Quiet Moments", image: "images/14.jpeg" },
  { id: 15, room: 3, wall: "south", offset: -0.5, title: "Laughing",      image: "images/15.jpeg" },
  { id: 16, room: 3, wall: "south", offset:  0.5, title: "Just Us",       image: "images/16.jpeg" },

  // Room E — today, and always (the last room, wider spread across
  // three walls since there's no doorway further east to make room for)
  { id: 17, room: 4, wall: "north", offset: -0.5, title: "Today",         image: "images/17.jpeg" },
  { id: 18, room: 4, wall: "north", offset:  0.5, title: "Us",            image: "images/18.jpeg" },
  { id: 19, room: 4, wall: "south", offset: -0.5, title: "What's Next",   image: "images/19.jpeg" },
  { id: 20, room: 4, wall: "south", offset:  0.5, title: "Forward",       image: "images/20.jpeg" },
  { id: 21, room: 4, wall: "east",  offset: -0.4, title: "Always",        image: "images/21.jpeg" },
  { id: 22, room: 4, wall: "east",  offset:  0.4, title: "Forever",       image: "images/22.jpeg" },
];
