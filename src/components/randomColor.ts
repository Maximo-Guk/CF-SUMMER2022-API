const colors = [
  'blue',
  'brown',
  'cyan',
  'green',
  'indigo',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
];

export default function randomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)];
}
