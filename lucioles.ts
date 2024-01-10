//% color="#ff6e19" weight=1
namespace luciole {

    class NeopixelPattern {

        width: number
        red: number
        green: number
        blue: number
        duration: number
        delay: number

        constructor(width: number, rgb: number, duration: number, delay: number) {
            this.width = width;
            this.red = (rgb >> 16) & 0xFF;
            this.green = (rgb >> 8) & 0xFF;
            this.blue = (rgb) & 0xFF;
            this.duration = duration;
            this.delay = delay;
        }

    }

    let _period = 3000;
    let _last = -1;
    let _strip: neopixel.Strip = null;
    let _neopixelPatterns: NeopixelPattern[] = [];

    //% block="définir la vitesse de l'horloge à $period ms"
    //% period.defl=3000
    export function initialize(period: number) {
        radio.setGroup(1);
        radio.setTransmitPower(0);
        _period = period;
        _last = -1 * Math.random() * _period;
    }

    //% block="utiliser le ruban LED $strip"
    export function setStrip(strip: neopixel.Strip) {
        _strip = strip;
    }

    //% block="lorsque l'horloge interne sonne 'midi'"
    export function onBlink(handler: () => void) {
        basic.forever(() => {
            let now = input.runningTime();
            if (now >= _last + _period) {
                _last = now;
                radio.sendNumber(0);
                _neopixelPatterns = [];
                handler();
                displayPatterns();
            }
        });
    }

    function displayPatterns() {
        if (_strip == null) {
            // TODO: use LED screen
        } else {
            let n = _strip.length();
            let t0 = input.runningTime();
            while (true) {
                let allDone = true;
                let t = input.runningTime();
                let colors = [];
                for (let i = 0; i < n; i++) {
                    colors.push([0, 0, 0]);
                }
                for (let k = 0; k < _neopixelPatterns.length; k++) {
                    let pattern = _neopixelPatterns[k];
                    let i_front = (t - t0 - pattern.delay) / pattern.duration * n;
                    if (i_front < n + pattern.width) {
                        allDone = false;
                    } else {
                        continue;
                    }
                    for (let i = 0; i < n; i++) {
                        let luminosity = 0;
                        if (i <= i_front && i >= i_front - pattern.width) {
                            luminosity = Math.max(0, 1 - (i_front - i) / pattern.width);
                        }
                        colors[i][0] += Math.floor(pattern.red * luminosity);
                        colors[i][1] += Math.floor(pattern.green * luminosity);
                        colors[i][2] += Math.floor(pattern.blue * luminosity);
                    }
                }
                if (allDone) {
                    break;
                }
                for (let i = 0; i < n; i++) {
                    _strip.setPixelColor(i, neopixel.rgb(
                        Math.min(255, colors[i][0]),
                        Math.min(255, colors[i][1]),
                        Math.min(255, colors[i][2])
                    ));
                }
                _strip.show();
            }
            _strip.showColor(neopixel.colors(NeoPixelColors.Black));
        }
        
    }

    //% block="lorsqu'une luciole voisine clignote"
    export function onNeighborBlink(handler: () => void) {
        radio.onReceivedNumber(function(receivedNumber: number) {
            handler();
        });
    }

    //% block="avancer l'horloge interne de $ms ms"
    //% ms.defl=100
    export function blinkSoonerConstant(ms: number) {
        _last -= ms;
    }

    //% block="avancer l'horloge interne d'un facteur $k"
    //% k.defl=5
    export function blinkSoonerLinear(k: number) {
        let now = input.runningTime();
        let clock = (k + 1) * (now - _last) / _period;
        if (clock > 1) {
            clock = 1;
        }
        _last = now - clock * _period;
    }

    //% block="afficher une vague de longueur $width et de couleur $rgb pendant $duration ms après $delay ms"
    //% width.defl=10
    //% rgb.defl=2752386
    //% duration.defl=1000
    //% delay.defl=0
    export function blinkWave(width: number, rgb: number, duration: number, delay: number) {
        _neopixelPatterns.push(new NeopixelPattern(width, rgb, duration, delay));
    }

}