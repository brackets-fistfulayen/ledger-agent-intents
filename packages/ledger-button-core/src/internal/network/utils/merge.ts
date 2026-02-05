type Obj = Record<string, unknown>;

export function merge(target: Obj, ...sources: Obj[]): Obj {
  if (sources.length === 0) {
    return target;
  }

  for (const source of sources) {
    for (const key of Object.keys(source)) {
      if (
        ["__proto__", "constructor", "prototype"].includes(key) ||
        !Object.prototype.hasOwnProperty.call(source, key)
      ) {
        continue;
      }

      if (source[key] !== null && source[key] !== undefined) {
        const sourceValue = source[key];
        const targetValue = target[key];

        // If target doesn't have this key or it's not an object, assign the source value
        if (
          targetValue === undefined ||
          targetValue === null ||
          typeof targetValue !== "object"
        ) {
          target[key] = sourceValue;
        } else if (Array.isArray(sourceValue)) {
          // Handle array merging
          if (Array.isArray(targetValue)) {
            // If both are arrays, merge them
            target[key] = [
              ...new Set([...(targetValue as unknown[]), ...sourceValue]),
            ];
          } else {
            // If target is not an array but source is, replace with source
            target[key] = sourceValue;
          }
        } else if (
          typeof sourceValue === "object" &&
          !Array.isArray(sourceValue)
        ) {
          // If both are objects, recursively merge them
          if (typeof targetValue === "object" && !Array.isArray(targetValue)) {
            merge(targetValue as Obj, sourceValue as Obj);
          } else {
            // If target is not an object, replace with source
            target[key] = sourceValue;
          }
        } else {
          // For primitive values, replace the target value
          target[key] = sourceValue;
        }
      }
    }
  }

  return target;
}
