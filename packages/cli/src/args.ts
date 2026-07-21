export function flagValue(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx < 0) return undefined;
  return args[idx + 1];
}

export function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}
