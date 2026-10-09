declare module 'opensheetmusicdisplay' {
  export class Fraction {
    RealValue: number;
    clone(): Fraction;
    Add(other: Fraction): void;
  }

  export class SourceMeasure {
    TempoInBPM: number;
    AbsoluteTimestamp: Fraction;
    Duration: Fraction;
    VerticalSourceStaffEntryContainers: Array<{
      Timestamp: Fraction;
    }>;
  }

  export class MusicSheet {
    SourceMeasures: SourceMeasure[];
  }

  export class MusicPartManagerIterator {
    constructor(sheet: MusicSheet, timestamp: Fraction, endTimestamp?: Fraction);
  }

  export class Cursor {
    Hidden: boolean;
    cursorElement: HTMLImageElement;
    CursorOptions: Record<string, unknown>;
    reset(): void;
    show(): void;
    hide(): void;
    update(): void;
    iterator: MusicPartManagerIterator;
  }

  export class OpenSheetMusicDisplay {
    constructor(container: HTMLElement, options?: Record<string, unknown>);
    load(xml: string): Promise<void>;
    render(): Promise<void> | void;
    clear(): void;
    enableOrDisableCursors(enabled: boolean): void;
    setOptions(options: Record<string, unknown>): void;
    IsReadyToRender(): boolean;
    readonly Sheet: MusicSheet;
    readonly cursor: Cursor;
    readonly Version: string;
    readonly Zoom: number;
  }

  export { MusicPartManagerIterator, SourceMeasure, Fraction, Cursor, MusicSheet };
}
