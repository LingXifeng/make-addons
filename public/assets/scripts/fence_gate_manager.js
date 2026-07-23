import { system } from '@minecraft/server';
import { getOppositeDirection } from './utils/helper';

class FenceGateManager {
  static COMPONENT_ID = 'item:fence_gate';
  static SOUND_OPEN = 'open.fence_gate';
  static SOUND_CLOSE = 'close.fence_gate';

  static init() {
    system.beforeEvents.startup.subscribe(initEvent => {
      initEvent.blockComponentRegistry.registerCustomComponent(this.COMPONENT_ID, {
        onPlayerInteract: e => this._handleInteract(e)
      });
    });
  }

  static _handleInteract(e) {
    const { block, dimension, face } = e;

    if (!block || !block.isValid) return;

    try {
      const isOpen = block.permutation.getState("pa:open");
      const sound = isOpen ? this.SOUND_CLOSE : this.SOUND_OPEN;

      const oppositeFace = getOppositeDirection(face).toLowerCase();
      let newPermutation = block.permutation.withState("pa:open", !isOpen);

      if (['north', 'south', 'east', 'west'].includes(oppositeFace)) {
        newPermutation = newPermutation.withState("minecraft:cardinal_direction", oppositeFace);
      }

      block.setPermutation(newPermutation);
      dimension.playSound(sound, block.center(), {
        pitch: 0.9,
        volume: 0.9,
      });
    } catch (error) { }
  }
}

FenceGateManager.init();