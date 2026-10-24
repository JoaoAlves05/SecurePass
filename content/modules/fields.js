export function visibleField(field) {
  return field?.isConnected && !field.disabled && field.getClientRects().length > 0 && getComputedStyle(field).visibility !== 'hidden';
}
export function setFieldValue(field, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(field, value);
  field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  field.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}
