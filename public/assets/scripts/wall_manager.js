import { system } from '@minecraft/server';
import { getOppositeDirection, DirectionType, shouldConnect } from './utils/helper';
import { directionToVector3 } from './utils/math';

class WallManager {
    static COMPONENT_ID = 'item:wall';

    static init() {
        system.beforeEvents.startup.subscribe(initEvent => {
            initEvent.blockComponentRegistry.registerCustomComponent(this.COMPONENT_ID, {
                onPlayerBreak: e => this._handleBreak(e),
                onPlace: e => this._handlePlace(e),
                beforeOnPlayerPlace: e => this._handleBeforePlace(e)
            });
        });
    }

    static _handleBreak(e) {
        const { block } = e;

        for (const direction of DirectionType.HORIZONTAL) {
            const directionOpposite = getOppositeDirection(direction);

            try {
                const blockToCheck = block.offset(directionToVector3(directionOpposite));
                
                if (!blockToCheck || !blockToCheck.isValid) continue;

                const stateName = `pa:${direction.toLowerCase()}`;
                
                if (blockToCheck.permutation.getState(stateName) === true) {
                    blockToCheck.setPermutation(blockToCheck.permutation.withState(stateName, false));
                }
            } catch (error) { }
        }
    }

    static _handlePlace(e) {
        const { block } = e;

        for (const direction of DirectionType.HORIZONTAL) {
            const directionOpposite = getOppositeDirection(direction);

            try {
                const blockToCheck = block.offset(directionToVector3(directionOpposite));
                
                if (!blockToCheck || !blockToCheck.isValid) continue;

                if (shouldConnect(blockToCheck)) {
                    const stateName = `pa:${direction.toLowerCase()}`;
                    
                    if (blockToCheck.permutation.getState(stateName) === false) {
                        blockToCheck.setPermutation(blockToCheck.permutation.withState(stateName, true));
                    }
                }
            } catch (error) { }
        }
    }

    static _handleBeforePlace(e) {
        const { block } = e;

        let perm = e.permutationToPlace.withState("pa:in_world", true);

        for (const direction of DirectionType.HORIZONTAL) {
            const directionOpposite = getOppositeDirection(direction);

            try {
                const blockToCheck = block.offset(directionToVector3(directionOpposite));
                
                if (!blockToCheck || !blockToCheck.isValid) continue;

                const canConnect = shouldConnect(blockToCheck);
                perm = perm.withState(`pa:${directionOpposite.toLowerCase()}`, canConnect);
            } catch (error) { }
        }

        e.permutationToPlace = perm;
    }
}

WallManager.init();