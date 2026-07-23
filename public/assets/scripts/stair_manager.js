import { system, Direction } from '@minecraft/server';
import { DirectionType, safeUpdateStairShape } from './utils/helper';
import { directionToVector3 } from './utils/math';

class StairManager {
  static COMPONENT_ID = 'item:stair';

  static init() {
    system.beforeEvents.startup.subscribe(initEvent => {
      initEvent.blockComponentRegistry.registerCustomComponent(this.COMPONENT_ID, {
        onPlace: e => this._handlePlace(e),
        beforeOnPlayerPlace: e => this._handleBeforePlace(e)
      });
    });
  }

  static _handlePlace(e) {
    const { block, dimension } = e;
    if (!block || !block.isValid) return;

    try {
      dimension.playSound("normal", block.location, { pitch: 0.8, volume: 1.0 });
    } catch (error) { }
  }

  static _handleBeforePlace(e) {
    let blockPermutation = e.permutationToPlace;

    try {
      const face = blockPermutation.getState('minecraft:cardinal_direction');
      const half = blockPermutation.getState('minecraft:vertical_half');

      if (face === 'south') {
        blockPermutation = blockPermutation.withState('pa:south', true);
      }

      for (const direction of DirectionType.HORIZONTAL) {
        try {
          const blockToCheck = e.block.offset(directionToVector3(direction));

          if (!blockToCheck || !blockToCheck.isValid) continue;
          if (blockToCheck.typeId !== blockPermutation.type.id) continue;

          const blockToCheckHalf = blockToCheck.permutation.getState('minecraft:vertical_half');
          if (blockToCheckHalf !== half) continue;

          const blockToCheckDirection = blockToCheck.permutation.getState('minecraft:cardinal_direction');

          blockPermutation = this._calculateShape(
            face, direction, blockToCheckDirection, blockPermutation, blockToCheck
          );
        } catch (error) { }
      }
    } catch (err) { }

    e.permutationToPlace = blockPermutation;
  }

  static _calculateShape(face, direction, checkDir, perm, blockToCheck) {
    let updatedPerm = perm;

    switch (face) {
      case 'north':
        if (direction === Direction.North) {
          if (checkDir === 'west') updatedPerm = updatedPerm.withState('pa:shape', 'outer_left');
          if (checkDir === 'east') updatedPerm = updatedPerm.withState('pa:shape', 'outer_right');
        } else if (direction === Direction.South) {
          if (checkDir === 'east') updatedPerm = updatedPerm.withState('pa:shape', 'inner_left');
          if (checkDir === 'west') updatedPerm = updatedPerm.withState('pa:shape', 'inner_right');
        } else if (direction === Direction.East) {
          if (checkDir === 'east') safeUpdateStairShape(blockToCheck, 'inner_right');
          if (checkDir === 'west') safeUpdateStairShape(blockToCheck, 'outer_right');
        } else if (direction === Direction.West) {
          if (checkDir === 'west') safeUpdateStairShape(blockToCheck, 'inner_left');
          if (checkDir === 'east') safeUpdateStairShape(blockToCheck, 'outer_left');
        }
        break;

      case 'south':
        if (direction === Direction.North) {
          if (checkDir === 'west') updatedPerm = updatedPerm.withState('pa:shape', 'inner_left');
          if (checkDir === 'east') updatedPerm = updatedPerm.withState('pa:shape', 'inner_right');
        } else if (direction === Direction.South) {
          if (checkDir === 'east') updatedPerm = updatedPerm.withState('pa:shape', 'outer_left');
          if (checkDir === 'west') updatedPerm = updatedPerm.withState('pa:shape', 'outer_right');
        } else if (direction === Direction.East) {
          if (checkDir === 'east') safeUpdateStairShape(blockToCheck, 'inner_left');
          if (checkDir === 'west') safeUpdateStairShape(blockToCheck, 'outer_left');
        } else if (direction === Direction.West) {
          if (checkDir === 'west') safeUpdateStairShape(blockToCheck, 'inner_right');
          if (checkDir === 'east') safeUpdateStairShape(blockToCheck, 'outer_right');
        }
        break;

      case 'east':
        if (direction === Direction.East) {
          if (checkDir === 'north') updatedPerm = updatedPerm.withState('pa:shape', 'outer_left');
          if (checkDir === 'south') updatedPerm = updatedPerm.withState('pa:shape', 'outer_right');
        } else if (direction === Direction.West) {
          if (checkDir === 'south') updatedPerm = updatedPerm.withState('pa:shape', 'inner_left');
          if (checkDir === 'north') updatedPerm = updatedPerm.withState('pa:shape', 'inner_right');
        } else if (direction === Direction.North) {
          if (checkDir === 'north') safeUpdateStairShape(blockToCheck, 'inner_left');
          if (checkDir === 'south') safeUpdateStairShape(blockToCheck, 'outer_left');
        } else if (direction === Direction.South) {
          if (checkDir === 'north') safeUpdateStairShape(blockToCheck, 'outer_right');
          if (checkDir === 'south') safeUpdateStairShape(blockToCheck, 'inner_right');
        }
        break;

      case 'west':
        if (direction === Direction.East) {
          if (checkDir === 'north') updatedPerm = updatedPerm.withState('pa:shape', 'inner_left');
          if (checkDir === 'south') updatedPerm = updatedPerm.withState('pa:shape', 'inner_right');
        } else if (direction === Direction.West) {
          if (checkDir === 'south') updatedPerm = updatedPerm.withState('pa:shape', 'outer_left');
          if (checkDir === 'north') updatedPerm = updatedPerm.withState('pa:shape', 'outer_right');
        } else if (direction === Direction.North) {
          if (checkDir === 'north') safeUpdateStairShape(blockToCheck, 'inner_right');
          if (checkDir === 'south') safeUpdateStairShape(blockToCheck, 'outer_right');
        } else if (direction === Direction.South) {
          if (checkDir === 'north') safeUpdateStairShape(blockToCheck, 'outer_left');
          if (checkDir === 'south') safeUpdateStairShape(blockToCheck, 'inner_left');
        }
        break;
    }

    return updatedPerm;
  }
}

StairManager.init();