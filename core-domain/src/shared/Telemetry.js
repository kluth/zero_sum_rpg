"use strict";
// Mock OpenTelemetry wrapper for the Domain Layer
// In a real AAA implementation, this would import @opentelemetry/api
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracer = void 0;
exports.tracer = {
    startSpan: (name) => {
        return {
            setAttribute: (key, value) => {
                // Mock set attribute
            },
            addEvent: (name, attributes) => {
                // Mock add event
            },
            setStatus: (status) => {
                // Mock set status
            },
            end: () => {
                // Mock end span
            }
        };
    }
};
//# sourceMappingURL=Telemetry.js.map