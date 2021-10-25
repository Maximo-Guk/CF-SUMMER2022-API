const colors = [
  '#2196f3', //blue 500
  '#795548', //brown 500
  '#00bcd4', //cyan 500
  '#4caf50', //green 500
  '#3f51b5', //indigo 500
  '#ff9800', //orange 500
  '#e91e63', //pink 500
  '#9c27b0', //purple 500
  '#f44336', //red 500
  '#009688', //teal 500
  '#ffeb3b', //yellow 500
];

export default function randomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)];
}
