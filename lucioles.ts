//% color="#ff6e19" weight=1
namespace luciole {

    let _last = -1;
    let _period = 3000;

    //% block="définir la vitesse de l'horloge à $period ms"
    //% period.defl=3000
    export function initialize(period: number) {
        radio.setGroup(1);
        radio.setTransmitPower(0);
        _period = period;
    }

    //% block="lorsque l'horloge interne sonne 'midi'"
    export function onBlink(handler: () => void) {
        basic.forever(() => {
            let now = input.runningTime();
            if (_last < 0 || now >= _last + _period) {
                _last = now;
                radio.sendNumber(0);
                handler();
            }
        });
    }

    //% block="lorsqu'une luciole voisine clignote"
    export function onNeighborBlink(handler: () => void) {
        radio.onReceivedNumber(function(receivedNumber: number) {
            let now = input.runningTime();
            if (now - _last >= _period / 2) {
                handler();
            }
        });
    }

    //% block="avancer l'horloge interne de $ms ms"
    //% ms.defl=100
    export function blinkSooner(ms: number) {
        _last -= ms;
    }

}

//% color="#2699bf" weight=1
namespace neopixelBonus {
    
    //% block="afficher une vague sur $strip de longueur $width et de couleur $rgb pendant $duration ms"
    //% width.defl=10
    //% rgb.defl=2752386
    //% duration.defl=1000
    export function blinkWave(strip: neopixel.Strip, width: number, rgb: number, duration: number) {
        let red = (rgb >> 16) & 0xFF;
        let green = (rgb >> 8) & 0xFF;
        let blue = (rgb) & 0xFF;
        let n = strip.length();
        let t0 = input.runningTime();
        while (true) {
            let t = input.runningTime();
            let i_front = (t - t0) / duration * n;
            if (i_front >= n + width) break;
            for (let i = 0; i < n; i++) {
                let luminosity = 0;
                if (i <= i_front && i >= i_front - width) {
                    luminosity = 1 - (i_front - i) / width;
                }
                strip.setPixelColor(i, neopixel.rgb(
                    Math.floor(red * luminosity),
                    Math.floor(green * luminosity),
                    Math.floor(blue * luminosity)));
            }
            strip.show();
        }
        strip.showColor(neopixel.colors(NeoPixelColors.Black));
    }

}