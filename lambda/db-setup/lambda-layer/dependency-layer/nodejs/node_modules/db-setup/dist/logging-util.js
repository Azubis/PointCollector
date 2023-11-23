"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logData = exports.serviceName = void 0;
const serviceName = (serviceName) => `pointCollector-${serviceName}`;
exports.serviceName = serviceName;
const logData = (data) => {
    // SiKo requirement: All additional logging data must be child of "data" field
    return {
        data: data
    };
};
exports.logData = logData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy11dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZ2dpbmctdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLFdBQVcsR0FBRyxDQUFDLFdBQW1CLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixXQUFXLEVBQUUsQ0FBQTtBQUF0RSxRQUFBLFdBQVcsZUFBMkQ7QUFFNUUsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtJQUNqQyw4RUFBOEU7SUFDOUUsT0FBTztRQUNILElBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQTtBQUNMLENBQUMsQ0FBQTtBQUxZLFFBQUEsT0FBTyxXQUtuQiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBzZXJ2aWNlTmFtZSA9IChzZXJ2aWNlTmFtZTogc3RyaW5nKSA9PiBgcG9pbnRDb2xsZWN0b3ItJHtzZXJ2aWNlTmFtZX1gXG5cbmV4cG9ydCBjb25zdCBsb2dEYXRhID0gKGRhdGE6IGFueSkgPT4ge1xuICAgIC8vIFNpS28gcmVxdWlyZW1lbnQ6IEFsbCBhZGRpdGlvbmFsIGxvZ2dpbmcgZGF0YSBtdXN0IGJlIGNoaWxkIG9mIFwiZGF0YVwiIGZpZWxkXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogZGF0YVxuICAgIH1cbn1cbiJdfQ==