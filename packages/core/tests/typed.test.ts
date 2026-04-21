import { describe, expect, expectTypeOf, it } from "vitest";

import type { Ref } from "../src/types.js";
import {
    defineTypedTokens,
    type DeepTokenValue,
    type TypedThemeUnifyConfig,
} from "../src/typed.js";

interface FakePreset {
    semantic: {
        focusRing: { width: string; color: string };
        primary: { 500: string };
    };
    components: {
        button: {
            root: { borderRadius: string };
        };
    };
}

describe("defineTypedTokens", () => {
    it("returns its input unchanged (identity)", () => {
        const cfg = {
            meta: { name: "T" },
            primitive: { colors: {} },
        } satisfies TypedThemeUnifyConfig<FakePreset>;

        expect(defineTypedTokens<FakePreset>(cfg)).toBe(cfg);
    });

    it("accepts string OR Ref at every preset.overrides leaf", () => {
        defineTypedTokens<FakePreset>({
            meta: { name: "T" },
            primitive: { colors: {} },
            preset: {
                base: "aura",
                overrides: {
                    semantic: {
                        focusRing: {
                            width: "3px",
                            color: { ref: "colors.beetroot.500" },
                        },
                        primary: { 500: { ref: "colors.beetroot.500" } },
                    },
                    components: {
                        button: { root: { borderRadius: "4px" } },
                    },
                },
            },
        });
    });

    it("widens leaf string types to string | Ref via DeepTokenValue", () => {
        type Widened = DeepTokenValue<FakePreset>;
        expectTypeOf<Widened["semantic"]["focusRing"]["width"]>().toEqualTypeOf<
            string | Ref
        >();
        expectTypeOf<Widened["components"]["button"]["root"]["borderRadius"]>().toEqualTypeOf<
            string | Ref
        >();
    });

    it("preserves non-string leaves as-is", () => {
        type T = DeepTokenValue<{
            n: number;
            b: boolean;
            arr: ReadonlyArray<string>;
        }>;
        expectTypeOf<T["n"]>().toEqualTypeOf<number>();
        expectTypeOf<T["b"]>().toEqualTypeOf<boolean>();
        expectTypeOf<T["arr"]>().toEqualTypeOf<ReadonlyArray<string | Ref>>();
    });
});
