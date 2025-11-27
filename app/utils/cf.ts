export const cfCombine = (cf1: number, cf2: number): number => {
    return cf1 + cf2 * (1 - cf1);
};