from dpongpy.model import Pong, Config
from dpongpy.controller.local import PongLocalController as PongController
import pygame
from dataclasses import dataclass, field


@dataclass
class Settings:
    config: Config = field(default_factory=Config)
    debug: bool = False
    size: tuple = (800, 600)
    fps: int = 60
    port: int = None


class PongGame:
    def __init__(self, settings: Settings = None):
        self.settings = settings or Settings()
        self.pong = Pong(size=self.settings.size, config=self.settings.config)
        self.view = self.create_view()
        self.clock = pygame.time.Clock()
        self.running = True
        self.controller = self.create_controller()

    def create_view(self):
        from dpongpy.view import ScreenPongView
        return ScreenPongView(self.pong, debug=self.settings.debug)

    def create_controller(self):
        from dpongpy.controller.local import PongLocalController

        class Controller(PongLocalController):
            def __init__(this):
                super().__init__(self.pong)

            def on_game_over(this, _):
                self.running = False

        return Controller()

    def before_run(self):
        pygame.init()

    def after_run(self):
        pygame.quit()

    def at_each_run(self):
        pygame.display.flip()

    def run(self):
        dt = 0
        self.before_run()
        while self.running:
            self.controller.handle_inputs(dt)
            self.controller.handle_events()
            self.view.render()
            self.at_each_run()
            dt = self.clock.tick(self.settings.fps) / 1000
        self.after_run()
