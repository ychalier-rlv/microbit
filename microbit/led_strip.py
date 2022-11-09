from microbit import *
import neopixel
import time


class AutomatonController:

    def __init__(self, pin, n, rules):
        self.strip = neopixel.NeoPixel(pin, n)
        self.n = n
        self.rules = rules
        self.state = [0 for _ in range(self.n)]
        

    def setup(self):
        self.strip.clear()
        self.state = [0 for _ in range(self.n)]
        i0 = self.n // 2
        self.state[i0 - 1] = 1
        self.state[i0 + 1] = 1

    def update(self):
        next_state = []
        for i in range(self.n):
            j0 = (i - 1 + self.n) % self.n
            j1 = i
            j2 = (i + 1) % self.n
            key = "%d%d%d" % (self.state[j0], self.state[j1], self.state[j2])
            next_state.append(self.rules[key])
        self.state = next_state[:]

    def show(self):
        color = (255, 255, 255)
        if microphone.current_event() == SoundEvent.QUIET:
            color = (200, 0, 0)
        for i in range(self.n):
            if self.state[i] == 0:
                self.strip[i] = (0, 0, 0)
            else:
                self.strip[i] = color
        self.strip.show()


def lerp(c1, c2, t):
    '''Linearly interpolate RGB colors.
    Returns (1 - t) * c1 + t * c2,
    ie. c1 if t == 0 and c2 if t == 1.
    '''
    return (
        int((1 - t) * c1[0] + t * c2[0]),
        int((1 - t) * c1[1] + t * c2[1]),
        int((1 - t) * c1[2] + t * c2[2])
    )


class WaveController:

    def __init__(self, pin, n, steps, step=0.1, gap=0.1):
        self.strip = neopixel.NeoPixel(pin, n)
        self.n = n
        self.steps = steps
        self.state = 0
        self.step = step
        self.gap = gap

    def setup(self):
        self.state = 0

    def update(self):
        self.state += self.step

    def _color(self, t):
        k = int(t) % len(self.steps)
        l = t - int(t)
        return lerp(self.steps[k], self.steps[(k + 1) % len(self.steps)], l)

    def show(self):
        for i in range(self.n):
            self.strip[i] = self._color(self.state + i * self.gap)
        self.strip.show()


# controller = AutomatonController(pin1, 30, {
#     "000": 0,
#     "100": 1,
#     "010": 1,
#     "001": 1,
#     "110": 0,
#     "101": 1,
#     "011": 0,
#     "111": 0
# })

controller = WaveController(pin1, 30, [
    (204, 253, 4),
    (0, 255, 3),
    (117, 255, 255),
    (255, 115, 0),
    (255, 0, 244),
])

controller.setup()
controller.show()
while True:
    # time.sleep(.05)
    controller.update()
    controller.show()
