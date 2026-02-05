import { LitElement } from 'lit';
export type LottieSize = "small" | "medium" | "large" | "full";
declare const LOTTIE_ANIMATIONS: {
    readonly backgroundFlare: {
        ddd: number;
        h: number;
        w: number;
        meta: {
            g: string;
        };
        layers: ({
            ty: number;
            sr: number;
            st: number;
            op: number;
            ip: number;
            hasMask: boolean;
            ao: number;
            ks: {
                a: {
                    a: number;
                    k: number[];
                };
                s: {
                    a: number;
                    k: number[];
                };
                p: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: number[];
                        t: number;
                    } | {
                        s: number[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
                r: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: number[];
                        t: number;
                    } | {
                        s: number[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
                o: {
                    a: number;
                    k: number;
                };
            };
            shapes: ({
                ty: string;
                d: number;
                ks: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: {
                            c: boolean;
                            i: number[][];
                            o: number[][];
                            v: number[][];
                        }[];
                        t: number;
                    } | {
                        s: {
                            c: boolean;
                            i: number[][];
                            o: number[][];
                            v: number[][];
                        }[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
                lc?: undefined;
                lj?: undefined;
                ml?: undefined;
                o?: undefined;
                w?: undefined;
                c?: undefined;
            } | {
                ty: string;
                lc: number;
                lj: number;
                ml: number;
                o: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: number[];
                        t: number;
                    } | {
                        s: number[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
                w: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: number[];
                        t: number;
                    } | {
                        s: number[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
                c: {
                    a: number;
                    k: number[];
                };
                d?: undefined;
                ks?: undefined;
            })[];
            ind: number;
            td?: undefined;
            tt?: undefined;
            refId?: undefined;
        } | {
            ty: number;
            sr: number;
            st: number;
            op: number;
            ip: number;
            hasMask: boolean;
            td: number;
            ao: number;
            ks: {
                a: {
                    a: number;
                    k: number[];
                };
                s: {
                    a: number;
                    k: number[];
                };
                p: {
                    a: number;
                    k: number[];
                };
                r: {
                    a: number;
                    k: number;
                };
                o: {
                    a: number;
                    k: number;
                };
            };
            shapes: {
                ty: string;
                it: ({
                    ty: string;
                    d: number;
                    ks: {
                        a: number;
                        k: ({
                            o: {
                                x: number;
                                y: number;
                            };
                            i: {
                                x: number;
                                y: number;
                            };
                            s: {
                                c: boolean;
                                i: number[][];
                                o: number[][];
                                v: number[][];
                            }[];
                            t: number;
                        } | {
                            s: {
                                c: boolean;
                                i: number[][];
                                o: number[][];
                                v: number[][];
                            }[];
                            t: number;
                            o?: undefined;
                            i?: undefined;
                        })[];
                    };
                    c?: undefined;
                    r?: undefined;
                    o?: undefined;
                    a?: undefined;
                    s?: undefined;
                    p?: undefined;
                } | {
                    ty: string;
                    c: {
                        a: number;
                        k: number[];
                    };
                    r: number;
                    o: {
                        a: number;
                        k: number;
                    };
                    d?: undefined;
                    ks?: undefined;
                    a?: undefined;
                    s?: undefined;
                    p?: undefined;
                } | {
                    ty: string;
                    a: {
                        a: number;
                        k: number[];
                    };
                    s: {
                        a: number;
                        k: number[];
                    };
                    p: {
                        a: number;
                        k: ({
                            o: {
                                x: number;
                                y: number;
                            };
                            i: {
                                x: number;
                                y: number;
                            };
                            s: number[];
                            t: number;
                        } | {
                            s: number[];
                            t: number;
                            o?: undefined;
                            i?: undefined;
                        })[];
                    };
                    r: {
                        a: number;
                        k: ({
                            o: {
                                x: number;
                                y: number;
                            };
                            i: {
                                x: number;
                                y: number;
                            };
                            s: number[];
                            t: number;
                        } | {
                            s: number[];
                            t: number;
                            o?: undefined;
                            i?: undefined;
                        })[];
                    };
                    o: {
                        a: number;
                        k: number;
                    };
                    d?: undefined;
                    ks?: undefined;
                    c?: undefined;
                })[];
            }[];
            ind: number;
            tt?: undefined;
            refId?: undefined;
        } | {
            ty: number;
            sr: number;
            st: number;
            op: number;
            ip: number;
            tt: number;
            hasMask: boolean;
            ao: number;
            ks: {
                a: {
                    a: number;
                    k: number[];
                };
                s: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: number[];
                        t: number;
                    } | {
                        s: number[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
                p: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: number[];
                        t: number;
                    } | {
                        s: number[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
                r: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: number[];
                        t: number;
                    } | {
                        s: number[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
                o: {
                    a: number;
                    k: ({
                        o: {
                            x: number;
                            y: number;
                        };
                        i: {
                            x: number;
                            y: number;
                        };
                        s: number[];
                        t: number;
                    } | {
                        s: number[];
                        t: number;
                        o?: undefined;
                        i?: undefined;
                    })[];
                };
            };
            refId: string;
            ind: number;
            shapes?: undefined;
            td?: undefined;
        })[];
        v: string;
        fr: number;
        op: number;
        ip: number;
        assets: {
            id: string;
            e: number;
            w: number;
            h: number;
            p: string;
            u: string;
        }[];
    };
    readonly checkmark: {
        v: string;
        meta: {
            g: string;
            a: string;
            k: string;
            d: string;
            tc: string;
        };
        fr: number;
        ip: number;
        op: number;
        w: number;
        h: number;
        nm: string;
        ddd: number;
        assets: any[];
        layers: {
            ddd: number;
            ind: number;
            ty: number;
            nm: string;
            sr: number;
            ks: {
                o: {
                    a: number;
                    k: number;
                    ix: number;
                };
                r: {
                    a: number;
                    k: number;
                    ix: number;
                };
                p: {
                    a: number;
                    k: number[];
                    ix: number;
                };
                a: {
                    a: number;
                    k: number[];
                    ix: number;
                };
                s: {
                    a: number;
                    k: number[];
                    ix: number;
                };
            };
            ao: number;
            shapes: {
                ty: string;
                it: ({
                    ind: number;
                    ty: string;
                    ix: number;
                    ks: {
                        a: number;
                        k: ({
                            i: {
                                x: number;
                                y: number;
                            };
                            o: {
                                x: number;
                                y: number;
                            };
                            t: number;
                            s: {
                                i: number[][];
                                o: number[][];
                                v: number[][];
                                c: boolean;
                            }[];
                        } | {
                            t: number;
                            s: {
                                i: number[][];
                                o: number[][];
                                v: number[][];
                                c: boolean;
                            }[];
                            i?: undefined;
                            o?: undefined;
                        })[];
                        ix: number;
                    };
                    nm: string;
                    mn: string;
                    hd: boolean;
                    c?: undefined;
                    o?: undefined;
                    w?: undefined;
                    lc?: undefined;
                    lj?: undefined;
                    bm?: undefined;
                    p?: undefined;
                    a?: undefined;
                    s?: undefined;
                    r?: undefined;
                    sk?: undefined;
                    sa?: undefined;
                } | {
                    ty: string;
                    c: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    o: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    w: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    lc: number;
                    lj: number;
                    bm: number;
                    nm: string;
                    mn: string;
                    hd: boolean;
                    ind?: undefined;
                    ix?: undefined;
                    ks?: undefined;
                    p?: undefined;
                    a?: undefined;
                    s?: undefined;
                    r?: undefined;
                    sk?: undefined;
                    sa?: undefined;
                } | {
                    ty: string;
                    p: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    a: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    s: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    r: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    o: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    sk: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    sa: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    nm: string;
                    ind?: undefined;
                    ix?: undefined;
                    ks?: undefined;
                    mn?: undefined;
                    hd?: undefined;
                    c?: undefined;
                    w?: undefined;
                    lc?: undefined;
                    lj?: undefined;
                    bm?: undefined;
                })[];
                nm: string;
                np: number;
                cix: number;
                bm: number;
                ix: number;
                mn: string;
                hd: boolean;
            }[];
            ip: number;
            op: number;
            st: number;
            bm: number;
        }[];
        markers: any[];
    };
    readonly loadingSpinner: {
        v: string;
        meta: {
            g: string;
            a: string;
            k: string;
            d: string;
            tc: string;
        };
        fr: number;
        ip: number;
        op: number;
        w: number;
        h: number;
        nm: string;
        ddd: number;
        assets: any[];
        layers: {
            ddd: number;
            ind: number;
            ty: number;
            nm: string;
            sr: number;
            ks: {
                o: {
                    a: number;
                    k: number;
                    ix: number;
                };
                r: {
                    a: number;
                    k: ({
                        i: {
                            x: number[];
                            y: number[];
                        };
                        o: {
                            x: number[];
                            y: number[];
                        };
                        t: number;
                        s: number[];
                    } | {
                        t: number;
                        s: number[];
                        i?: undefined;
                        o?: undefined;
                    })[];
                    ix: number;
                };
                p: {
                    a: number;
                    k: number[];
                    ix: number;
                };
                a: {
                    a: number;
                    k: number[];
                    ix: number;
                };
                s: {
                    a: number;
                    k: number[];
                    ix: number;
                };
            };
            ao: number;
            shapes: {
                ty: string;
                it: ({
                    d: number;
                    ty: string;
                    s: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    p: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    nm: string;
                    mn: string;
                    hd: boolean;
                    c?: undefined;
                    o?: undefined;
                    w?: undefined;
                    lc?: undefined;
                    lj?: undefined;
                    ml?: undefined;
                    bm?: undefined;
                    a?: undefined;
                    r?: undefined;
                    sk?: undefined;
                    sa?: undefined;
                } | {
                    ty: string;
                    c: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    o: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    w: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    lc: number;
                    lj: number;
                    ml: number;
                    bm: number;
                    d: {
                        n: string;
                        nm: string;
                        v: {
                            a: number;
                            k: number;
                            ix: number;
                        };
                    }[];
                    nm: string;
                    mn: string;
                    hd: boolean;
                    s?: undefined;
                    p?: undefined;
                    a?: undefined;
                    r?: undefined;
                    sk?: undefined;
                    sa?: undefined;
                } | {
                    ty: string;
                    p: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    a: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    s: {
                        a: number;
                        k: number[];
                        ix: number;
                    };
                    r: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    o: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    sk: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    sa: {
                        a: number;
                        k: number;
                        ix: number;
                    };
                    nm: string;
                    d?: undefined;
                    mn?: undefined;
                    hd?: undefined;
                    c?: undefined;
                    w?: undefined;
                    lc?: undefined;
                    lj?: undefined;
                    ml?: undefined;
                    bm?: undefined;
                })[];
                nm: string;
                np: number;
                cix: number;
                bm: number;
                ix: number;
                mn: string;
                hd: boolean;
            }[];
            ip: number;
            op: number;
            st: number;
            bm: number;
        }[];
        markers: any[];
    };
};
export type LottieAnimation = keyof typeof LOTTIE_ANIMATIONS;
export interface LedgerLottieAttributes {
    animationData?: object;
    animationName: LottieAnimation;
    size?: LottieSize;
    autoplay?: boolean;
    loop?: boolean;
    speed?: number;
    paused?: boolean;
}
export declare class LedgerLottie extends LitElement {
    animationName?: LottieAnimation;
    animationData?: object;
    size: LottieSize;
    autoplay: boolean;
    loop: boolean;
    speed: number;
    paused: boolean;
    private container;
    private animation?;
    private get containerClasses();
    firstUpdated(): void;
    updated(changedProperties: Map<string, unknown>): void;
    disconnectedCallback(): void;
    private initializeAnimation;
    private destroyAnimation;
    private togglePlayPause;
    play(): void;
    pause(): void;
    stop(): void;
    goToAndPlay(value: number, isFrame?: boolean): void;
    goToAndStop(value: number, isFrame?: boolean): void;
    setSpeed(speed: number): void;
    setDirection(direction: 1 | -1): void;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-lottie": LedgerLottie;
    }
}
export default LedgerLottie;
//# sourceMappingURL=ledger-lottie.d.ts.map