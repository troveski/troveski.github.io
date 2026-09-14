// ---------------------------------------------------------------
// Museum painting data.
//
// To add a real photo later: just set `image` to the path of the
// picture (e.g. "images/01.jpg") and drop the file in an /images
// folder at the project root. Leave `image: null` for a placeholder
// (a numbered gray frame) while you don't have art yet.
//
// room:   room id, 0-3 (see museum.js ROOMS — one row, A→B→C→D)
// wall:   "north" | "south" | "east" | "west" — which wall of the
//         room the painting hangs on
// offset: position along that wall, from -1 (one end) to 1 (other
//         end), 0 is centered
// ---------------------------------------------------------------

const PAINTINGS = [
  // Room A
  { id: 1, room: 0, wall: "north", offset: -0.5, title: "Untitled I",   image: null },
  { id: 2, room: 0, wall: "north", offset:  0.5, title: "Untitled II",  image: null },
  { id: 3, room: 0, wall: "south", offset: -0.5, title: "Untitled III", image: null },
  { id: 4, room: 0, wall: "south", offset:  0.5, title: "Untitled IV",  image: null },

  // Room B
  { id: 5, room: 1, wall: "north", offset: -0.5, title: "Untitled V",    image: null },
  { id: 6, room: 1, wall: "north", offset:  0.5, title: "Untitled VI",   image: null },
  { id: 7, room: 1, wall: "south", offset: -0.5, title: "Untitled VII",  image: null },
  { id: 8, room: 1, wall: "south", offset:  0.5, title: "Untitled VIII", image: null },

  // Room C
  { id: 9,  room: 2, wall: "north", offset: -0.5, title: "Untitled IX",   image: null },
  { id: 10, room: 2, wall: "north", offset:  0.5, title: "Untitled X",    image: null },
  { id: 11, room: 2, wall: "south", offset: -0.5, title: "Untitled XI",   image: null },
  { id: 12, room: 2, wall: "south", offset:  0.5, title: "Untitled XII",  image: null },

  // Room D
  { id: 13, room: 3, wall: "north", offset: -0.5, title: "Untitled XIII", image: null },
  { id: 14, room: 3, wall: "north", offset:  0.5, title: "Untitled XIV",  image: null },
  { id: 15, room: 3, wall: "south", offset: -0.5, title: "Untitled XV",   image: null },
  { id: 16, room: 3, wall: "east",  offset:  0,   title: "Untitled XVI",  image: null },
];
