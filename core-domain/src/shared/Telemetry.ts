// Mock OpenTelemetry wrapper for the Domain Layer
// In a real AAA implementation, this would import @opentelemetry/api

export const tracer = {
  startSpan: (name: string) => {
    return {
      setAttribute: (key: string, value: any) => {
        // Mock set attribute
      },
      addEvent: (name: string, attributes?: any) => {
        // Mock add event
      },
      setStatus: (status: any) => {
        // Mock set status
      },
      end: () => {
        // Mock end span
      }
    };
  }
};
