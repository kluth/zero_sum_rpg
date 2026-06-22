export declare const tracer: {
    startSpan: (name: string) => {
        setAttribute: (key: string, value: any) => void;
        addEvent: (name: string, attributes?: any) => void;
        setStatus: (status: any) => void;
        end: () => void;
    };
};
//# sourceMappingURL=Telemetry.d.ts.map