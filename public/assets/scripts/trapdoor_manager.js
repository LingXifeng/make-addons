import { system } from '@minecraft/server';

class TrapdoorManager {
  static COMPONENT_ID = 'item:trapdoor';

  static SOUND_OPEN = 'open.wooden_trapdoor';
  static SOUND_CLOSE = 'close.wooden_trapdoor';

  static init() {
    system.beforeEvents.startup.subscribe(initEvent => {
      initEvent.blockComponentRegistry.registerCustomComponent(this.COMPONENT_ID, {
        onPlayerInteract: e => this._handleInteract(e)
      });
    });
  }

  static _handleInteract(e) {
    const { block, dimension } = e;

    if (!block || !block.isValid) return;

    try {
      const isOpen = block.permutation.getState("pa:open");
      const sound = isOpen ? this.SOUND_CLOSE : this.SOUND_OPEN;

      block.setPermutation(block.permutation.withState("pa:open", !isOpen));

      dimension.playSound(sound, block.center(), {
        pitch: 0.9,
        volume: 0.9,
      });
    } catch (error) { }
  }
}

TrapdoorManager.init();