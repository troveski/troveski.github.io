// ---------------------------------------------------------------
// Museum painting data.
//
// To add a real photo later: just set `image` to the path of the
// picture (e.g. "images/01.jpg") and drop the file in an /images
// folder at the project root. Leave `image: null` for a placeholder
// (a numbered gray frame) while you don't have art yet.
//
// floor:  0 (ground floor) or 1 (upper floor)
// room:   room id within that floor (see museum.js ROOMS)
// wall:   "north" | "south" | "east" | "west" — which wall of the
//         room the painting hangs on
// offset: position along that wall, from -1 (one end) to 1 (other
//         end), 0 is centered
// ---------------------------------------------------------------

const PAINTINGS = [
  // Floor 0, Room 0
  { id: 1, floor: 0, room: 0, wall: "north", offset: -0.5, title: "Untitled I",   image: null },
  { id: 2, floor: 0, room: 0, wall: "north", offset:  0.5, title: "Untitled II",  image: null },
  { id: 3, floor: 0, room: 0, wall: "south", offset: -0.5, title: "Untitled III", image: null },
  { id: 4, floor: 0, room: 0, wall: "south", offset:  0.5, title: "Untitled IV",  image: null },

  // Floor 0, Room 1
  { id: 5, floor: 0, room: 1, wall: "north", offset: -0.5, title: "Untitled V",    image: null },
  { id: 6, floor: 0, room: 1, wall: "north", offset:  0.5, title: "Untitled VI",   image: null },
  { id: 7, floor: 0, room: 1, wall: "east",  offset:  0,   title: "Untitled VII",  image: null },
  { id: 8, floor: 0, room: 1, wall: "south", offset:  0,   title: "Untitled VIII", image: null },

  // Floor 1, Room 0
  { id: 9,  floor: 1, room: 0, wall: "north", offset: -0.5, title: "Untitled IX",   image: null },
  { id: 10, floor: 1, room: 0, wall: "north", offset:  0.5, title: "Untitled X",    image: null },
  { id: 11, floor: 1, room: 0, wall: "south", offset: -0.5, title: "Untitled XI",   image: null },
  { id: 12, floor: 1, room: 0, wall: "south", offset:  0.5, title: "Untitled XII",  image: null },

  // Floor 1, Room 1
  { id: 13, floor: 1, room: 1, wall: "north", offset: -0.5, title: "Untitled XIII", image: null },
  { id: 14, floor: 1, room: 1, wall: "north", offset:  0.5, title: "Untitled XIV",  image: null },
  { id: 15, floor: 1, room: 1, wall: "east",  offset:  0,   title: "Untitled XV",   image: null },
  { id: 16, floor: 1, room: 1, wall: "south", offset:  0,   title: "Untitled XVI",  image: null },
];
