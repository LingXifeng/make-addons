import { system, world, BlockPermutation } from '@minecraft/server';
import { cardinalSides, getOppositeDirection } from './utils/helper';

class DoorManager {
  static COMPONENT_ID = 'item:door';

  static register(initEvent) {
    initEvent.blockComponentRegistry.registerCustomComponent(this.COMPONENT_ID, {
      onPlace: (e) => this.onPlace(e),
      beforeOnPlayerPlace: (e) => this.beforeOnPlayerPlace(e),
      onPlayerInteract: (e) => this.onPlayerInteract(e),
      onPlayerDestroy: (e) => this.onPlayerDestroy(e)
    });
  }

  static onPlace(e) {
    const { block } = e;

    if (block.permutation.getState('pa:part') === 'lower') {
      const aboveBlock = block.above();
      if (aboveBlock) {
        const upperPermutation = block.permutation.withState('pa:part', 'upper');
        aboveBlock.setPermutation(upperPermutation);
      }
    }
  }

  static onPlayerInteract(e) {
    const { block, dimension } = e;
    const isOpen = block.permutation.getState('pa:is_open');

    const halfDoor = block.permutation.getState('pa:part') === 'lower'
        ? block.above()
        : block.below();

    block.setPermutation(block.permutation.withState('pa:is_open', !isOpen));
    dimension.playSound(isOpen ? 'random.door_close' : 'random.door_open', block.location, { pitch: 1.0, volume: 0.4 });

    if (halfDoor?.permutation.matches(block.typeId)) {
      halfDoor.setPermutation(halfDoor.permutation.withState('pa:is_open', !isOpen));
    }
  }

  static beforeOnPlayerPlace(e) {
    const { block, permutationToPlace, face } = e;
    const oppFace = getOppositeDirection(face);

    const aboveBlock = block.above();
    const canBePlaced = aboveBlock.isAir || aboveBlock.isLiquid || oppFace === 'Down';

    if (!canBePlaced) {
      e.cancel = true;
      return;
    }

    const cardinalDirection = permutationToPlace.getState('minecraft:cardinal_direction');
    const sides = cardinalSides[cardinalDirection];
    const leftBlock = block[sides.left]();
    const rightBlock = block[sides.right]();

    const hasSideDoor = (sideBlock) => {
      try {
        return sideBlock.matches(permutationToPlace.type.id, { 'pa:part': 'lower' });
      } catch {
        return false;
      }
    }

    const isSideDoor = hasSideDoor(leftBlock) && !hasSideDoor(rightBlock);
    const hasRightBlock = rightBlock.isSolid || rightBlock.above().isSolid;

    const doorStates = {
      'minecraft:cardinal_direction': cardinalDirection,
      'pa:side': isSideDoor || hasRightBlock ? 'right' : 'left',
      'pa:part': 'lower',
      'pa:is_open': false
    };

    e.permutationToPlace = BlockPermutation.resolve(permutationToPlace.type.id, doorStates);
  }

  static onPlayerDestroy(e) {
    const { block, destroyedBlockPermutation } = e;

    const part = destroyedBlockPermutation.getState('pa:part');
    const halfDoor = part === 'lower' ? block.above() : block.below();

    
    if (halfDoor && halfDoor.permutation.matches(destroyedBlockPermutation.type.id)) {
      
      halfDoor.setPermutation(BlockPermutation.resolve('minecraft:air'));
    }
  }
}

system.beforeEvents.startup.subscribe(initEvent => {
  DoorManager.register(initEvent);
});