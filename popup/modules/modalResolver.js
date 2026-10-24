let resolver;
export function setUnlockResolver(resolve) {
  resolver?.(null);
  resolver = resolve;
}
export function resolveUnlockSetup(value) {
  const pending = resolver;
  resolver = null;
  pending?.(value);
}
