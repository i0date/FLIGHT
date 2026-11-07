// Typeset straight quotes as curly ones, so every question reads the same.
export const curly = (s: string) => s.replace(/"([^"]*)"/g, '“$1”').replace(/'/g, '’');
