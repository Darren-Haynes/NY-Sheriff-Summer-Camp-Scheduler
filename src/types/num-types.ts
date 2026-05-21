// Integers only
export type Int = number & { __brand: 'int' };

// Floats only
export type Float = number & { __brand: 'float' };
