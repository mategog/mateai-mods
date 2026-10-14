// Parses one line of CSV into an array of field strings.
export function parseCsvLine(line) {
  return line.split(',').map((field) => field.trim());
}

export function parseCsv(text) {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map(parseCsvLine);
}
