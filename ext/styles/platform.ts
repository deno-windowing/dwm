import { DwmWindow } from "../../mod.ts";

export interface StylePlatform {
    applyBlur(win: DwmWindow): void;
    clearBlur(win: DwmWindow): void;
    applyMica(win: DwmWindow): void;
    applyDark(win: DwmWindow): void;
    applyLight(win: DwmWindow): void;
    applyMicaAlt(win: DwmWindow): void;
    clearMica(win: DwmWindow): void;
}