export namespace Features {
    export interface NounFeatures {
        gender: GrammaticalGender;
    }
    export enum GrammaticalGender {
        Masculine = "masculine",
        Feminine = "feminine",
        Neuter = "neuter",
    }
}