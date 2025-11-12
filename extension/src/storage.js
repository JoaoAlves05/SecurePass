export function getStorage(area = 'local', keys) {
  return new Promise(resolve => {
    chrome.storage[area].get(keys, resolve);
  });
}

export function setStorage(area = 'local', items) {
  return new Promise(resolve => {
    chrome.storage[area].set(items, resolve);
  });
}

export function removeStorage(area = 'local', keys) {
  return new Promise(resolve => {
    chrome.storage[area].remove(keys, resolve);
  });
}
