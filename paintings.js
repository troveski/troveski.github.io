// ---------------------------------------------------------------
// Museum painting data — "A Love Story: Álvaro & Anoucka"
//
// To add a real photo later: just set `image` to the path of the
// picture (e.g. "images/01.jpg") and drop the file in an /images
// folder at the project root. Leave `image: null` for a placeholder
// (a numbered gray frame) while you don't have the photo yet.
//
// `title` is a placeholder chapter/moment name — replace with the
// real caption once the photos come in.
//
// room:   room id, 0-3 (see museum.js ROOMS — one row, A→B→C→D)
// wall:   "north" | "south" | "east" | "west" — which wall of the
//         room the painting hangs on
// offset: position along that wall, from -1 (one end) to 1 (other
//         end), 0 is centered
// ---------------------------------------------------------------

const PAINTINGS = [
  // Room A — how it began
  { id: 1, room: 0, wall: "north", offset: -0.5, title: "How We Met",     image: null },
  { id: 2, room: 0, wall: "north", offset:  0.5, title: "First Words",    image: null },
  { id: 3, room: 0, wall: "south", offset: -0.5, title: "First Look",     image: null },
  { id: 4, room: 0, wall: "south", offset:  0.5, title: "That Day",       image: null },

  // Room B — falling
  { id: 5, room: 1, wall: "north", offset: -0.5, title: "Getting Closer", image: null },
  { id: 6, room: 1, wall: "north", offset:  0.5, title: "The First Trip", image: null },
  { id: 7, room: 1, wall: "south", offset: -0.5, title: "Little Moments", image: null },
  { id: 8, room: 1, wall: "south", offset:  0.5, title: "Falling",        image: null },

  // Room C — together
  { id: 9,  room: 2, wall: "north", offset: -0.5, title: "Coming Together", image: null },
  { id: 10, room: 2, wall: "north", offset:  0.5, title: "Home",            image: null },
  { id: 11, room: 2, wall: "south", offset: -0.5, title: "Adventures",      image: null },
  { id: 12, room: 2, wall: "south", offset:  0.5, title: "Through It All",  image: null },

  // Room D — today
  { id: 13, room: 3, wall: "north", offset: -0.5, title: "Today",       image: null },
  { id: 14, room: 3, wall: "north", offset:  0.5, title: "Us",          image: null },
  { id: 15, room: 3, wall: "south", offset: -0.5, title: "What's Next", image: null },
  { id: 16, room: 3, wall: "east",  offset:  0,   title: "Always",      image: null },
];
